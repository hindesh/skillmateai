"""
Calls the local Ollama instance (gemma3:1b) to generate MCQ questions from a transcript.
Generates one question at a time for reliability with small models.
Ollama must be running: `ollama serve`
"""

import json
import urllib.request

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma3:1b"

SINGLE_Q_PROMPT = """Read this transcript and generate question number {n} of {total} about a different key concept.

Return a JSON object with these exact keys:
- "content": the question text
- "options": array of exactly 4 strings, each starting with "A) ", "B) ", "C) ", or "D) "
- "correct_answer": one of the options strings exactly as written
- "explanation": one sentence why the answer is correct
- "topic": short topic name
- "difficulty": "easy", "medium", or "hard"

Avoid repeating these topics already covered: {used_topics}

TRANSCRIPT:
{transcript}"""


def _call_ollama(prompt: str) -> dict:
    payload = json.dumps({
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.3,
            "num_predict": 500,
            "num_ctx": 4096,
        },
    }).encode("utf-8")

    req = urllib.request.Request(
        OLLAMA_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read())


def generate_questions_from_transcript(transcript: str, count: int = 5) -> list[dict]:
    questions: list[dict] = []
    used_topics: list[str] = []

    for n in range(1, count + 1):
        prompt = SINGLE_Q_PROMPT.format(
            n=n,
            total=count,
            transcript=transcript.strip(),
            used_topics=", ".join(used_topics) if used_topics else "none",
        )

        try:
            result = _call_ollama(prompt)
        except Exception as e:
            raise RuntimeError(f"Ollama request failed on question {n}: {e}")

        raw = result.get("response", "")

        try:
            q = json.loads(raw)
        except json.JSONDecodeError:
            continue  # skip malformed individual question

        if not isinstance(q, dict):
            continue
        if not all(k in q for k in ("content", "options", "correct_answer", "explanation", "topic")):
            continue
        if not isinstance(q["options"], list) or len(q["options"]) < 2:
            continue

        q.setdefault("difficulty", "medium")
        questions.append(q)
        used_topics.append(q.get("topic", ""))

    if not questions:
        raise ValueError("Model produced no valid questions — try a longer or clearer transcript")

    return questions
