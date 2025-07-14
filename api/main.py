from fastapi import FastAPI, HTTPException
import random
import json

# Load all questions from JSON file
questions = None
with open("../data/milyonist_1752508628.624063.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

# Pre-filter questions with and without audio
audio_questions = list(filter(lambda question: question["audio"] != None, questions))
non_audio_questions = list(filter(lambda question: question["audio"] == None, questions))

app = FastAPI()

@app.get("/random")
def get_random(audio: bool = None, nth: int = None):
    # Start with all questions
    choose_from = questions

    # Filter by audio presence if specified
    if audio:
        choose_from = audio_questions
    elif audio == False:
        choose_from = non_audio_questions

    # Filter by nth question if specified
    if nth is not None:
        choose_from = list(filter(lambda question: question["contestant"]["nth-question"] == nth, choose_from))

    # Return a random question from the filtered list
    try:
        return random.choice(choose_from)
    except IndexError:
        raise HTTPException(status_code=422, detail="Filtrelere uygun soru bulunamadı.")

@app.get("/index")
def get_random(index: int, audio: bool = None):
    # Start with all questions
    choose_from = questions

    # Filter by audio presence if specified
    if audio:
        choose_from = audio_questions
    elif audio == False:
        choose_from = non_audio_questions

    # Return the question at the given index
    try:
        return choose_from[index]
    except IndexError:
        raise HTTPException(
            status_code=422,
            detail=f"Geçersiz indeks. En yüksek geçerli değer: {len(choose_from)-1}"
        )
