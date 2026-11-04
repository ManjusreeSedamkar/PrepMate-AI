# PrepMate AI — AI Interview Preparation Assistant

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gen AI](https://img.shields.io/badge/AI-Google%20Gen%20AI%20SDK-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![Render](https://img.shields.io/badge/Deployment-Render-46E3B7?style=flat&logo=render&logoColor=white)](https://render.com/)

**PrepMate AI** is a full-stack, responsive, AI-powered web application that helps students, freshers, and job seekers prepare for technical and HR interviews using Generative AI. 

Powered by the official **Google Gen AI SDK** and **Gemini 3.8 Flash**, PrepMate AI delivers realistic interview questions, real-time Server-Sent Events (SSE) answer evaluation, multi-dimensional scoring (out of 10), student-friendly model answers, and a final performance scorecard with an actionable preparation roadmap.

---

## 🌟 Core Features

### 1. Modern Dashboard
- High-impact landing page with PrepMate AI branding and feature highlights.
- Clear **Start Interview** call-to-action and preview of past practice history.
- Pre-configured track badges for popular roles: Python, Java, Web, Data Analyst, AI/ML, DevOps, and custom titles.

### 2. Flexible Interview Configuration
- **Job Role:** Java Developer, Python Developer, Data Analyst, Web Developer, AI/ML Engineer, DevOps, Full Stack Developer, or custom role input.
- **Experience Level:** Beginner (0–1 yrs), Intermediate (1–3 yrs), Advanced (3+ yrs).
- **Interview Type:** Technical, HR / Behavioral (STAR method), or Mixed (60% technical + 40% behavioral).
- **Question Volume:** 5, 10, or 15 questions per session.
- **Custom Focus Topics:** Specify technologies like Docker, Spring Boot, React, SQL, or Concurrency.

### 3. Dynamic AI Question Generation
- Powered by structured Gemini prompt engineering.
- Generates non-repetitive, conceptual, and scenario-based questions.
- Includes progressive difficulty and helpful conceptual hints that candidates can toggle.
- One-question-at-a-time focus mode with visual step indicators.

### 4. Multi-Dimensional Answer Evaluation
- Type answers directly with real-time character/word counts.
- **Voice Dictation (Web Speech API):** Speak answers aloud to simulate a real verbal interview.
- **Real-time SSE Streaming:** Live commentary as Gemini analyzes responses.
- **Scoring (0 to 10):** Evaluated across 4 core dimensions:
  1. *Technical Correctness*
  2. *Clarity & Structure*
  3. *Technical Depth*
  4. *Completeness*
- Highlights specific strengths, omitted concepts, and actionable tips for improvement.

### 5. Student-Friendly Model Answers
- On-demand ideal answers structured into **The What**, **The How/Why**, and **Practical Examples**.
- Key takeaway bullet points to memorize before real interviews.
- Interviewer pro-tips for answering with confidence.

### 6. Comprehensive Interview Summary & Readiness Report
- Holistic final scorecard out of 10 with performance level (*Excellent, Proficient, Developing, Needs Improvement*).
- Celebratory confetti on completion.
- Question-by-question breakdown table with individual scores and candidate answers.
- Overarching strengths and weaknesses summary.
- Personalized step-by-step preparation roadmap.
- Export report as JSON or print to PDF.
- Persistent local history to track progress over time.

---

## 🏗️ Technology Architecture

```
                       ┌───────────────────────────────┐
                       │        React + Vite SPA       │
                       │ (Tailwind CSS, Lucide, SSE)   │
                       └──────────────┬────────────────┘
                                      │ HTTP / SSE
                                      ▼
                       ┌───────────────────────────────┐
                       │       FastAPI REST API        │
                       │  - /api/generate-questions    │
                       │  - /api/evaluate-answer       │
                       │  - /api/stream-evaluate-answer│
                       │  - /api/generate-sample-answer│
                       │  - /api/interview-summary     │
                       └──────────────┬────────────────┘
                                      │ Google Gen AI SDK
                                      ▼
                       ┌───────────────────────────────┐
                       │      Google Gemini API        │
                       │      (gemini-3.8-flash)       │
                       └───────────────────────────────┘
```

---

## 📁 Project Directory Structure

```
PrepMate AI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py           # App settings, environment variables & CORS
│   │   ├── schemas.py          # Pydantic data schemas
│   │   ├── main.py             # FastAPI entrypoint, healthcheck, routes
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── interview.py    # REST & SSE streaming endpoints
│   │   └── services/
│   │       ├── __init__.py
│   │       └── gemini_service.py # Gemini client, prompt engineering & streaming
│   ├── .env.example            # Backend env template
│   ├── requirements.txt        # Python backend dependencies
│   ├── Dockerfile              # Container deployment for Render/Docker
│   └── run.py                  # Standalone entrypoint (reads PORT from Render)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, ScoreBadge, etc.)
│   │   ├── context/            # Global state (InterviewContext.jsx)
│   │   ├── pages/              # Dashboard, Setup, Session, Summary, History
│   │   ├── services/           # API and SSE client (api.js)
│   │   ├── App.jsx             # Main container
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind base styles
│   ├── .env.example            # Frontend env template
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
├── render.yaml                 # Infrastructure-as-code for Render deployment
├── .gitignore
└── README.md                   # Full documentation
```

---

## 🚀 Quickstart: Running Locally

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**
- **Google Gemini API Key** (Get free from [Google AI Studio](https://aistudio.google.com/))

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. (Optional but recommended) Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `GEMINI_API_KEY`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-3.8-flash
   PORT=8000
   HOST=0.0.0.0
   CORS_ORIGINS=*
   ```

5. Run the FastAPI development server:
   ```bash
   python run.py
   ```
   The backend will start at `http://127.0.0.1:8000`.
   - Health check: `http://127.0.0.1:8000/health`
   - Interactive Swagger API docs: `http://127.0.0.1:8000/docs`

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

> **Note on API Key:** You can either set `GEMINI_API_KEY` in `backend/.env`, OR click the **Configure API Key** button directly in the PrepMate AI web interface to enter your key. It will be stored safely in your browser's local storage.

---

## 🌐 Deploying to Render

You can deploy PrepMate AI on Render using either **Render Blueprints (`render.yaml`)** or **Manual Service Setup**.

### Method A: One-Click Deploy via `render.yaml` (Recommended)

1. Push your repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: PrepMate AI"
   git branch -M main
   git remote add origin https://github.com/<your-username>/prepmate-ai.git
   git push -u origin main
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and create two services:
   - **`prepmate-ai-backend`** (Python Web Service)
   - **`prepmate-ai-frontend`** (Static Site)
6. Under `prepmate-ai-backend` environment variables, provide your `GEMINI_API_KEY`.
7. Click **Apply**. Both services will build and deploy with public HTTPS URLs!

---

### Method B: Manual Service Setup on Render

#### 1. Backend Web Service
- **Type:** Web Service
- **Name:** `prepmate-ai-backend`
- **Root Directory:** `backend`
- **Runtime:** `Python 3` (or `Docker`)
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `python run.py`
- **Health Check Path:** `/health`
- **Environment Variables:**
  - `PYTHON_VERSION`: `3.11.9`
  - `GEMINI_API_KEY`: `<Your-Gemini-API-Key>`
  - `GEMINI_MODEL`: `gemini-3.8-flash`
  - `CORS_ORIGINS`: `*`
- Note your deployed backend URL: e.g. `https://prepmate-ai-backend.onrender.com`

#### 2. Frontend Static Site
- **Type:** Static Site
- **Name:** `prepmate-ai-frontend`
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL`: `https://prepmate-ai-backend.onrender.com`
- **Redirects / Rewrites:**
  - Source: `/*`
  - Destination: `/index.html`
  - Action: `Rewrite`

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status and Gemini configuration check |
| `GET` | `/api/config` | Non-sensitive public server config |
| `POST` | `/api/generate-questions` | Generate role-tailored interview questions |
| `POST` | `/api/evaluate-answer` | Multi-dimensional scoring & feedback for an answer |
| `POST` | `/api/stream-evaluate-answer` | Live SSE streaming answer evaluation |
| `POST` | `/api/generate-sample-answer`| Generate student-friendly model answer |
| `POST` | `/api/stream-sample-answer` | Live SSE streaming model answer |
| `POST` | `/api/interview-summary` | Final aggregate scorecard and preparation roadmap |

---

## 🎓 Demonstrating for College / Project Evaluation

When explaining this project to evaluators:
1. **Generative AI Integration:** Explain how Google's `google-genai` SDK is used with structured JSON schemas and few-shot prompt constraints to eliminate hallucinations.
2. **Server-Sent Events (SSE):** Demonstrate real-time token streaming during answer evaluation, providing instant feedback without WebSocket overhead.
3. **Multi-dimensional Scoring:** Show that answers aren't just rated good/bad; they are systematically broken down into Correctness, Clarity, Depth, and Completeness out of 10.
4. **Resiliency & Graceful Degradation:** Show how the app handles missing keys, network interruptions, and malformed inputs with clear UI alerts.
5. **Accessibility & Voice Input:** Demonstrate the Web Speech API dictation button, allowing users to practice speaking answers aloud.

---

## 📄 License
This project is open-source and available under the **MIT License**.
