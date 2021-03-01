// import "./Settings.css";
import { useState, useEffect } from "react";
import { fetch } from "./util";

function Settings({ logout, variableMetadata = {} }) {
  // const [email, setEmail] = useState("");

  const updateSettings = async function (e) {
    e.preventDefault();
    // await fetch("/platform/customer/register", {
    //   method: "POST",
    //   body: { email, password },
    // });
  };

  return (
    <div className="Settings">
      <form onSubmit={updateSettings}>
        {Object.keys(variableMetadata).map((variable) => {
          return (
            <div className="input" key={variable}>
              {variable}
              <input
                type="text"
                id={variable}
                name={variable}
                placeholder={variableMetadata[variable]}
                // value={password}
                // onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password" className="input-label">
                {variable}
              </label>
            </div>
          );
        })}

        <button className="plain" type="submit">
          Save
        </button>
      </form>
      <div className="logout">
        <button className="plain" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}

export default Settings;
