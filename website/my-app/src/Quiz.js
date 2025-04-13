import './Quiz.css';
import NavBar from "./NavBar";
import React, { useState } from "react";

const questions = [
  {
    email: `Subject: Urgent Action Required – Account Locked

Dear Customer,

We have detected suspicious activity in your bank account and, for your protection, have temporarily suspended access. It appears that there have been multiple unauthorized login attempts from an unrecognized device in a foreign country.

To reactivate your account and verify your identity, please click the link below and follow the instructions:

http://secure-banking-login.com/verify

If you do not take action within 24 hours, your account will be permanently disabled.

Sincerely,  
Bank Security Team`,
    isScam: true,
  },
  {
    email: `Subject: Welcome to State University – Account Setup Instructions

Hi Shreya,

We’re excited to welcome you to State University! Please visit the Student Portal to review your class schedule, upload a profile photo, and update your emergency contact information.

👉 Access your portal here: https://students.stateuniversity.edu/login  
If you have any questions, feel free to reach out to ithelp@stateuniversity.edu.

Looking forward to seeing you on campus!  
– Office of the Registrar`,
    isScam: false,
  },
  {
    email: `Subject: 🎉 You’ve Been Selected to Win an iPhone 15!

Hi there!

As part of our 10-year anniversary celebration, your email was randomly selected in our prize giveaway! You are eligible to receive a brand new iPhone 15 — but you must act fast!

👉 Confirm your prize now: http://exclusive-offer-claim.com/iphone  
There are only 10 phones left, and this offer expires in 3 hours.

Don’t miss your chance to be one of the lucky few!

Best regards,  
The Rewards Team`,
    isScam: true,
  },
  {
    email: `Subject: [Team Update] Schedule Change for This Week

Hey team,

Quick heads-up — our usual Thursday team sync has been moved to **Wednesday at 3 PM** to accommodate some scheduling conflicts.

Please check the updated agenda in the #team-meetings Slack channel and let me know if you have any conflicts. The calendar invite has also been updated.

Thanks!  
– Alex`,
    isScam: false,
  }
];


function Quiz() {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [completed, setCompleted] = useState(false);

  const handleAnswer = (userAnswer) => {
    const isCorrect = questions[index].isScam === userAnswer;
    setFeedback(isCorrect ? "✅ Correct!" : "❌ Incorrect.");
    setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex(index + 1);
        setFeedback("");
      } else {
        setCompleted(true);
      }
    }, 1000);
  };

  if (completed) {
    return (
      <div className="quiz-container">
        <h2>🎉 You've completed the quiz!</h2>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="quiz-container">
      <h1 className="quiz-title"> 📧 Email Scam Quiz </h1>
      <div className="question-box">
        <p><strong>Email #{index + 1}</strong></p>
        <pre className="email-content">{questions[index].email}</pre>
        <button className="scam" onClick={() => handleAnswer(true)}>Scam</button>
        <button className="not-scam" onClick={() => handleAnswer(false)}>Not a Scam</button>
        <div className="feedback">{feedback}</div>
      </div>
    </div>
    </div>
  );
}

export default Quiz;
