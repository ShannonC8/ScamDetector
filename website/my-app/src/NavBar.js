import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import './NavBar.css';

function NavBar() {
  const [showProfile, setShowProfile] = useState(false);
  const profilePic = localStorage.getItem("picture");
  const email = localStorage.getItem("email");
  const name = localStorage.getItem("name");

  const dropdownRef = useRef(null);

  // Close dropdown if clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }

    if (showProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfile]);

  const toggleProfile = () => setShowProfile(!showProfile);

  return (
    <>
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/home">🐟 PhishNet</Link>
      </div>
      <div className="nav-links">
        <Link to="/contact">Contact Us</Link>
        {profilePic && (
          <img
            src={profilePic}
            alt="Profile"
            className="profile-icon"
            onClick={toggleProfile}
          />
        )}
      </div>
    </nav>

    {showProfile && (
        <div className="profile-dropdown" ref={dropdownRef}>
          <p className="profile-email">{email}</p>
          <div className="profile-img-wrapper">
            <img src={profilePic} className="profile-dropdown-pic" />
          </div>
          <p className="profile-greeting"><strong> Hi, {name || "User"}!</strong></p>
          <hr />
          <Link to="/" className="signout-link">Sign Out</Link>
        </div>
      )}
    </>
  );
}

export default NavBar;
