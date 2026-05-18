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
    clean = re.sub(r"```(?:json)?\s*", "", text).strip().rstrip("`").strip()
    # Try the whole text first (works when response_mime_type suppresses thinking)
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        pass
    # Gemma 4 thinks out loud then outputs the real JSON at the end.
    # Try every position of [ or { in REVERSE order — the last outer block wins.
    for char in ("[", "{"):
        positions = [i for i, c in enumerate(clean) if c == char]
        for idx in reversed(positions):
            try:
                parsed = json.loads(clean[idx:])
                # Only accept arrays or dicts, not bare scalars
                if isinstance(parsed, (list, dict)):
                    return parsed
            except json.JSONDecodeError:
                continue
    raise ValueError(f"Could not parse JSON from model response: {text[:400]}")


def generate_questions_from_transcript(transcript: str, topic: str = "the session") -> list[dict]:
    """Generate 5 MCQ questions from a session transcript using the AI model."""
    prompt = (
        f'Read this teaching session transcript and output a JSON array of 5 quiz questions. '
        f'Output only the JSON array, no other text.\n\n'
        f'Each item in the array must have exactly these fields:\n'
        f'"content" (the question), "options" (array of 4 strings starting with "A) " "B) " "C) " "D) "), '
        f'"correct_answer" (must equal one of the options exactly), '
        f'"explanation" (one sentence), "topic" (short string), "difficulty" ("easy" or "medium" or "hard").\n\n'
        f'Example of one item:\n'
        f'{{"content":"What does F=ma mean?","options":["A) Force equals mass times acceleration","B) Friction equals mass times area","C) Force equals motion times angle","D) Frequency equals mass times amplitude"],"correct_answer":"A) Force equals mass times acceleration","explanation":"Newton\'s second law defines force as the product of mass and acceleration.","topic":"Newton Second Law","difficulty":"easy"}}\n\n'
        f'Transcript:\n{transcript}\n\nJSON array:'
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
