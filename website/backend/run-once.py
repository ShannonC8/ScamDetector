import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("firebase-cred.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Set default model config
db.collection("config").document("model").set({
    "model_id": "gpt-3.5-turbo",
    "status": "default"
})

print("✅ Default model gpt-3.5-turbo added to Firestore.")
