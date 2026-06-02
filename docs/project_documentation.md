# ProLearn EduBot — Project Documentation

## 1. Project Overview

**Project Name:** ProLearn EduBot — AI-Powered Training Centre Chatbot  
**Organisation:** ProLearn Training Centre  
**Chatbot Name:** EduBot  
**AI Model:** Claude (Anthropic) via claude-haiku-4-5 API  
**Framework:** Flask (Python) + HTML/CSS/JavaScript  
**Database:** JSON files (chat logs, knowledge base, contact requests)  

---

## 2. Problem Identification

### Organisation
ProLearn Training Centre is a professional technology skills training centre offering courses in software development, data science, cybersecurity, cloud computing, and more.

### Target Users
- Prospective students (local and international)
- Enrolled students
- Working professionals seeking upskilling
- Parents and guardians of student applicants

### Communication Problems Identified
1. The admissions team receives hundreds of repetitive enquiries daily (fees, courses, registration dates).
2. Prospective students often cannot reach staff outside office hours.
3. Website FAQs are static, hard to search, and not conversational.
4. Students need immediate answers but wait hours for email replies.

### Why AI Chatbot Instead of Rule-Based?
| Feature | Rule-Based Bot | AI Chatbot (EduBot) |
|---------|---------------|---------------------|
| Handles variations in phrasing | ❌ Only exact matches | ✅ Understands natural language |
| Responds to new/unexpected questions | ❌ "I don't understand" | ✅ Provides contextual response |
| Conversational flow | ❌ Rigid, menu-driven | ✅ Natural back-and-forth |
| Scalability of responses | ❌ Manual rule updates | ✅ Learns from knowledge base |
| User satisfaction | ❌ Frustrating | ✅ Helpful and friendly |

### Purpose of EduBot
To provide 24/7 intelligent assistance to current and prospective ProLearn students, reducing staff workload and improving the student experience by instantly answering common enquiries.

---

## 3. System Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                        USER (Web Browser)                          │
│              Types question in chat interface                      │
└───────────────────────────────┬───────────────────────────────────┘
                                │ HTTP Request (JSON)
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│                    WEB INTERFACE (Frontend)                        │
│        HTML + CSS + Vanilla JavaScript                             │
│  - Chat window        - Quick question buttons                     │
│  - Contact modal      - Markdown rendering                         │
│  - Typing indicator   - Character counter                          │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│                    FLASK BACKEND (Python)                          │
│                         app.py                                     │
│  Routes:                                                           │
│  GET  /          → Serve chat interface                            │
│  POST /chat      → Process message, call Claude API               │
│  GET  /quick-questions → Return quick suggestions                  │
│  POST /contact   → Save human support request                      │
│  GET  /admin     → Admin dashboard                                 │
│  POST /admin/update-kb → Add to knowledge base                    │
└──────────┬────────────────────────┬───────────────────────────────┘
           │                        │
           ▼                        ▼
┌──────────────────┐    ┌──────────────────────────┐
│  CLAUDE API      │    │  JSON DATA STORE          │
│ (Anthropic)      │    │                           │
│                  │    │  knowledge_base.json       │
│ Model:           │    │  chat_logs.json            │
│ claude-haiku     │    │  unanswered.json           │
│ -4-5-20251001    │    │  contact_requests.json     │
│                  │    │                           │
│ System Prompt:   │    │  Admin can update KB      │
│ - Organisation   │    │  via /admin panel         │
│   info           │    └──────────────────────────┘
│ - All Q&A pairs  │
│ - Behaviour rules│
└──────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│              ADMIN / HUMAN SUPPORT                               │
│  /admin dashboard shows:                                         │
│  - Total messages & sessions    - Unanswered questions           │
│  - Top user questions           - Contact requests               │
│  - Recent conversation logs     - KB update form                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Knowledge Base Summary

