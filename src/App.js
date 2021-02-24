import "./App.css";
import { useState, useEffect } from "react";
import { fetch } from "./util";

function App() {
  const [profile, setProfile] = useState(null);
  const [platform, setPlatform] = useState(null);
  useEffect(() => {
    async function fetchProfile() {
      let { json, status } = await fetch("/platform/customer/profile");
      setProfile(json);
    }
    async function fetchPublicPlatform() {
      const testOrigin = "https://dan.platform.kubesail.com";
      let { json, status } = await fetch("/platform", {
        query: { origin: testOrigin },
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
    <div className="App">
      <header className="App-header">
        <h2>Platform: {platform ? platform.name : "platform not found..."}</h2>
        {platform && <img src={platform.logo} />}
        <p>Profile: {JSON.stringify(profile)}</p>
        <form onSubmit={login}>
          <input type="text" name="email" placeholder="email" />
          <input type="password" name="password" placeholder="password" />
        </form>
      </header>
    </div>
  );
}

export default App;
