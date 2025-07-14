import requests

with open("temp.html", "w", encoding="UTF-8") as f:
    f.write(requests.get("https://milyonist.com/tv/milyoner/soru/oguzhan-yanik-2-soru").text)