from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
import re

app = Flask(__name__)
CORS(app)

openai.api_key = os.environ.get("OPENAI_API_KEY")

@app.route("/analyze", methods=["POST"])
def analyze_email():
    data = request.json
    email_text = data.get("emailText", "")

    if not email_text:
        return jsonify({"error": "No email text provided"}), 400

    client = openai.OpenAI()

    # Ask for plain text response in structured format
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are a scam detection AI."
            },
            {
                "role": "user",
                "content": f"""
                Analyze the following email for scams and return a simple response.

                Use this exact format (no JSON, no markdown):
                Scam Score: <integer from 0 to 100>
                Reason: <short reason>
                Highlight: <if exists suspicious sentence or phrase>

                Email:
                {email_text}
                                """
                            }
        ],
        temperature=0.2
    )


    responseBackup = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are a scam detection AI."
            },
            {
                "role": "user",
                "content": f"""
                Analyze the following email for scams and return a simple response.

                Use this exact format (no JSON, no markdown):
                Scam Score: <integer from 0 to 100>
                Reason: <short reason>
                Email:
                {email_text}
                                """
                            }
        ],
        temperature=0.2
    )

    
    try:
        reply = response.choices[0].message.content.strip()
        print("\n[RAW GPT RESPONSE]:\n", reply)
        # Parse values from GPT reply using regex
        score_match = re.search(r"Scam Score:\s*(\d+)", reply)
        reason_match = re.search(r"Reason:\s*(.*)", reply)
        highlight_match = re.search(r"Highlight:\s*(.*)", reply)

        if not (score_match and reason_match and highlight_match):
            return jsonify({"error": "Unable to parse GPT response", "raw": reply}), 500

        result = {
            "score": int(score_match.group(1)),
            "reason": reason_match.group(1).strip(),
            "highlight": highlight_match.group(1).strip()
        }
        result = jsonify(result)
        return result
    
    except Exception as e:
        reply = responseBackup.choices[0].message.content.strip()
        print("\n[RAW GPT RESPONSE]:\n", reply)
        # Parse values from GPT reply using regex
        score_match = re.search(r"Scam Score:\s*(\d+)", reply)
        reason_match = re.search(r"Reason:\s*(.*)", reply)

        if not (score_match and reason_match and highlight_match):
            return jsonify({"error": "Unable to parse GPT response", "raw": reply}), 500

        result = {
            "score": int(score_match.group(1)),
            "reason": reason_match.group(1).strip(),
            "highlight": ""
        }
        result = jsonify(result)
        return result

if __name__ == "__main__":
    app.run(debug=True)
