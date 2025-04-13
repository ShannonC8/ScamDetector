import React from "react";
import { Link } from "react-router-dom";
import './NavBar.css';

function NavBar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">🐟 PhishNet</Link>
      </div>
      <div className="nav-links">
        <Link to="/help">Help</Link>
        <Link to="/stats">Stats</Link>
        <Link to="/resources">Resources</Link>
      </div>
    </nav>
  );
}

export default NavBar;
