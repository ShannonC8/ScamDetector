import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Home from './home';
import Stats from './Stats';
import ScamHelp from './ScamHelp/ScamHelp';
import Resources from './Resources';

import reportWebVitals from './reportWebVitals';

import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = "852863638003-30ck24ecju7d0f6q9a3567jmn589iami.apps.googleusercontent.com"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId={clientId}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<Home />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/scamhelp" element={<ScamHelp />} />
        <Route path="/resources" element={<Resources />} />
      </Routes>
    </BrowserRouter>
  </GoogleOAuthProvider>,
  document.getElementById("root")
);


