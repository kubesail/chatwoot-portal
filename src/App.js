import Cookies from "js-cookie";
import "./App.css";
import Login from "./Login";
import Settings from "./Settings";
import { useState, useEffect } from "react";
import { fetch } from "./util";

let originOverride;
try {
  window.localStorage.getItem("origin");
} catch {}

function App() {
  const [profile, setProfile] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [isLoggedIn, setLoggedIn] = useState(
    Cookies.get("kubesail-platform-customer")
  );

  async function fetchProfile() {
    let { json, status } = await fetch("/platform/customer/profile");
    if (status !== 200) {
      return setProfile(null);
    }
    setProfile(json);
  }

  async function fetchPublicPlatform() {
    let { json, status } = await fetch("/platform", {
      query: { origin: originOverride },
      credentials: "omit",
    });
    setPlatform(json);
  }

  useEffect(() => {
    fetchPublicPlatform();
    if (isLoggedIn) fetchProfile();
  }, [isLoggedIn]);

  return (
    <div className="App-container">
      <div className="App-background"></div>
      <div className="App">
        <div className="App-header">
          <h2>{platform ? platform.name : "Loading..."}</h2>
          {platform && <img alt={`${platform.name}`} src={platform.logo} />}
          {isLoggedIn && profile && (
            <div className="profile">
              <div>{profile?.customer?.email}</div>
            </div>
          )}
        </div>
        <div className="App-form">
          {isLoggedIn && profile && platform ? (
            <Settings
              variableMetadata={platform.plans[0].variableMetadata}
              logout={() => {
                Cookies.remove("kubesail-platform-customer");
                setLoggedIn(null);
              }}
            />
          ) : (
            <Login setLoggedIn={setLoggedIn} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
