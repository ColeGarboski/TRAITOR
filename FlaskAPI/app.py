from flask import Flask, request, jsonify
import os
import json
import openai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

api_key = os.environ.get('OPENAI_API_KEY', '')
openai.api_key = api_key

@app.route('/')
def hello_world():
    return 'chatgpt nice brother wojak!'


@app.route('/generate', methods=['POST'])
def didGPTWrite():
    data = request.json
    user_prompt = data.get('prompt', '')

    messages = [
        {"role": "system", "content": "You are trying to determine whether or not ChatGPT wrote the prompt being given to you."},
        {"role": "user", "content": user_prompt}
    ]

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages
        )

        return jsonify({
            'success': True,
            'response': response['choices'][0]['message']['content'].strip()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })


if __name__ == '__main__':
    app.run(debug=True)
