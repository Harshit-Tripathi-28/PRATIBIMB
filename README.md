# PRATIBIMB

### Your Digital Reflection, Powered by AI.

PRATIBIMB is a **Personal AI Operating Layer built around an AI Digital Twin of a human**.

It creates a persistent digital representation of who you are — your identity, goals, memories, habits, focus, skills, activity, and preferences — and uses that context to provide personalized intelligence, insights, conversations, and actions.

> **PRATIBIMB = You → Digital Twin → AI Reasoning → Insight → Action**

---

## ✨ What is PRATIBIMB?

Most AI assistants start with a blank conversation.

PRATIBIMB starts with **you**.

Your Digital Twin represents your current state and provides context to the AI Core so that interactions become more personal, contextual, and useful.

PRATIBIMB is designed as a personal intelligence layer that can understand:

- 🧠 Memory and personal context
- 🎯 Goals and long-term direction
- ✅ Tasks and responsibilities
- 🔥 Habits and routines
- 🎯 Current focus
- 💡 Skills and competencies
- 👤 Identity and preferences
- 📊 Activity and behavioral signals

The goal is not simply to answer questions.

The goal is to understand the person behind the question.

---

# 🧬 Digital Twin

At the center of PRATIBIMB is the **Digital Twin**.

The Digital Twin represents a continuously evolving model of the user.

```text
                    ┌──────────────┐
                    │    USER      │
                    └──────┬───────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │   DIGITAL TWIN   │
                 │                  │
                 │ Identity         │
                 │ Memory           │
                 │ Goals            │
                 │ Tasks            │
                 │ Habits           │
                 │ Focus            │
                 │ Skills           │
                 │ Activity         │
                 └────────┬─────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │    AI CORE    │
                  │   Reasoning   │
                  └───────┬───────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Insights /       │
                 │ Actions / Plans  │
                 └──────────────────┘
```

---

# 🤖 AI Core

PRATIBIMB's AI Core is the intelligence layer behind the Digital Twin.

It can reason using relevant user context such as:

- Digital Twin state
- Goals
- Tasks
- Habits
- Memories
- Current focus
- Recent activity
- Personal profile

This allows conversations to move beyond generic responses toward **context-aware personal intelligence**.

---

# 🧠 Memory

PRATIBIMB includes persistent personal memory so useful context can remain available across interactions.

The Memory system is designed to support:

- Personal facts
- Preferences
- Important context
- Previous interactions
- Relevant experiences
- Knowledge associated with the user

Memory can then become part of the Digital Twin's context for future reasoning.

---

# 🎯 Goals, Tasks & Focus

PRATIBIMB connects long-term direction with current action.

### Goals
Track strategic objectives and progress.

### Tasks
Connect everyday actions to broader goals.

### Focus
Turn current priorities into focused work sessions.

```text
Goal
  ↓
Tasks
  ↓
Focus
  ↓
Activity
  ↓
Digital Twin
```

---

# 🔥 Habits

Habits provide another layer of behavioral context.

PRATIBIMB can track daily habits and use that information as part of the user's Digital Twin state.

Over time, habits contribute to a richer representation of the user's routines and behavior.

---

# 🧑‍🎨 3D Digital Identity

PRATIBIMB uses **Three.js** to create a visual representation of the user's Digital Twin.

The 3D avatar is not a fashion or try-on feature.

It represents the user's **digital identity**.

The avatar can be personalized through:

- Appearance
- Skin tone
- Hairstyle
- Hair color
- Style
- Accessories
- Eyewear
- Mood
- Aura

The same canonical avatar configuration is used throughout the experience.

### Three.js is used strategically across:

- Home
- Digital Twin
- Avatar Studio
- Onboarding

The goal is to make the Digital Twin feel like a living visual representation rather than another dashboard component.

---

# 🌌 Digital Twin Visualization

The Digital Twin can be visualized through an interactive knowledge environment connecting real user entities such as:

