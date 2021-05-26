import { useState } from "react";
import { fetch } from "./util";
import "./Login.css";

function Login({ setLoggedIn, platform }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [action, setAction] = useState("register");
  const [formError, setFormError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const login = async function (register = false) {
    if (loggingIn) return;
    if (!email) return setFieldError("email");
    else if (!password) return setFieldError("password");
    else setFieldError("");

    setLoggingIn(true);
    const { json } = await fetch(
      `/platform/customer/${register ? "register" : "login"}`,
      { method: "POST", body: { email, password } }
    );
    if (json && json.error) {
      setFormError(json.error);
    } else {
      setFormError("");
      setLoggedIn(true);
    }
    setLoggingIn(false);
  };

  return (
    <div className="Login">
      {action === "login" ? (
        <div>
          <h2>Login to your account</h2>
        </div>
      ) : (
        <div>
          <h2>Create an Account</h2>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login(action === "register");
        }}
      >
        <div className="input">
          <label className="input-label">
            <span>Email</span>
            <input
              type="text"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldError === "email" ? "error" : ""}
            />
          </label>
        </div>
        <div className="input">
          <label className="input-label">
            <span>Password</span>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldError === "password" ? "error" : ""}
            />
          </label>
        </div>

        {formError ? <div className="form-error">{formError}</div> : null}

        <div>
          <button className="button" type="submit">
            {loggingIn
              ? "Working..."
              : action === "register"
              ? "Sign Up"
              : "Login"}
          </button>
        </div>
      </form>
      <div className="note">
        {action === "register"
          ? "Already have an account?"
          : "Need an account?"}
        <button
          className="plain"
          onClick={() => {
            setFieldError("");
            setFormError("");
            setAction(action === "register" ? "login" : "register");
          }}
        >
          {action === "register" ? "Login" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}

export default Login;
