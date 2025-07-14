import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import json
import random



USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.199 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:116.0) Gecko/20100101 Firefox/116.0",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:115.0) Gecko/20100101 Firefox/115.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.199 Safari/537.36 OPR/100.0.4815.50",
    "Mozilla/5.0 (X11; Linux x86_64; rv:116.0) Gecko/20100101 Firefox/116.0",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.199 Mobile Safari/537.36",
    "Mozilla/5.0 (Android 13; Mobile; rv:116.0) Gecko/116.0 Firefox/116.0",
]
BASE_URL = "https://milyonist.com"
BASE_PAGINATION_URL = f"{BASE_URL}/tv/milyoner/butun/sorular?sayfa=%d"
BASE_AUDIO_URL = "https://milyonist.com/api/tv/questions/%s/audio"

def get_with_random_ua(url, max_retries = 5, retry = 0):
    headers = {"User-Agent": random.choice(USER_AGENTS)}
    try:
        res = requests.get(url, headers=headers, timeout=20)
    except requests.ConnectTimeout as e:
        if retry > max_retries:
            print(f"Retried {max_retries} times. But still failed.")
            raise e
        
        res = get_with_random_ua(url, max_retries=max_retries, retry=retry+1)
                
    return res

def get_audio_url(audio_id, retries=30):
    for attempt in range(retries):
        try:
            res = get_with_random_ua(BASE_AUDIO_URL % audio_id)
            audio_json = res.json()
            audio_src = audio_json["url"].replace("\\", "")
            return BASE_URL + audio_src
        except (requests.RequestException, json.JSONDecodeError) as e:
            time.sleep(20)
        except Exception as e:
            print(f"[Attempt {attempt+1}] Unexpected error: {e}")
            break
        
    print(f"[Attempt {attempt+1}] Failed to get audio for ID {audio_id}: {e}")
    return None


def get_n_questions() -> int:
    res = get_with_random_ua(BASE_PAGINATION_URL % 1)
    html = res.text
    
    soup = BeautifulSoup(html, "html.parser")
    return int(soup.select_one("p.Summary__number.Summary__number--first").get_text().strip().replace(".", ""))

def get_n_pages() -> int:
    res = get_with_random_ua(BASE_PAGINATION_URL % 1)
    html = res.text
    
    soup = BeautifulSoup(html, "html.parser")
    return int(soup.select_one("ul.pagination > li:nth-last-child(2)").get_text().strip().replace(".", ""))


def get_question(question_url: str) -> dict:
    try:
        res = get_with_random_ua(question_url)
        res.raise_for_status()
    except requests.RequestException as e:
        print(f"Failed to get question {question_url}: {e}")
        return None
    
    html = res.text
    soup = BeautifulSoup(html, "html.parser")
    
    question_text = soup.select_one("div.Question__text.hyphenate > p").get_text()
    nth_question = int(soup.select_one("span.Map__primary > span").get_text().strip())
    
    asked_to = soup.select_one("span.Map__secondary").get_text().strip()
    answered_correctly = False if soup.select_one("p.bildi") == None else True
    
    contestant_answer = None
    choices = {}
    right_answer = None
    for choice in soup.select("div.Multiple.Multiple--hover div.Multiple__choices"):
        letter = choice.select_one("span.Multiple__letter").get_text().lower()
        answer = choice.select_one("span.Multiple__text").get_text()
        
        if "Multiple__right_answer" in choice.get("class"):
            if answered_correctly:
                contestant_answer = letter
            right_answer = letter
            letter = letter.upper()
            
        choices[letter] = answer
    
    if contestant_answer == None:
        details = soup.select_one("div.Details > p.Details__text").get_text()
        try:
            contestant_answer = details.split("—")[1].strip()[0].lower()
        except IndexError:
            contestant_answer = None
    
    audio = soup.select_one("milyonist-player")
    if audio:
        audio_id = audio.get(":for")
        audio = get_audio_url(audio_id)
        
    
    
    question = {"question": question_text, "choices": choices, "answer": right_answer, "question-url": question_url, "audio": audio,
                "contestant": {"name": asked_to, "answer": contestant_answer, "correct": answered_correctly, "nth-question": nth_question}
                }

    return question

def get_page_questions(n_page: int) -> list[dict]:  
    try:
        res = get_with_random_ua(BASE_PAGINATION_URL % n_page)
        res.raise_for_status()
    except requests.RequestException as e:
        print(f"Failed to get page {n_page}: {e}")
        return []    
    
    html = res.text
    soup = BeautifulSoup(html, "html.parser")
    bare_questions = soup.select("div.Question__text.hyphenate > a")
    question_urls = [q.get("href") for q in bare_questions if q.get("href")]
    
    with ThreadPoolExecutor(max_workers=25) as executor:
        questions = list(executor.map(get_question, question_urls))

    
    return [q for q in questions if q is not None]
    

def threaded_fetch_pages(n_pages: int, max_workers: int = 5):
    all_questions = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(get_page_questions, page): page for page in range(1, n_pages+1)}

        for future in as_completed(futures):
            page = futures[future]
            try:
                questions = future.result()
                all_questions.extend(questions)
                print(f"Page {page}: got {len(questions)} questions. Total so far: {len(all_questions)}")
            except Exception as e:
                print(f"Error fetching page {page}: {e}")
    return all_questions

if __name__ == "__main__":
    START_TIME = time.time()
    
    n_questions = get_n_questions()
    n_pages = get_n_pages()
    print(f"{n_questions} questions spread across {n_pages} pages.")
        
    all_questions = threaded_fetch_pages(n_pages, max_workers=5)    
    print(f"Scraped total of {len(all_questions)}.")
    
    outfp = f"data/milyonist_{START_TIME}.json"
    print(f"Dumping to {outfp}")
    with open(outfp, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False)