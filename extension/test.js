import { analyzeWithOpenAI } from "./scamAnalyzer.js";

async function runTest() {
  const fakeEmail = `
    Congratulations! You've won a $1000 gift card. Click the link below to claim your prize.
    http://totally-not-a-scam.com
  `;

  try {
    const result = await analyzeWithOpenAI(fakeEmail);
    console.log("Result:", result);
  } catch (error) {
    console.error("Error analyzing email:", error);
  }
}

runTest();
