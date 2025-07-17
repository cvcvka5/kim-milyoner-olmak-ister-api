# Milyonist API
[Milyoner on Vercel](https://milyoner.vercel.app)

This project is a web scraper and API server for trivia questions from the Turkish quiz show "Milyonist". It scrapes questions, answers, contestant info, and audio clips from milyonist.com, then serves them through a FastAPI-based API.

---

## Features

- Scrape all trivia questions with options and answers.
- Filter questions with or without audio clips.
- Retrieve questions by index or randomly with filters.
- Handles user-agent rotation and retry logic for stable scraping.
- Uses concurrency to speed up scraping multiple pages/questions.
- Saves scraped data to a JSON file for easy loading.

---

## API Documentation

- https://milyoner.vercel.app/api
- https://kim-milyoner-olmak-ister-api.onrender.com

This API provides access to quiz questions with optional filtering.

---

### GET `/random`

Returns a **random question** matching the optional filter criteria.

#### Query Parameters

| Parameter   | Type    | Required | Description                                                    |
|-------------|---------|----------|----------------------------------------------------------------|
| `audio`     | bool    | No       | Filter by presence of audio. `true` for audio only, `false` for no audio, omit for all. |
| `nth`       | int     | No       | Filter questions by their nth question number.                 |
| `contestant`| string  | No       | Filter questions by contestant name (case-insensitive, partial match). |
| `correct`   | bool    | No       | Filter by whether contestant answered correctly (`true` or `false`). |

#### Response

- Returns a random question JSON object matching the filters.
- If no questions match, returns HTTP 422 with detail:  
  `"No question found matching the filter criteria."`

---

### GET `/index`

Returns the question at a specific **index** (after filtering).

#### Query Parameters

| Parameter   | Type    | Required | Description                                                    |
|-------------|---------|----------|----------------------------------------------------------------|
| `index`     | int     | No       | Index of the question in the filtered list. If omitted, returns the full filtered list. |
| `audio`     | bool    | No       | Filter by presence of audio. `true` for audio only, `false` for no audio, omit for all. |
| `nth`       | int     | No       | Filter questions by their nth question number.                 |
| `contestant`| string  | No       | Filter questions by contestant name (case-insensitive, partial match). |
| `correct`   | bool    | No       | Filter by whether contestant answered correctly (`true` or `false`). |

#### Response

- Returns the question JSON object at the requested index from the filtered list.
- If `index` is omitted, returns the full filtered question list.
- If `index` is out of range, returns HTTP 422 with detail:  
  `"The requested index is out of range for the filtered questions list. Max value: {max_index}"`

---

## Data Schema (Question Object)

```json
{
  "question": "string (the question text)",
  "choices": { "a": "wrong", "B": "correct choice is uppercase", "c": "wrong", "d": "wrong" },
  "answer": "string (correct choice letter)",
  "question-url": "string (URL to the question page)",
  "audio": "string|null (URL to audio if available)",
  "contestant": {
    "name": "string (contestant's name)",
    "answer": "string (contestant's answer letter)",
    "correct": "boolean (contestant's response result)",
    "nth-question": "int (question number for the contestant)"
  }
}
