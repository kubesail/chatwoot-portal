// import "./Login.css";
import { useState, useEffect } from "react";
import { fetch } from "./util";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [action, setAction] = useState("login");

  const login = async function (e) {
    e.preventDefault();
    await fetch("/platform/customer/login", {
      method: "POST",
      body: { email, password },
    });
  };

  const register = async function (e) {
    e.preventDefault();
    await fetch("/platform/customer/register", {
      method: "POST",
      body: { email, password },
    });
  };

  return (
    <div className="Login">
      <form onSubmit={action === "login" ? login : register}>
        <div className="input">
          <input
            type="text"
            name="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password" className="input-label">
            Password
          </label>
        </div>
        <div className="input">
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="password" className="input-label">
            Password
          </label>
        </div>

        <button type="submit">
          {action === "register" ? "Sign Up" : "Login"}
        </button>

        {action === "register" ? (
          <div>
            Already have an account?{" "}
            <a onClick={() => setAction("login")}>Login</a>
          </div>
        ) : (
          <div>
            Need an account?{" "}
            <a onClick={() => setAction("register")}>Sign Up</a>
          </div>
        )}
      </form>
    </div>
  );
}

export default Login;
