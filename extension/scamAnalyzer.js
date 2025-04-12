export async function analyzeWithGroq(emailText) {
    const apiKey = 'YOUR_GROQ_API_KEY';
  
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          { role: "system", content: "You are an AI assistant that detects scam content in email messages." },
          { role: "user", content: `Is the following email a scam? Reply only with 'Scam' or 'Not a scam'. Email:\n${emailText}` }
        ],
        temperature: 0.2
      })
    });
  
    const data = await response.json();
    return data.choices?.[0]?.message?.content.trim();
  }
  