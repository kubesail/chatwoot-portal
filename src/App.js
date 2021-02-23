import "./App.css";
import { useState, useEffect } from "react";
import { fetch } from "./util";

function App() {
  const [profile, setProfile] = useState(null);
  useEffect(async () => {
    let fetchedProfile = await fetch("/platform/customer/profile");
    setProfile(fetchedProfile);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
