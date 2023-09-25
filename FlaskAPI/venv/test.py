import requests

url = "http://127.0.0.1:5000/generate"

data = {
    "prompt": "Michael Jackson, often referred to as the 'King of Pop,' was an iconic American singer, songwriter, and dancer who rose to unparalleled fame and became a global cultural phenomenon. Born on August 29, 1958, in Gary, Indiana, Jackson began his music career at a young age as a member of the Jackson 5, a Motown group formed with his siblings. He later embarked on a solo career that produced some of the most legendary and influential albums in music history, including 'Off the Wall,' 'Thriller,' and 'Bad.' With his distinctive voice, groundbreaking music videos, and signature dance moves like the moonwalk, Jackson left an indelible mark on the entertainment industry. His philanthropic efforts, combined with his enduring impact on pop culture, cement his status as one of the greatest and most beloved entertainers of all time.",
}

response = requests.post(url, json=data)

print(response.json())
