import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import './App.css';
import { useNavigate, Link } from "react-router-dom";
import phish from './assets/goldfish.gif'

function App() {
  const navigate = useNavigate();

  const handleLoginSuccess = (credentialResponse) => {
    const { credential } = credentialResponse;
    const profile = jwtDecode(credential);
    console.log("User Info:", profile);

    localStorage.setItem("token", credential);
    localStorage.setItem("email", profile.email);
    localStorage.setItem("name", profile.name);
    localStorage.setItem("picture", profile.picture);
    navigate("/home");
  };

  const handleLoginError = () => {
    console.log("Google Login Failed");
  };

  return (
    <div className="centerCard">
      <div className="card">
        <p className="bigtitle">PhishNet</p>
        <img className="phish" src={phish} alt="loading..." />
        <p className="title2">Sign In</p>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
        />
      </div>
    </div>
  );
}

export default App;
