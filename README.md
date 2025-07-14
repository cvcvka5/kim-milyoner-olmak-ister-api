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