import React from "react";
import { GoogleLogin } from "@react-oauth/google";
// import jwt_decode from "jwt-decode";
import './App.css';
import { useNavigate, Link } from "react-router-dom";
import phish from './assets/goldfish.gif'

function App() {
  const navigate = useNavigate();

  const handleLoginSuccess = (credentialResponse) => {
    const { credential } = credentialResponse;
    // const userInfo = jwt_decode(credential);
    // console.log("User Info:", userInfo);
    localStorage.setItem("token", credential);
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