**Total categories:** 9  
**Total Q&A entries:** 40+  
**Categories:**
1. Courses (5 entries) — What's available, duration, online options
2. Fees (4 entries) — Pricing, payment plans, discounts, refunds
3. Registration (4 entries) — How to register, documents needed, intake dates
4. Certification (2 entries) — Types of certificates, when issued
5. Facilities (2 entries) — Labs, equipment, student resources
6. Support (3 entries) — Student services, contact channels, portal
7. Location (2 entries) — Address, opening hours
8. Instructors (2 entries) — Qualifications, class sizes
9. Policies (3 entries) — Attendance, assessment, code of conduct

---

## 5. Chatbot Personality and Behaviour

- **Name:** EduBot
- **Personality:** Professional, friendly, clear, and encouraging
- **Tone:** Warm but authoritative — like a knowledgeable student advisor
- **Allowed topics:** Anything in the knowledge base categories
- **Not allowed:** General internet questions, personal advice, medical advice, unrelated topics
- **Fallback:** Refers users to staff at info@prolearn.edu or +1 (555) 200-3000
- **Human handoff triggers:** Complaints, refunds, emergencies, legal issues, special needs, financial hardship

---

## 6. Advanced Features Implemented

| Feature | Implementation |
|---------|---------------|
| Conversation history | Last 10 turns sent with every API call |
| Save user questions | All chats logged to `data/chat_logs.json` |
| Save unanswered questions | Auto-detected and saved to `data/unanswered.json` |
| Contact form | Modal form → saves to `data/contact_requests.json` |
| Admin dashboard | `/admin` — stats, logs, unanswered Qs, KB update |
| Knowledge base update | Admins can add Q&A from admin panel at runtime |
| API key security | Stored in `.env`, never in code; `.gitignore` protects it |
| Disclaimer | Shown in sidebar to all users |
| Markdown rendering | Bot responses render **bold**, lists, line breaks |
| Quick question buttons | Sidebar pills for one-tap common questions |

---

## 7. Security Measures

1. **API key protection:** Stored in `.env` file, never hardcoded
2. **`.gitignore`:** Prevents `.env` and user data files from being committed to Git
3. **Input sanitisation:** User input HTML-escaped before rendering
4. **Session management:** Flask sessions with secret key
5. **Max tokens limit:** Claude API capped at 1024 tokens per response
6. **No sensitive data in frontend:** API key only accessed server-side

---

## 8. Deployment Options

| Platform | Type | Cost | Best For |
|----------|------|------|----------|
| **Render.com** | PaaS | Free tier available | Recommended for students |
| **Railway.app** | PaaS | Free tier available | Fast deployment |
| **PythonAnywhere** | PaaS | Free tier | Simple Flask apps |
| **Heroku** | PaaS | Paid | Production use |
| **School server** | Self-hosted | Free | Internal use |

### Render Deployment Steps
1. Push code to GitHub (without `.env`)
2. Create account at render.com
3. New → Web Service → Connect GitHub repo
4. Set environment variables: `ANTHROPIC_API_KEY`, `FLASK_SECRET_KEY`
5. Build command: `pip install -r requirements.txt`
6. Start command: `python app.py`

---

## 9. MLOps Workflow

```
DEVELOPMENT → TESTING → DEPLOYMENT → MONITORING → FEEDBACK → IMPROVEMENT → MAINTENANCE
     │              │           │            │            │             │            │
  Write code    30+ test     Push to     Check admin   Student      Update KB   Fix bugs
  Update KB     questions    Render/     dashboard     feedback     Add Q&A     Security
  Design UI     Edge cases   Railway     daily         forms        Retrain     patches
                Misspelling  Set env     Unanswered    Error logs   system
                             variables   Qs tracked    reviewed     prompt
```

**Monitoring Strategy:**
- Check `/admin` dashboard weekly for unanswered questions
- Review unanswered.json and improve knowledge base accordingly
- Track top questions to identify missing content
- Respond to all contact form submissions within 24 hours

**Knowledge Base Updates:**
- Admin can add new Q&A directly from `/admin` panel without touching code
- knowledge_base.json updates are reflected in the system prompt immediately
- Quarterly reviews of full Q&A for accuracy

**User Data Protection:**
- Chat logs stored locally (not in cloud databases)
- No personal information collected unless user fills contact form
- Contact form data protected by server access controls
- For production: implement user consent notice before chatting
