import os
import json
import uuid
import re
import urllib.error
import urllib.request
from difflib import SequenceMatcher
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "prolearn-secret-2024-change-in-production")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-lite")

# Gemini uses the REST API via Python's standard library.

# ─── Load knowledge base ──────────────────────────────────────────────────────
KB_PATH = os.path.join(os.path.dirname(__file__), "data", "knowledge_base.json")
LOGS_PATH = os.path.join(os.path.dirname(__file__), "data", "chat_logs.json")
UNANSWERED_PATH = os.path.join(os.path.dirname(__file__), "data", "unanswered.json")

def load_json(path, default):
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return default

def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

knowledge_base = load_json(KB_PATH, {})

def normalize_text(text):
    """Normalize text so question matching is forgiving."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()

def find_knowledge_base_answer(user_message):
    """Return a direct KB answer when the user's message matches a known question."""
    normalized_message = normalize_text(user_message)
    if not normalized_message:
        return None

    best_match = None
    best_score = 0
    categories = knowledge_base.get("categories", {})

    for category_name, category_data in categories.items():
        for qa in category_data.get("qa", []):
            for question in qa.get("questions", []):
                normalized_question = normalize_text(question)
                if not normalized_question:
                    continue

                score = SequenceMatcher(None, normalized_message, normalized_question).ratio()
                if normalized_message == normalized_question:
                    score = 1
                elif normalized_question in normalized_message or normalized_message in normalized_question:
                    score = max(score, 0.9)

                if score > best_score:
                    best_score = score
                    best_match = {
                        "answer": qa.get("answer", ""),
                        "category": category_name,
                        "question": question,
                        "score": score
                    }

    if best_match and best_match["score"] >= 0.72:
        return best_match
    return None

def find_related_knowledge(user_message, limit=3):
    """Find useful KB entries for broader questions when Gemini is unavailable."""
    normalized_message = normalize_text(user_message)
    message_words = {
        word for word in normalized_message.split()
        if len(word) > 3 and word not in {"what", "with", "this", "that", "your", "have", "help"}
    }
    if not message_words:
        return []

    matches = []
    categories = knowledge_base.get("categories", {})
    for category_name, category_data in categories.items():
        for qa in category_data.get("qa", []):
            question_text = " ".join(qa.get("questions", []))
            searchable_text = normalize_text(f"{category_name} {question_text} {qa.get('answer', '')}")
            score = sum(1 for word in message_words if word in searchable_text)
            if score:
                matches.append({
                    "score": score,
                    "category": category_name,
                    "answer": qa.get("answer", "")
                })

    matches.sort(key=lambda item: item["score"], reverse=True)
    return matches[:limit]

def build_related_knowledge_reply(user_message):
    related_entries = find_related_knowledge(user_message)
    if not related_entries:
        return None

    reply_parts = [
        "I'm unable to use the AI service right now, but I found related information in the ProLearn knowledge base:"
    ]
    seen_answers = set()
    for entry in related_entries:
        answer = entry["answer"]
        if answer in seen_answers:
            continue
        seen_answers.add(answer)
        reply_parts.append(f"- {answer}")

    reply_parts.append("For a more personalized recommendation, please try again when the AI service is available or contact info@prolearn.edu.")
    return "\n\n".join(reply_parts)

def build_gemini_prompt(user_message, history):
    prompt_parts = []
    for turn in history[-10:]:
        role = "User" if turn.get("role") == "user" else "Assistant"
        prompt_parts.append(f"{role}: {turn.get('content', '')}")
    prompt_parts.append(f"User: {user_message}")
    prompt_parts.append("Assistant:")
    return "\n\n".join(prompt_parts)

