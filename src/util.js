import React from "react";
import { Route } from "react-router-dom";
// import Cookies from "js-cookie";
import { API_TARGET, COMMIT_HASH } from "./config";

export function signOutHandler() {
  console.error("Signout");
}

export const fetch = async (targetUri, options = { headers: {} }) => {
  const uri = API_TARGET + targetUri;

  if (!options.headers) options.headers = {};
  options.headers["x-commit-hash"] = COMMIT_HASH;

  let body = options.body;
  if (!options.form) {
    options.headers["content-type"] = "application/json";
    if (typeof options.body === "object") body = JSON.stringify(options.body);
  }

  const targetURL = new URL(uri);
  options.query &&
    Object.keys(options.query).forEach((key) => {
      if (options.query[key] === undefined) {
        delete options.query[key];
      }
    });
  targetURL.search = new URLSearchParams(options.query);

  const opts = Object.assign({}, options, { body, credentials: "include" });
  let json = {};
  let status;
  let headers = {};
  let res;
  const target = targetURL.toString();
  try {
    res = await window.fetch(targetURL, opts);
    status = res.status;
    headers = res.headers;
  } catch (err) {
    return { status: err, json };
  }
  if (!res) throw new Error("API Fetch - no response");
  else if (status === 401) signOutHandler();
  else if (status === 204) return { status, json: {} };
  else {
    try {
      json = await res.json();
    } catch (err) {
      // Ignore abort errors, we dont care.
      if (err.name === "AbortError") return { status };
      console.error("apiFetch() failed to parse JSON!", {
        status: res.status,
        target,
        errCode: err.code,
        errMsg: err.message,
        errName: err.name,
        hasAbortController: !!window.AbortController,
      });
      // If the API simply returned invalid JSON, don't crash the application (Backend should also print an error)
      if (err.name !== "TypeError" && res.status !== 200) throw err;
    }
  }

  return { status, json, headers };
};

// export const toast = (opts) => {
//   const toastStack = store.getState().toastStack;
//   if (typeof opts !== "object")
//     throw new Error("Toast must be called with object params");
//   const { type = "info", msg, subMsg, err = null, timeout = 8000 } = opts;
//   const persistent = type === "error" || opts.persistent;
//   if (type === "error" && err)
//     console.error("Toast Error | " + msg + " | " + err !== msg ? err : "");
//   const id = Math.random();
//   store.dispatch({
//     type: "TOAST",
//     toastStack: [...toastStack, { type, msg, subMsg, id, persistent }],
//   });
//   if (!persistent) {
//     window.setTimeout(() => {
//       const toastStack = store.getState().toastStack;
//       store.dispatch({
//         type: "TOAST",
//         toastStack: toastStack.filter((toast) => toast.id !== id),
//       });
//     }, timeout);
//   }
//   return id;
// };

// Solution for rendering props into react-router components comes from
// https://github.com/ReactTraining/react-router/issues/4105#issuecomment-289195202
const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest);
  return React.createElement(component, finalProps);
};

export function PropsRoute({ component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(routeProps) => {
        return renderMergedProps(component, routeProps, rest);
      }}
    />
  );
}
