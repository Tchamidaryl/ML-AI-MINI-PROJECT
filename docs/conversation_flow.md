# EduBot — Conversation Flow Diagram

## Main Flow

```
┌─────────────────────────────────────────────────┐
│               USER OPENS CHATBOT                │
│         (visits prolearn.edu/chat)              │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│             WELCOME MESSAGE                     │
│  "Hello! I'm EduBot, ProLearn's AI assistant.  │
│   How can I help you today?"                   │
│                                                 │
│  [Quick Suggestion Buttons]:                   │
│  • What courses do you offer?                  │
│  • How much do courses cost?                   │
│  • How do I register?                          │
│  • Do you offer online learning?               │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              USER TYPES A MESSAGE               │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│                    IS INPUT EMPTY?                        │
├────────── YES ──────────────────────── NO ───────────────┤
│                                                           │
▼                                                           ▼
[Return 400 error,              ┌──────────────────────────────────┐
 no response shown]             │   DOES MESSAGE CONTAIN           │
                                │   HUMAN HANDOFF TRIGGERS?        │
                                │   (complaint, refund, urgent,    │
                                │    emergency, legal...)           │
                                └────────┬────────────┬────────────┘
                                         │            │
                                        YES           NO
                                         │            │
                                         ▼            ▼
                          ┌──────────────────┐  ┌────────────────────────┐
                          │  HUMAN HANDOFF   │  │  SEND TO CLAUDE API    │
                          │  RESPONSE:       │  │  with:                 │
                          │  "This is best   │  │  - System prompt       │
                          │  handled by a    │  │    (knowledge base)    │
                          │  human advisor.  │  │  - Conversation history│
                          │  Call us at..."  │  │  - Current message     │
                          └──────────────────┘  └────────────┬───────────┘
                                                             │
                                                             ▼
                                              ┌─────────────────────────────┐
                                              │   IS TOPIC IN KNOWLEDGE     │
                                              │         BASE?               │
                                              └────────────┬────────────────┘
                                                           │
                             ┌─────────────────────────────┼──────────────────┐
                            YES                            │                  NO
                             │                             │                  │
                             ▼                                                ▼
                  ┌──────────────────┐                           ┌──────────────────────┐
                  │  KNOWLEDGE-BASED  │                           │  FALLBACK RESPONSE   │
                  │  ANSWER:          │                           │  "I don't have info  │
                  │  Specific, clear  │                           │  on that. Contact us │
                  │  answer from KB   │                           │  at info@prolearn..."│
                  └────────┬──────────┘                           └──────────┬───────────┘
                           │                                                  │
                           └───────────────────┬──────────────────────────────┘
                                               │
                                               ▼
                              ┌─────────────────────────────────────┐
                              │         SAVE TO CHAT LOGS           │
                              │   data/chat_logs.json              │
                              │                                     │
                              │   If fallback → also save to       │
                              │   data/unanswered.json             │
                              └──────────────┬──────────────────────┘
                                             │
                                             ▼
                              ┌─────────────────────────────────────┐
                              │     DISPLAY RESPONSE TO USER        │
                              │   (with markdown formatting)        │
                              └──────────────┬──────────────────────┘
                                             │
                                             ▼
                              ┌─────────────────────────────────────┐
                              │    CONVERSATION CONTINUES?          │
                              ├─────────────────────────────────────┤
                              │  YES → User types next message      │
                              │        (back to input step)         │
                              │                                     │
                              │  NO  → User closes chat OR          │
                              │        clicks "Talk to a Human"     │
                              └─────────────────────────────────────┘
```

## Contact Form Flow (Human Handoff)

```
User clicks "Talk to a Human"
        │
        ▼
Contact Modal Opens
(Name, Email, Message fields)
        │
        ▼
User fills and submits form
        │
        ▼
Data saved to contact_requests.json
        │
        ▼
Success message shown: "Our team will contact you shortly!"
        │
        ▼
Modal auto-closes after 2.5 seconds
        │
        ▼
ProLearn staff see the request in /admin dashboard
        │
        ▼
Staff follow up via email within 24 hours
```

## Admin Flow

```
Admin visits /admin
        │
        ▼
Dashboard shows:
  - Total messages sent
  - Unique sessions
  - Unanswered question count
  - Top 10 user questions
  - Recent 20 conversations
  - Unanswered/low-confidence questions
  - Human support requests
        │
        ▼
Admin identifies gaps in knowledge base
        │
        ▼
Admin uses "Add to Knowledge Base" form
  - Selects category
  - Enters new question + answer
  - Submits
        │
        ▼
knowledge_base.json updated immediately
System prompt reloaded in memory
Chatbot now knows the new information
```
