import requests

url = "http://127.0.0.1:5000/generate"

data = {
    "prompt": "Write me a story about a young man named cole garbowski, he is puny in all ways, and he gets bullied at school.",
}

response = requests.post(url, json=data)

print(response.json())
