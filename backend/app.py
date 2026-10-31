from flask import Flask, request, jsonify
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, firestore
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Load environment variables
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'MOCK_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# Firebase Setup
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    db = None
    print("Firebase DB setup pending: Provide serviceAccountKey.json")

@app.route('/api/insights', methods=['POST'])
def ask_gemini():
    data = request.json
    question = data.get('question', '')
    lang = data.get('language', 'hi') # Default to Hindi/Hinglish
    
    if lang == 'hi':
        prompt = f"As a financial assistant named VyaparSaathi, answer this strictly in simple Hinglish (Hindi written in English alphabet) for a local Indian merchant: {question}"
    else:
        prompt = f"As a financial assistant named VyaparSaathi, answer this in simple, clear English for a small business owner: {question}"

    try:
        response = model.generate_content(prompt)
        answer = response.text
    except Exception as e:
        answer = "Gemini API connect nahi hai, kripya .env mein API key check karein." if lang == 'hi' else "Gemini API is not connected. Please check your .env API key."
    return jsonify({"answer": answer})

@app.route('/api/report', methods=['GET'])
def generate_report():
    prompt = "Generate a short, professional credit-readiness summary in English for a small business with 125000 Sales and 78400 Expenses, highlighting their healthy 46600 profit. Keep it to 3 bullet points."
    try:
        response = model.generate_content(prompt)
        summary = response.text
    except Exception:
        summary = "• Total Sales: ₹1,25,000\n• Total Expenses: ₹78,400\n• Net Profit: ₹46,600 (Healthy Business Status)"
    return jsonify({"report": summary, "status": "Ready for Bank Loan"})

if __name__ == '__main__':
    app.run(port=8080, debug=True)
