from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
import re
import firebase_admin
from firebase_admin import credentials, auth, firestore
import json
import datetime

app = Flask(__name__)
CORS(app, supports_credentials=True)

openai.api_key = os.environ.get("OPENAI_API_KEY")

cred = credentials.Certificate("firebase-cred.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    name = data.get("name")
    photo = data.get("picture")

    users_ref = db.collection('users')
    user_doc = users_ref.document(email).get()

    if not user_doc.exists:
        users_ref.document(email).set({
            'name': name,
            'email': email,
            'photo': photo,
            'scams_reported': 0,
            'scams_detected': 0,
            'emails_analyzed': 0,
            'scam_history': [],
            'report_history': [],
            'analyze_timestamps': []
        })

    return jsonify({
        "status": "success",
        "email": email,
        "name": name,
        "photo": photo
    })

@app.route("/report", methods=["POST"])
def report_scam():
    data = request.json
    email = data.get("email")
    email_text = data.get("emailText")
    reason = data.get("reason")
    highlight = data.get("highlight")

    if not email or not email_text or not reason or not highlight:
        return jsonify({"error": "Missing fields in request."}), 400

    try:
        timestamp = datetime.datetime.now(datetime.timezone.utc)

        db.collection("reported_examples").add({
            "email": email,
            "prompt": f"Email: {email_text}\nScam?",
            "completion": f"Scam Score: 95\nReason: {reason}\nHighlight: {highlight}",
            "timestamp": timestamp
        })
    
        if email:
            timestamp = datetime.datetime.utcnow().isoformat()
            user_ref = db.collection('users').document(email)          
            user_ref.update({
                "scams_reported": firestore.Increment(1),
                "report_history": firestore.ArrayUnion([timestamp])
            })


        return jsonify({"status": "reported"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/train-now", methods=["POST"])
def train_now():
    try:
        examples_ref = db.collection("reported_examples").stream()
        examples = [{"prompt": doc.to_dict().get("prompt", ""), "completion": doc.to_dict().get("completion", "")} for doc in examples_ref]
        if not examples:
            return jsonify({"error": "No examples found in Firebase"}), 400

        jsonl_path = "training_data.jsonl"
        with open(jsonl_path, "w") as f:
            for ex in examples:
                f.write(json.dumps({"prompt": ex["prompt"] + "\n", "completion": " " + ex["completion"] + "\n"}) + "\n")

        uploaded_file = openai.File.create(
            file=open(jsonl_path, "rb"),
            purpose="fine-tune"
        )

        fine_tune_job = openai.FineTuningJob.create(
            training_file=uploaded_file["id"],
            model="gpt-3.5-turbo"
        )

        db.collection("config").document("model").set({
            "job_id": fine_tune_job["id"],
            "model_id": fine_tune_job.get("fine_tuned_model", "gpt-3.5-turbo"),
            "status": "pending"
        }, merge=True)

        return jsonify({
            "status": "training_started",
            "job_id": fine_tune_job["id"]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/analyze", methods=["POST"])
def analyze_email():
    data = request.json
    email_text = data.get("emailText", "")
    email = data.get("email")

    if not email_text:
        return jsonify({"error": "No email text provided"}), 400

    client = openai.OpenAI()
    try:
        model_doc = db.collection('config').document('model').get()
        model_name = model_doc.to_dict().get('model_id', 'gpt-3.5-turbo')
    except Exception as e:
        print("⚠️ Could not fetch fine-tuned model ID. Using default:", e)
        model_name = 'gpt-3.5-turbo'

    messages = [
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
                Highlight: <if exists suspicious sentences or phrases>
                Email:
                {email_text}
                            """
        }
    ]
    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.2
        )
        reply = response.choices[0].message.content.strip()
        print("\n[RAW GPT RESPONSE]:\n", reply)
        score_match = re.search(r"Scam Score:\s*(\d+)", reply)
        reason_match = re.search(r"Reason:\s*(.*)", reply)
        highlight_match = re.search(r"Highlight:\s*(.*)", reply)
        if not (score_match and reason_match and highlight_match):
            raise ValueError("Missing one or more response components")

        if email:
            timestamp = datetime.datetime.utcnow().isoformat()
            user_ref = db.collection('users').document(email)
            user_ref.update({
                "emails_analyzed": firestore.Increment(1),
                "analyze_timestamps": firestore.ArrayUnion([timestamp])
            })
        if int(score_match.group(1)) > 70:
            user_ref.update({
                "scams_detected": firestore.Increment(1),
                "scam_history": firestore.ArrayUnion([timestamp])
            })

        return jsonify({
            "score": int(score_match.group(1)),
            "reason": reason_match.group(1).strip(),
            "highlight": highlight_match.group(1).strip()
        })

    except Exception as e:
        try:
            response_backup = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.2
            )
            reply = response_backup.choices[0].message.content.strip()
            print("\n[RAW GPT BACKUP RESPONSE]:\n", reply)

            score_match = re.search(r"Scam Score:\s*(\d+)", reply)
            reason_match = re.search(r"Reason:\s*(.*)", reply)

            return jsonify({
                "score": int(score_match.group(1)),
                "reason": reason_match.group(1).strip(),
                "highlight": ""
            })

        except Exception as final_error:
            return jsonify({"error": "Analysis failed", "details": str(final_error)}), 500

if __name__ == "__main__":
    app.run(debug=True)