```text
             Memories
                 │
                 │
Goals ───── Digital Twin ───── Focus
                 │
                 │
              Tasks
                 │
              Habits
```

These relationships are based on actual user state rather than fabricated demo data.

---

# 🏗️ Architecture

PRATIBIMB follows a frontend + backend architecture.

```text
┌─────────────────────────────────────────┐
│               FRONTEND                  │
│                                         │
│ React + TypeScript                      │
│ Tailwind CSS                            │
│ Three.js                                │
│ Vite                                    │
└──────────────────┬──────────────────────┘
                   │
                   │ REST APIs
                   ▼
┌─────────────────────────────────────────┐
│                BACKEND                  │
│                                         │
│ FastAPI                                 │
│ Authentication                          │
│ Digital Twin Services                   │
│ Memory                                   │
│ Goals                                    │
│ Tasks                                    │
│ Habits                                   │
│ Focus                                    │
│ AI Orchestration                         │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│              AI PROVIDERS               │
│                                         │
│ Gemini                                  │
│ OpenAI                                  │
│ Anthropic                               │
│ Ollama                                  │
└─────────────────────────────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Three.js
- Lucide Icons

## Backend

- Python
- FastAPI
- REST APIs
- Authentication & session management
- Digital Twin persistence
- AI orchestration

## AI

- Google Gemini
- OpenAI
- Anthropic
- Ollama

## Intelligence

- Context-aware reasoning
- Semantic memory retrieval
- Digital Twin state modeling
- Behavioral signals
- Personalized recommendations

---

# 🔐 Security

PRATIBIMB keeps AI provider credentials on the backend.

API keys are:

- never hardcoded into frontend code
- never exposed to browser bundles
- never stored in the public repository
- loaded through backend environment variables

For local development:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

> Never commit your `.env` file or expose your API key publicly.

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/Harshit-Tripathi-28/PRATIBIMB.git
cd PRATIBIMB
```

## 2. Backend Setup

```bash
cd backend
python -m venv venv
```

Activate on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create:

```text
backend/.env
```

Add:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Start the backend:

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

Backend:

```text
http://127.0.0.1:8001
```

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open the local URL provided by Vite.

---

# 📁 Project Structure

```text
PRATIBIMB/
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── main.py
│   │
│   ├── data/
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── contexts/
│   │   └── App.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

# 🧭 Core Experience

| Section | Purpose |
|---|---|
| 🏠 Home | Live overview of the Digital Twin |
| 🤖 AI Core | Personalized AI conversation and reasoning |
| 🧬 Digital Twin | Visual representation and relationships |
| 🧠 Memory | Persistent personal context |
| 🎯 Goals | Strategic objectives |
| 🔥 Focus | Current priorities and focused work |
| ✨ Avatar | Personal digital identity |

---

# 💡 Design Philosophy

PRATIBIMB is built around a simple idea:

> **Your AI should know more than your question. It should understand the person asking it.**

Instead of building another chatbot, PRATIBIMB aims to build a personal intelligence layer that continuously connects:

**Identity → Context → Memory → Goals → Behavior → Reasoning → Action**

The Digital Twin is the bridge between the human and the intelligence.

---

# 🔭 Vision

PRATIBIMB is designed to evolve beyond a conventional AI assistant.

Future directions can include deeper integrations across:

- Productivity
- Learning
- Research
- Coding
- Documents
- Communication
- Planning
- Scheduling
- Personal analytics
- Travel
- Finance
- External tools and APIs

The long-term vision is a system where AI doesn't simply respond to the user.

It **understands, remembers, reasons, predicts, and acts within the context of the user's life.**

---

# 👨‍💻 Author

**Harshit Tripathi**

BTech CSE-AI · 2028

GitHub:  
https://github.com/Harshit-Tripathi-28

LinkedIn:  
https://www.linkedin.com/in/harshit2806/

---

# ⭐ PRATIBIMB

### Your Digital Reflection, Powered by AI.

**USER → DIGITAL TWIN → AI CORE → INSIGHT → ACTION**
