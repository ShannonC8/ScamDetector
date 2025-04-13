import React from 'react';

export default function UnitedStatesInfo() {
  return (
    <div>
      <h2>United States - Scam Reporting</h2>
      <p>If you've been scammed in the U.S., take these steps:</p>

      <h3>1. Report the Scam</h3>
      <ul>
        <li>
          <strong>Federal Trade Commission (FTC):</strong>{' '}
          <a href="https://reportfraud.ftc.gov/" target="_blank" rel="noreferrer">
            reportfraud.ftc.gov
          </a>
        </li>
        <li>
          <strong>FBI Internet Crime Complaint Center (IC3):</strong>{' '}
          <a href="https://www.ic3.gov/" target="_blank" rel="noreferrer">
            ic3.gov
          </a>
        </li>
        <li>
          <strong>State Attorney General:</strong> Most states have a consumer protection division where you can file a complaint.
        </li>
      </ul>

      <h3>2. Protect Yourself</h3>
      <ul>
        <li>Change passwords for affected accounts.</li>
        <li>Contact your bank or credit card company to report fraud.</li>
        <li>Place a fraud alert with one of the credit bureaus (Equifax, Experian, TransUnion).</li>
      </ul>

      <h3>3. Track the Scam</h3>
      <ul>
        <li>Save emails, messages, or payment details from the scam.</li>
        <li>Take screenshots as proof.</li>
      </ul>

      <h3>4. Get Support</h3>
      <p>
        You can call the <strong>National Elder Fraud Hotline</strong> if you're a senior or helping one: <a href="tel:1-833-372-8311">1-833-FRAUD-11</a>
      </p>
    </div>
  );
}