def call_gemini(prompt):
    api_key = os.environ.get("GEMINI_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={api_key}"
    payload = {
        "systemInstruction": {
            "parts": [{"text": SYSTEM_PROMPT}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "maxOutputTokens": 1024
        }
    }
    request_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=request_data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            response_data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        raise RuntimeError(f"Gemini API returned HTTP {e.code}: {error_body}") from e

    candidates = response_data.get("candidates", [])
    if not candidates:
        raise RuntimeError(f"Gemini API returned no candidates: {response_data}")

    parts = candidates[0].get("content", {}).get("parts", [])
    text_parts = [part.get("text", "") for part in parts if part.get("text")]
    return "\n".join(text_parts).strip()

def is_quota_error(error):
    error_text = str(error).lower()
    return "http 429" in error_text or "resource_exhausted" in error_text or "quota" in error_text

def quota_error_reply():
    return (
        "I'm unable to use the AI service right now, but I can still help with information from our knowledge base. "
        "For urgent or personalized support, please contact info@prolearn.edu."
    )

def save_chat_log(session_id, timestamp, user_message, bot_reply):
    logs = load_json(LOGS_PATH, [])
    logs.append({
        "session_id": session_id,
        "timestamp": timestamp,
        "user_message": user_message,
        "bot_response": bot_reply
    })
    save_json(LOGS_PATH, logs)

def save_unanswered_question(session_id, timestamp, user_message):
    unanswered = load_json(UNANSWERED_PATH, [])
    unanswered.append({
        "session_id": session_id,
        "timestamp": timestamp,
        "question": user_message
    })
    save_json(UNANSWERED_PATH, unanswered)

def should_track_unanswered(bot_reply):
    low_confidence_phrases = [
        "don't have specific information",
        "don't have enough information",
        "not sure about",
        "cannot answer",
        "outside my knowledge"
    ]
    return any(phrase in bot_reply.lower() for phrase in low_confidence_phrases)

# ─── Build system prompt from knowledge base ──────────────────────────────────
def build_system_prompt():
    org = knowledge_base.get("organisation", {})
    categories = knowledge_base.get("categories", {})

    # Flatten all Q&A into a readable block
    qa_text = ""
    for cat_name, cat_data in categories.items():
        qa_text += f"\n\n=== {cat_name.upper()} ===\n"
        for qa in cat_data.get("qa", []):
            qa_text += f"\nQ: {qa['questions'][0]}\nA: {qa['answer']}\n"

    hours = org.get("hours", {})
    system = f"""You are EduBot, the official AI assistant for {org.get('name', 'ProLearn Training Centre')}.
Tagline: {org.get('tagline', 'Empowering Careers Through Technology')}

Your personality: Professional, friendly, helpful, and encouraging. You speak clearly and concisely.
You represent the training centre with pride and always put the student's needs first.

CONTACT INFORMATION:
- Email: {org.get('email')}
- Phone: {org.get('phone')}
- Address: {org.get('address')}
- Website: {org.get('website')}
- Hours: Mon-Fri {hours.get('monday_friday')}, Sat {hours.get('saturday')}, Sun {hours.get('sunday')}

YOUR KNOWLEDGE BASE:
{qa_text}

INSTRUCTIONS:
1. Answer questions ONLY based on the knowledge base above and the organisation's information.
2. Be concise but complete. Use bullet points or numbered lists when helpful.
3. If a question is unclear, politely ask for clarification.
4. If you cannot answer a question from the knowledge base, say:
   "I don't have specific information on that. Please contact our team at {org.get('email')} or call {org.get('phone')} — a human advisor will be happy to help!"
5. For complaints, refunds, legal issues, emergencies, or sensitive topics, ALWAYS recommend speaking directly with a human advisor: "This is best handled by one of our human advisors. Please contact us at {org.get('phone')} or email {org.get('email')}."
6. NEVER make up information not in the knowledge base.
7. End responses warmly. Offer to answer follow-up questions.
8. Do NOT answer questions unrelated to the training centre (e.g., general internet searches, news, personal advice).
9. Always remind users at the end of a session that the chatbot may occasionally make mistakes and important decisions should be verified with staff.

You are here to help users with: courses, fees, registration, certification, facilities, support, location, instructors, and policies.
"""
    return system

SYSTEM_PROMPT = build_system_prompt()

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    if "session_id" not in session:
        session["session_id"] = str(uuid.uuid4())
    return render_template("index.html", org=knowledge_base.get("organisation", {}))


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()
    history = data.get("history", [])

    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    session_id = session.get("session_id", str(uuid.uuid4()))
    timestamp = datetime.now().isoformat()

    kb_match = find_knowledge_base_answer(user_message)
    if kb_match:
        bot_reply = kb_match["answer"]
        save_chat_log(session_id, timestamp, user_message, bot_reply)
        return jsonify({
            "reply": bot_reply,
            "timestamp": timestamp,
            "session_id": session_id,
            "source": "knowledge_base",
            "matched_question": kb_match["question"],
            "match_score": round(kb_match["score"], 2)
        })

    if not os.environ.get("GEMINI_API_KEY"):
        bot_reply = "I could not find that in the knowledge base, and the Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file or contact info@prolearn.edu."
        save_chat_log(session_id, timestamp, user_message, bot_reply)
        save_unanswered_question(session_id, timestamp, user_message)
        return jsonify({
            "reply": bot_reply,
            "timestamp": timestamp,
            "session_id": session_id,
            "source": "configuration_error"
        }), 200

    prompt = build_gemini_prompt(user_message, history)

    try:
        bot_reply = call_gemini(prompt)
        if not bot_reply:
            bot_reply = "I could not generate a response. Please try again or contact info@prolearn.edu."

        save_chat_log(session_id, timestamp, user_message, bot_reply)

        # Check if bot couldn't answer (save to unanswered)
        if should_track_unanswered(bot_reply):
            save_unanswered_question(session_id, timestamp, user_message)

        return jsonify({
            "reply": bot_reply,
            "timestamp": timestamp,
            "session_id": session_id,
            "source": "gemini"
        })

    except Exception as e:
        print(f"[{timestamp}] Gemini API error: {type(e).__name__}: {e}")
        save_unanswered_question(session_id, timestamp, user_message)
        fallback_reply = build_related_knowledge_reply(user_message)
        if fallback_reply:
            if is_quota_error(e):
                fallback_reply = f"{quota_error_reply()}\n\nRelated information from the ProLearn knowledge base:\n\n" + fallback_reply.split(":\n\n", 1)[-1]
            save_chat_log(session_id, timestamp, user_message, fallback_reply)
            return jsonify({
                "reply": fallback_reply,
                "error": str(e),
                "source": "quota_fallback" if is_quota_error(e) else "knowledge_base_fallback"
            }), 200

        if is_quota_error(e):
            bot_reply = quota_error_reply()
            save_chat_log(session_id, timestamp, user_message, bot_reply)
            return jsonify({
                "reply": bot_reply,
                "error": str(e),
                "source": "quota_error"
            }), 200

        return jsonify({
            "reply": "I'm experiencing a technical issue right now. Please contact us directly at info@prolearn.edu or call +1 (555) 200-3000.",
            "error": str(e),
            "source": "api_error"
        }), 200


@app.route("/quick-questions")
def quick_questions():
    """Returns suggested quick questions for the UI."""
    suggestions = [
        "What courses do you offer?",
        "How much do courses cost?",
        "How do I register?",
        "Do you offer online learning?",
        "What are your opening hours?",
        "Do you offer certificates?",
        "Is there financial aid available?",
        "Where are you located?"
    ]
    return jsonify({"questions": suggestions})


@app.route("/contact", methods=["POST"])
def contact():
    """Saves a human support contact request."""
    data = request.get_json()
    contact_file = os.path.join(os.path.dirname(__file__), "data", "contact_requests.json")
    requests_data = load_json(contact_file, [])
    requests_data.append({
        "timestamp": datetime.now().isoformat(),
        "name": data.get("name", ""),
        "email": data.get("email", ""),
        "message": data.get("message", ""),
        "session_id": session.get("session_id", "")
    })
    save_json(contact_file, requests_data)
    return jsonify({"success": True, "message": "Your request has been sent. Our team will contact you shortly!"})


@app.route("/admin")
def admin():
    """Simple admin dashboard."""
    logs = load_json(LOGS_PATH, [])
    unanswered = load_json(UNANSWERED_PATH, [])
    contact_requests = load_json(
        os.path.join(os.path.dirname(__file__), "data", "contact_requests.json"), []
    )

    # Calculate stats
    total_messages = len(logs)
    unique_sessions = len(set(l["session_id"] for l in logs))
    unanswered_count = len(unanswered)

    # Top questions (simple frequency count)
    from collections import Counter
    question_counter = Counter(l["user_message"].lower() for l in logs)
    top_questions = question_counter.most_common(10)

    return render_template("admin.html",
        total_messages=total_messages,
        unique_sessions=unique_sessions,
        unanswered_count=unanswered_count,
        recent_logs=logs[-20:][::-1],
        unanswered=unanswered[-10:][::-1],
        top_questions=top_questions,
        contact_requests=contact_requests[-10:][::-1],
        org=knowledge_base.get("organisation", {})
    )


@app.route("/admin/update-kb", methods=["POST"])
def update_kb():
    """Update knowledge base from admin panel."""
    data = request.get_json()
    new_qa = data.get("qa")
    category = data.get("category")
    if new_qa and category:
        kb = load_json(KB_PATH, {})
        if category in kb.get("categories", {}):
            kb["categories"][category]["qa"].append(new_qa)
            save_json(KB_PATH, kb)
            # Reload
            global knowledge_base, SYSTEM_PROMPT
            knowledge_base = load_json(KB_PATH, {})
            SYSTEM_PROMPT = build_system_prompt()
            return jsonify({"success": True})
    return jsonify({"success": False, "error": "Invalid data"}), 400


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
