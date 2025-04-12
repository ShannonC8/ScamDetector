from flask import Flask, request, jsonify
import openai
import os

app = Flask(__name__)
openai.api_key = os.environ.get("OPENAI_API_KEY")  # Load from env or hardcode temporarily

@app.route("/analyze", methods=["POST"])
def analyze_email():
    data = request.json
    email_text = data.get("emailText", "")

    if not email_text:
        return jsonify({"error": "No email text provided"}), 400

    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an AI assistant that detects scam content in email messages."},
            {"role": "user", "content": f"Is the following email a scam? Reply only with 'Scam' or 'Not a scam'. Email:\n{email_text}"}
        ],
        temperature=0.2
    )

    reply = response["choices"][0]["message"]["content"].strip()
    return jsonify({"result": reply})
