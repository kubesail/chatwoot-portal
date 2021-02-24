import "./App.css";
import Login from "./Login";
import { useState, useEffect } from "react";
import { fetch } from "./util";

let originOverride;
try {
  window.localStorage.getItem("origin");
} catch {}

function App() {
  const [profile, setProfile] = useState(null);
  const [platform, setPlatform] = useState(null);
  useEffect(() => {
    async function fetchProfile() {
      let { json, status } = await fetch("/platform/customer/profile");
      setProfile(json);
    }
    async function fetchPublicPlatform() {
      let { json, status } = await fetch("/platform", {
        query: { origin: originOverride },
        credentials: "omit",
      });
      setPlatform(json);
    }
    fetchPublicPlatform();
    fetchProfile();
  }, []);

  const login = function (e) {
    e.preventDefault();
    console.log("Submitted");
  };

  return (
    <div className="App-container">
      <div className="App-background"></div>
      <div className="App">
        <div className="App-header">
          <h2>{platform ? platform.name : "platform not found..."}</h2>
          {platform && <img src={platform.logo} />}
          <p>Profile: {JSON.stringify(profile)}</p>
        </div>
        <div className="App-form">
          <Login />
        </div>
      </div>
    </div>
  );
}

export default App;
