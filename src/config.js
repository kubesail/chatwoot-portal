// @flow

export const API_TARGET =
  process.env.REACT_APP_API_TARGET || window.origin + "/api";
export const WWW_TARGET =
  process.env.REACT_APP_WWW_TARGET || "https://platform.kubesail.com";
export const COMMIT_HASH = process.env.REACT_APP_COMMIT_HASH || "dev";
window.COMMIT_HASH = COMMIT_HASH;
export const WSS_TARGET =
  process.env.REACT_APP_WSS_TARGET || "wss://platform-watch.kubesail.com";
