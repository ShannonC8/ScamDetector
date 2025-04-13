import './home.css';
import React from "react";
import NavBar from "./NavBar";
import { Link } from 'react-router-dom';
import phish from './assets/goldfish.gif'

function Home() {
  return (
    <div>
      <NavBar />
      <div className="welcome-container">
        <div className="welcome">
          <h1 className="contact-title4">Welcome to PhishNet</h1>
          <p className="contact-subtitle2">With our web browser extension and dedicated website, protecting yourself from phishing scams has never been simpler. Analyze emails in seconds, get clear insights into potential threats, and stay secure. PhishNet makes email safety effortless.</p>
        </div>
        <div className="welcome-image">
          <img src={phish} alt="Welcome visual" />
        </div>
      </div>
      <div className="button-container">
        <Link to="/stats"><button>Get Stats 📈</button></Link>
        <Link to="/quiz"><button>Take Quiz 📝 </button></Link>
        <Link to="/scamhelp"><button>Resources 📚</button></Link>
      </div>
    </div>
  );
}


export default Home;
