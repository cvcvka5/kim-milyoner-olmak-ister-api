export interface Question {
  question: string;
  choices: Record<string, string>;
  answer: string;
  "question-url": string;
  audio: string | null;
  contestant: {
    name: string;
    answer: string | null;
    correct: boolean;
    "nth-question": number;
  };
}

interface FetchOptions {
  audio?: boolean;
  nth?: number;
  contestant?: string;
  correct?: boolean;
  index?: number;
}

const BASE_URL = "/api";

async function getRandomQuestion(opts: FetchOptions = {})/*: Promise<Question>*/ {
  // Remove index, only use filters
  const filters = opts;

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }

  const response = await fetch(`${BASE_URL}/random?${params.toString()}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch question.");
  }

  return response.json()
}

export { getRandomQuestion };