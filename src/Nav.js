import "./App.css";
import { useState, useEffect } from "react";
import { fetch } from "./util";

function Nav() {
  return (
    <div className="Nav">
      <div>Login</div>
      <div>Register</div>
    </div>
  );
}

export default Nav;
