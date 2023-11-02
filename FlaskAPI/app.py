import uuid

from flask import Flask, request, jsonify, session
import os
import json
import secrets
import openai
from flask_cors import CORS
import uuid


app = Flask(__name__)
app.config['SESSION_COOKIE_NAME'] = 'session'
app.config['SESSION_TYPE'] = 'filesystem'
app.secret_key = secrets.token_hex(16)
# CORS(app, supports_credentials=True, origins=["DOMAIN"]) PROD MODE | Replace domain with versel or real domain
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "https://tr-ai-tor.vercel.app/", "https://tr-ai-torapi-d1938a8a0bce.herokuapp.com/"])
api_key = os.environ.get('OPENAI_API_KEY', '')
openai.api_key = api_key


@app.before_request
def ensure_session_token():
    print("Before request triggered.")
    if 'sessionToken' not in session:
        print("Token not in session.")
        session['sessionToken'] = str(uuid.uuid4())
        print(f"New sessionToken generated: {session['sessionToken']}")
    else:
        print("Token found in session.")
        print(f"Existing sessionToken found: {session['sessionToken']}")



@app.route('/')
def hello_world():
    return 'chatgpt nice brother wojak!'

@app.route('/set-token')
def set_token():
    session['sessionToken'] = str(uuid.uuid4())
    return f"Token set: {session['sessionToken']}"

@app.route('/get-token')
def get_token():
    return f"{session.get('sessionToken', 'No token found.')}"

@app.route('/askgpt', methods=['POST'])
def askGPT():
    data = request.json
    user_prompt = data.get('prompt', '')

    messages = [
        {"role": "system",
         "content": "You are trying to determine whether or not ChatGPT wrote the prompt being given to you."},
        {"role": "user", "content": user_prompt}
    ]

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages
        )

        return jsonify({
            'testName': 'AskGPT',
            'success': True,
            'response': response['choices'][0]['message']['content'].strip()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })


@app.route('/reverseprompt', methods=['POST'])
def reversePrompt():
    data = request.json
    user_prompt = data.get('prompt', '')

    description_messages = [
        {"role": "user",
         "content": "this was generated by chatgpt. what do you think the prompt that the user asked chat gpt was to generate this?\n\n" + user_prompt}
    ]

    try:
        description_response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=description_messages
        )
        description = description_response['choices'][0]['message']['content'].strip()

        reverse_messages = [
            {"role": "user", "content": description}
        ]

        reverse_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=reverse_messages
        )
        reversed_prompt = reverse_response['choices'][0]['message']['content'].strip()

        return jsonify({
            'testName': 'ReversePrompt',
            'success': True,
            'original_prompt': user_prompt,
            'reversed_prompt': reversed_prompt,
            'description': description
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })


if __name__ == '__main__':
    app.run(debug=True)
