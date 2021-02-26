// import "./Settings.css";
import { useState, useEffect } from "react";
import { fetch } from "./util";

function Settings() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [action, setAction] = useState("Settings");

  const updateSettings = async function (e) {
    e.preventDefault();
    await fetch("/platform/customer/register", {
      method: "POST",
      body: { email, password },
    });
  };

  return (
    <div className="Settings">
      <form onSubmit={updateSettings}>
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
          {action === "register" ? "Sign Up" : "Settings"}
        </button>

        {action === "register" ? (
          <div>
            Already have an account?{" "}
            <a onClick={() => setAction("Settings")}>Settings</a>
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

export default Settings;
