import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
MODEL = os.getenv("GEMMA_MODEL", "gemini-2.5-flash")


def _get_model(json_output: bool = True):
    kwargs = {"temperature": 0.2}
    if json_output:
        kwargs["response_mime_type"] = "application/json"
    config = genai.GenerationConfig(**kwargs)
    return genai.GenerativeModel(MODEL, generation_config=config)


def _extract_json(text: str) -> dict | list:
    text = re.sub(r"```(?:json)?\s*", "", text).strip().rstrip("`").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"[\[{][\s\S]*[\]}]", text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    raise ValueError(f"Could not parse JSON from model response: {text[:400]}")


def generate_questions_from_transcript(transcript: str, topic: str = "the session") -> list[dict]:
    """Generate 5 MCQ questions from a session transcript using the AI model."""
    example = json.dumps([{
        "content": "Which is the standard form of a quadratic equation?",
        "options": ["A) ax+b=0", "B) ax²+bx+c=0", "C) ax³+bx²=0", "D) ax²=0"],
        "correct_answer": "B) ax²+bx+c=0",
        "explanation": "The standard form is ax²+bx+c=0 where a≠0.",
        "topic": "Standard Form",
        "difficulty": "medium"
    }])

    prompt = (
        f"You are an expert educational quiz creator. Read the following teaching session transcript "
        f"on the topic '{topic}' and generate exactly 5 multiple-choice questions that test the student's "
        f"understanding of the key concepts covered.\n\n"
        f"Return ONLY a JSON array (no wrapping object). Each element must match this structure:\n{example}\n\n"
        f"Rules:\n"
        f"- correct_answer must exactly match one of the options strings\n"
        f"- options must have exactly 4 items, each starting with A) B) C) or D)\n"
        f"- difficulty: easy | medium | hard\n"
        f"- Generate exactly 5 questions on different aspects of the transcript\n\n"
        f"TRANSCRIPT:\n{transcript}"
    )

    response = _get_model(json_output=True).generate_content(prompt)
    result = _extract_json(response.text)

    if isinstance(result, dict) and "questions" in result:
        result = result["questions"]
    if not isinstance(result, list):
        raise ValueError("Model did not return a list of questions")

    validated = []
    for q in result:
        if not isinstance(q, dict):
            continue
        if not all(k in q for k in ("content", "options", "correct_answer", "explanation", "topic")):
            continue
        q.setdefault("difficulty", "medium")
        validated.append(q)

    if not validated:
        raise ValueError("No valid questions in model response")

    return validated[:5]


def analyse_session(transcript: str, topic: str) -> dict:
    example = json.dumps({
        "understanding_score": 7,
        "weak_topics": ["standard form", "role of coefficients"],
        "summary": "Student grasps the x-squared concept but needs work on coefficients.",
        "questions": [{
            "content": "Which is the standard form of a quadratic equation?",
            "options": ["A) ax+b=0", "B) ax²+bx+c=0", "C) ax³+bx²=0", "D) ax²=0"],
            "correct_answer": "B) ax²+bx+c=0",
            "explanation": "The standard form is ax²+bx+c=0 where a≠0.",
            "topic": "Standard Form",
            "difficulty": "easy"
        }]
    })
    prompt = (
        f"Analyse this teaching session on '{topic}' and return ONLY a JSON object.\n\n"
        f"Transcript:\n{transcript}\n\n"
        f"Use this exact JSON structure (example with 1 question; generate 5):\n{example}\n\n"
        "understanding_score must be 0–10. Generate exactly 5 quiz questions targeting the student's weak areas."
    )
    response = _get_model(json_output=True).generate_content(prompt)
    return _extract_json(response.text)


def generate_progress_feedback(attempts: list) -> str:
    attempts_text = json.dumps(attempts, indent=2)
    config = genai.GenerationConfig(temperature=0.7)
    model = genai.GenerativeModel(MODEL, generation_config=config)
    prompt = (
        "Write 3-4 sentences of warm, encouraging feedback for a student based on their quiz results.\n"
        "Mention: what improved, what still needs work, one actionable study tip.\n"
        "Write in second person. Plain text only, no JSON, no bullet points.\n\n"
        f"Quiz attempts (most recent first):\n{attempts_text}"
    )
    response = model.generate_content(prompt)
    return response.text.strip()
