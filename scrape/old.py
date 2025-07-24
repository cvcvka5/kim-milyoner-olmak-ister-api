from playwright.sync_api import sync_playwright
import re
import sys
import json
import time

RUNTIME = time.time()
args = list(map(lambda arg: arg.lower(), sys.argv[1:]))
REFRESH = 0
UPDATE = 0
RUNMODE = None
if "refresh" in args:
    REFRESH = 1
    RUNMODE = "refresh"
if "update" in args:
    UPDATE = 1
    RUNMODE = "update"
    
if sum([REFRESH, UPDATE]) in [0, 2]:
    raise RuntimeError("You must pass either 'refresh' or 'UPDATE' as an argument.\n Refresh: Fully rebuilds the list.\n Update: Finds and adds the new questions.")

print(f"Mode set to: [{RUNMODE.upper()}]")


BASE_URL = "https://milyonist.com"
BASE_PAGINATION_URL = f"{BASE_URL}/tv/milyoner/butun/sorular?sayfa=%d"
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    ctx = browser.new_context()
    ctx.add_cookies([{"name": "User-Agent", "value": "Mozilla/5.0", "url": "https://milyonist.com"}])
    page = ctx.new_page()
    
    # Get max page number
    page.goto(BASE_PAGINATION_URL % 1)
    max_page_n = int(page.query_selector("#Soru > div:nth-child(4) > div > ul > li:nth-last-child(2)").text_content())
    print(f"Total of {max_page_n} unfiltered pages present.")
    print(f"Total of ~{max_page_n*25} questions present.")

    questions = []
    for page_n in range(1, max_page_n+1):
        page.goto(BASE_PAGINATION_URL % page_n)
        
        # Get all questions
        page_questions = []
        question_elements = page.query_selector_all("div.Question__text.hyphenate > a")
        for q_el in question_elements:
            # replace '%shy;' symbol with "" 
            question = q_el.inner_text().replace("­", "").strip()
            
            # Set up a template for question and append to temporary list            
            question_href = q_el.get_attribute("href")
            page_questions.append({"question": question, "question_choices": {}, "question_url": question_href, "contestant_answer": None,
                                   "page_url": BASE_PAGINATION_URL % page_n, "audio": None})
        
        
        # go through each question on the page and also get the choices with the correct answer as uppercase
        # ex: a) Law b) Order C) Correct d) Random 
        for i, question in enumerate(page_questions):
            url = question["question_url"]
            page.goto(url)
            
            # Get the choices
            choices = page.query_selector_all("div.Multiple__choices")
            right_answer = None
            for choice in choices:
                choice_letter = choice.query_selector("span.Multiple__letter").text_content().strip().lower()
                choice_text = choice.query_selector("span.Multiple__text").text_content().strip()
                
                # if its right uppercase the letter    
                if "right_answer" in choice.get_attribute("class"):
                    choice_letter = choice_letter.upper()
                    right_answer = choice_letter
                
                page_questions[i]["question_choices"][choice_letter] = choice_text

            # if question is already added skip it
            filtering_questions = list(map(lambda q: str(q["question"])+str(q["question_choices"]), questions))
            filtering_question = question["question"]+str(page_questions[i]["question_choices"])
            if filtering_question in filtering_questions:
                prev_page = questions[filtering_questions.index(filtering_question)]['page_url'].split("sayfa=")[-1].strip()
                print(f"Question on page '{page_n}' is a duplicate of a question on page '{prev_page}'")
                page_questions.pop(i)
                continue


            # Get audio IF PRESENT
            audio = page.query_selector("audio > source")
            if audio:
                audio_src = f"{BASE_URL}{audio.get_attribute('src')}"
                page_questions[i]["audio"] = audio_src
            
        
            if UPDATE:
                pass
                # TODO implement UPDATE function that adds the questions on runtime

        questions.extend(page_questions.copy())
        
        
        if REFRESH:
            with open(f"data/questions-{RUNTIME}.json", "w", encoding="utf-8") as f:
                json.dump(questions, f, ensure_ascii=False)
            print(f"Scraped {len(questions)} questions.")
        
            
        