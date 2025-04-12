import React, { useState } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import './ScamHelp.css';

import UnitedStatesInfo from './country-content/UnitedStatesInfo';
import CanadaInfo from './country-content/CanadaInfo';
import UKInfo from './country-content/UKInfo';
import AustraliaInfo from './country-content/AustraliaInfo';
import NewZealandInfo from './country-content/NewZealandInfo';
import SingaporeInfo from './country-content/SingaporeInfo';

const countries = [
  { name: 'United States', flag: 'us.png', content: <UnitedStatesInfo /> },
  { name: 'Canada', flag: 'canada.png', content: <CanadaInfo /> },
  { name: 'United Kingdom', flag: 'uk.png', content: <UKInfo /> },
  { name: 'Australia', flag: 'au.png', content: <AustraliaInfo /> },
  { name: 'New Zealand', flag: 'nz.png', content: <NewZealandInfo /> },
  { name: 'Singapore', flag: 'singapore.png', content: <SingaporeInfo /> },
];

export default function ScamHelp() {
  const [open, setOpen] = useState(false);
  const [activeContent, setActiveContent] = useState(null);

  const openModal = (content) => {
    setActiveContent(content);
    setOpen(true);
  };

  return (
    <div className="container">
      <h1 className="title">Phishnet - What To Do If You've Been Scammed</h1>
      <p className="subtitle">Choose your country for reporting and recovery information.</p>

      <div className="country-grid">
        {countries.map((country) => (
          <div
            key={country.name}
            className="country-box"
            onClick={() => openModal(country.content)}
          >
            <img
              src={`/flags/${country.flag}`}
              alt={`${country.name} flag`}
              className="flag"
            />
            <span className="country-name">{country.name}</span>
          </div>
        ))}
      </div>

      <Popup open={open} closeOnDocumentClick onClose={() => setOpen(false)} modal
        overlayStyle={{ background: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        contentStyle={{
            padding: 0,
            border: 'none',
            background: 'transparent',
            boxShadow: 'none',
            maxWidth: '100%',
            display: 'flex',
            justifyContent: 'center'
        }}>
        <div className="popup-modal">
          <div className="popup-header">Phishnet - Scam Help</div>
          <div className="popup-content">{activeContent}</div>
          <button className="close-btn" onClick={() => setOpen(false)}>Close</button>
        </div>
      </Popup>
    </div>
  );
}