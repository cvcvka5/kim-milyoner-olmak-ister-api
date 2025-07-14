# Milyonist API

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

- https://kim-milyoner-olmak-ister-api.onrender.com

### GET /random

Returns a random question from the dataset, optionally filtered by audio presence and question number.

#### Query Parameters

| Parameter | Type    | Required | Description                                                                                  |
|-----------|---------|----------|----------------------------------------------------------------------------------------------|
| `audio`   | boolean | No       | Filter questions by audio presence: `true` for questions with audio, `false` for without.    |
| `nth`     | integer | No       | Filter questions by the nth question number (contestant's question order).                    |

#### Response

- JSON object representing a single question matching the filters.

#### Errors

- **422 Unprocessable Entity**: No question found matching the filter criteria.

---

### GET /index

Returns the question at the specified index, optionally filtered by audio presence.

#### Query Parameters

| Parameter | Type    | Required | Description                                                                                  |
|-----------|---------|----------|----------------------------------------------------------------------------------------------|
| `index`   | integer | Yes      | Zero-based index of the question to return.                                                 |
| `audio`   | boolean | No       | Filter questions by audio presence: `true` for questions with audio, `false` for without.    |

#### Response

- JSON object representing the question at the given index after applying the audio filter.

#### Errors

- **422 Unprocessable Entity**: The requested index is out of range for the filtered questions list.
