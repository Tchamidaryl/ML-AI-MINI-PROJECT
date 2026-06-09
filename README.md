# 🤖 ProLearn EduBot
### AI-Powered Training Centre Chatbot

Built with Flask + Anthropic Claude API  
Mini Project — AI Course | ProLearn Training Centre

---

## 📋 Project Structure

```
prolearn-chatbot/
├── app.py                        # Flask backend (main application)
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore rules
│
├── data/
│   └── knowledge_base.json       # All Q&A and org info (40+ entries)
│
├── static/
│   ├── css/style.css             # UI styles
│   └── js/chat.js                # Frontend chat logic
│
├── templates/
│   ├── index.html                # Main chat interface
│   └── admin.html                # Admin dashboard
│
└── docs/
    ├── project_documentation.md  # Full project write-up
    ├── testing_report.md         # 35 test cases + results
    └── conversation_flow.md      # Flow diagrams (ASCII)
```

---

## ⚡ Quick Setup (5 minutes)

### 1. Install Python (3.9+)
Download from https://python.org if not already installed.

### 2. Clone / download this project
```bash
cd Desktop
# If you have the zip, extract it here
# Or: git clone <your-repo-url>
cd prolearn-chatbot
```

### 3. Create a virtual environment
```bash
python -m venv venv

# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Set up your API key
```bash
cp .env.example .env
```
Open `.env` in a text editor and replace `your_anthropic_api_key_here` with your actual key.  
Get a key at: https://console.anthropic.com

### 6. Run the app
```bash
python app.py
```

### 7. Open in browser
Visit: **http://localhost:5000**

Admin dashboard: **http://localhost:5000/admin**

---

## 🔑 Getting an Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up for a free account
3. Click "API Keys" → "Create Key"
4. Copy the key into your `.env` file

---

## 🌐 Deployment (Render.com)

1. Push this project to GitHub (`.env` is in `.gitignore` — safe)
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repository
4. Configure:
   - **Build:** `pip install -r requirements.txt`
   - **Start:** `python app.py`
5. Add environment variables in Render dashboard:
   - `ANTHROPIC_API_KEY` = your key
   - `FLASK_SECRET_KEY` = any random string
6. Deploy!

---

## 📊 Features

| Feature | ✅ |
|---------|---|
| Natural language understanding (AI) | ✅ |
| 40+ knowledge base Q&A entries | ✅ |
| Quick question suggestion buttons | ✅ |
| Conversation history (last 10 turns) | ✅ |
| Save all chat logs to JSON | ✅ |
| Track unanswered questions | ✅ |
| Contact form → human handoff | ✅ |
| Admin dashboard with analytics | ✅ |
| Add new Q&A from admin panel | ✅ |
| API key security (.env + .gitignore) | ✅ |
| AI disclaimer shown to users | ✅ |
| Markdown rendering in responses | ✅ |
| Responsive web design | ✅ |

---

## ⚠️ Disclaimer

EduBot is an AI assistant powered by Gemini. It may occasionally provide inaccurate responses. Always verify important information with ProLearn staff directly.

---

## 📧 Contact

ProLearn Training Centre  
Email: tchamidaryl@gmail.com | Phone: +237 654221901

Scalability:
use posthug for monitory
Email: tchamidaryl@gmail.com | Phone: +237 654221901

Contributor: bryantech
