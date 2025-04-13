import './Contact.css';
import React from "react";
import NavBar from "./NavBar";

function Contact() {
  return (
    <div>
      <NavBar />
      <div className="contact-container">
        <h1 className="contact-title">🙋‍♀️Have Questions?</h1>
        <p className="contact-subtitle">We’re here to help. Reach out and we’ll get back to you shortly.</p>
        <div className="contact-info">
        <p><strong>Email:</strong> <a href="mailto:revanurshreya@gmail.com">revanurshreya@gmail.com</a></p>
        <p><strong>Phone:</strong> (510) 771-4999</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
