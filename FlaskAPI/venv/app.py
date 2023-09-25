from flask import Flask, request, jsonify
import json
import openai

app = Flask(__name__)

with open('config.json') as f:
    config = json.load(f)

api_key = config["OPENAI_API_KEY"]
openai.api_key = api_key

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/generate', methods=['POST'])
def generate_text():
    data = request.json
    prompt = data.get('prompt', '')

    try:
        response = openai.Completion.create(
          engine="text-davinci-003",
          prompt=prompt,
          temperature=0.6,
          max_tokens=150
        )

        return jsonify({
            'success': True,
            'response': response.choices[0].text.strip()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True)
