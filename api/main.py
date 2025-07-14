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
def get_random(audio: bool = None, nth: int = None, contestant: str = None, correct: bool = None):
    # Start with all questions
    choose_from = questions

    # Filter by audio presence
    if audio is not None:
        if audio:
            choose_from = audio_questions
        else:
            choose_from = non_audio_questions

    # Filter by nth question number
    if nth is not None:
        choose_from = [q for q in choose_from if q["contestant"]["nth-question"] == nth]

    # Filter by contestant name (case insensitive)
    if contestant is not None:
        choose_from = [
            q for q in choose_from 
            if contestant.lower() in q["contestant"]["name"].lower()
        ]

    # Filter by correctness (True or False)
    if correct is not None:
        choose_from = [q for q in choose_from if q["contestant"]["correct"] == correct]

    try:
        return random.choice(choose_from)
    except IndexError:
        raise HTTPException(status_code=422, detail="No question found matching the filter criteria.")


@app.get("/index")
def get_by_index(
    index: int = None,
    audio: bool = None,
    nth: int = None,
    contestant: str = None,
    correct: bool = None
):
    # Start with all questions
    choose_from = questions

    # Filter by audio presence
    if audio is not None:
        if audio:
            choose_from = audio_questions
        else:
            choose_from = non_audio_questions

    # Filter by nth question number
    if nth is not None:
        choose_from = [q for q in choose_from if q["contestant"]["nth-question"] == nth]

    # Filter by contestant name (case insensitive)
    if contestant is not None:
        choose_from = [
            q for q in choose_from
            if contestant.lower() in q["contestant"]["name"].lower()
        ]

    # Filter by correctness (True or False)
    if correct is not None:
        choose_from = [q for q in choose_from if q["contestant"]["correct"] == correct]

    # Return question at the given index of the filtered list
    try:
        if index is not None:
            return choose_from[index]
        else:
            return choose_from
    except IndexError:
        raise HTTPException(
            status_code=422,
            detail=f"The requested index is out of range for the filtered questions list. Max value: {len(choose_from) - 1}"
        )