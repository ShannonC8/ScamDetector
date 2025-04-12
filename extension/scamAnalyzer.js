import OpenAI from "openai"
const client = new OpenAI();

export async function analyzeWithOpenAI(emailText) {

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
      {
          role: "system",
          content: "You are an AI assistant that detects scam content in email messages."
      },
      {
          role: "user",
          content: `Is the following email a scam? Reply only with 'Scam' or 'Not a scam'. Email:\n${emailText}`
      }
      ],
      temperature: 0.2
    });
  
    return response.choices[0].message.content.trim();
  }
  