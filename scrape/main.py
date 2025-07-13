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



BASE_URL = "https://milyonist.com/tv/milyoner/butun/sorular?sayfa=%d"
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    ctx = browser.new_context()
    ctx.add_cookies([{"name": "User-Agent", "value": "Mozilla/5.0", "url": "https://milyonist.com"}])
    page = ctx.new_page()
    
    # Get max page number
    page.goto(BASE_URL % 1)
    max_page_n = int(page.query_selector("#Soru > div:nth-child(4) > div > ul > li:nth-last-child(2)").text_content())
    print(f"Total of {max_page_n} unfiltered pages present.")

    questions = []
    for page_n in range(1, max_page_n+1):
        page.goto(BASE_URL % 1)
        
        already_added = False
        # Get all questions
        page_questions = []
        question_elements = page.query_selector_all("div.Question__text.hyphenate > a")
        for q_el in question_elements:
            # replace '%shy;' symbol with "" 
            question = q_el.inner_text().replace("­", "").strip()
            
            if question in list(map(lambda question: question["question"], questions)):
                already_added = True
                continue
            question_href = q_el.get_attribute("href")
            page_questions.append({"question": question, "question_choices": {}, "question_url": question_href, "question_number": None, "times_asked": None, "contestant_answer": None})
        
        # if question is already added skip it
        if already_added:
            print("Question is already present, passing.")
            continue
        
        
        
        
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
                
                
            details = page.query_selector("p.Details__text").inner_text().replace("­", "").strip()
            
            # get what the contestant answered
            contestant_answer = re.findall(r"(.)\ şıkkını\ seçerek", details)
            if len(contestant_answer) > 0:
                contestant_answer = contestant_answer[0]
            else:
                contestant_answer = right_answer
                
            page_questions[i]["contestant_answer"] = contestant_answer
            
            # get times asked    
            times_asked = int(page.query_selector("div.Question__marathon .rakam").inner_text().replace("kez", "").strip())
            page_questions[i]["times_asked"] = times_asked
        
            # check the nth-question from the url
            question_number = int(page.query_selector("div.Map__glance span.Map__primary span.rakam").text_content().strip())
            page_questions[i]["question_number"] = question_number
        
        
            if UPDATE:
                pass
                # TODO implement UPDATE function that adds the questions on runtime

        
            
        questions.extend(page_questions.copy())
        
        if REFRESH:
            print(f"Scraped {len(page_questions)} questions.")
            with open(f"data/questions-{RUNTIME}.json", "wb", encoding="utf-8") as f:
                json.dump(questions, f)