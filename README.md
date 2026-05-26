# Disha — दिशा

> **AI-powered college guidance & student welfare platform for first-generation college students in India.**  
> Students onboard via **WhatsApp/SMS** (no app install). Counselors monitor via a **real-time web dashboard**.

🌐 **Live:** [https://disha-jwj9.onrender.com](https://disha-jwj9.onrender.com)

---

## ✨ What is Disha?

Disha (meaning "direction" in Hindi) is a full-stack platform that helps college counselors identify and support at-risk students — before they silently drop out.

- **Students** interact entirely via **WhatsApp** — zero downloads, zero friction
- **Counselors** get a real-time **web dashboard** with risk alerts, conversation history, and one-click check-ins
- **Multilingual** — supports English, Hindi, Kannada, Telugu, and Tamil

---

## 🎯 Core Features

| # | Feature | Description |
|---|---|---|
| 1 | **WhatsApp Intake Agent** | 8-step conversational onboarding via WhatsApp: language → name → college → branch/year → hometown → income → caste → fee status |
| 2 | **Knowledge Agent** | Answers scholarship, fee extension, and college-life queries post-onboarding via keyword matching |
| 3 | **Scholarship Matching** | Auto-matches students to government schemes (NSP, Rajiv Gandhi, Vidyasiri, AICTE Pragati) based on caste + income |
| 4 | **Risk Scoring Engine** | Real-time 0–15 risk score based on days silent, fee status, and ignored nudges. Auto-flags HIGH/CRITICAL students |
| 5 | **Silence Detector** | Daily cron (06:00 UTC) computes `daysSilent` for all students, refreshes risk scores, and auto-creates alerts |
| 6 | **Nudge Tracking** | Every counselor check-in is tracked. Auto-marked as "responded" when student replies. Feeds into risk score |
| 7 | **Counselor Dashboard** | Real-time dashboard with alert inbox, student profiles, conversation history, nudge timeline, one-click check-in |
| 8 | **Student Portal** | Web portal for students — dashboard, chat, scholarships, fees, and curated resources |
| 9 | **Multilingual Support** | Full WhatsApp bot in 5 languages (English, Hindi, Kannada, Telugu, Tamil) with runtime language switching |

---

## 🏗 Architecture

```
┌──────────────┐     ┌──────────┐     ┌────────────────────────┐
│  Student      │     │  Twilio   │     │  Express 5 API Server  │
│  (WhatsApp)   │◄───►│  Gateway  │◄───►│                        │
└──────────────┘     └──────────┘     │  ┌──────────────────┐ │
                                       │  │ Intake Agent      │ │
┌──────────────┐     ┌──────────┐     │  │ Knowledge Agent   │ │
│  Counselor    │◄───►│ React    │◄───►│  │ Risk Engine       │ │
│  (Browser)    │     │ SPA      │     │  │ Silence Detector  │ │
└──────────────┘     └──────────┘     │  └──────────────────┘ │
                                       │           ▼           │
                                       │  ┌──────────────────┐ │
                                       │  │ PostgreSQL (Neon) │ │
                                       │  └──────────────────┘ │
                                       └────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 24, TypeScript 5.9 |
| **Monorepo** | pnpm workspaces |
| **API Server** | Express 5 |
| **Database** | PostgreSQL (Neon) + Drizzle ORM |
| **Validation** | Zod v4 + drizzle-zod |
| **API Contract** | OpenAPI 3 → Orval codegen (React Query hooks + Zod schemas) |
| **Build** | esbuild (server), Vite 7 (frontend) |
| **Frontend** | React 19, Tailwind CSS v4, shadcn/ui, Framer Motion |
| **Messaging** | Twilio (WhatsApp primary, SMS fallback) |
| **Scheduling** | node-cron |
| **Deployment** | Render (Web Service) + Neon (Serverless PostgreSQL) |

---

## 📂 Project Structure

```
disha/
├── artifacts/
│   ├── api-server/              # Express 5 backend
│   │   └── src/
│   │       ├── lib/             # Bot logic, intake, risk, twilio, translations
│   │       ├── routes/          # API route handlers
│   │       └── middlewares/
│   ├── disha-dashboard/         # React frontend (Vite + Tailwind + shadcn/ui)
│   │   └── src/
│   │       ├── pages/           # All application pages (15 pages)
│   │       ├── components/      # Layouts + UI components
│   │       └── hooks/
│   └── mockup-sandbox/
├── lib/
│   ├── api-client-react/        # Auto-generated React Query hooks (Orval)
│   ├── api-zod/                 # Auto-generated Zod validation schemas (Orval)
│   ├── api-spec/                # OpenAPI 3 spec + codegen config
│   └── db/                      # Drizzle ORM schema + database client
├── scripts/
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## 🔄 System Workflows

### 1. Student Onboarding (WhatsApp → Intake Agent)

```mermaid
sequenceDiagram
    participant S as Student (WhatsApp)
    participant T as Twilio
    participant W as Webhook<br/>/api/webhook/twilio
    participant DB as PostgreSQL
    participant R as Risk Engine

    S->>T: First message (any text)
    T->>W: POST (From, Body)
    W->>DB: Lookup student by phone
    DB-->>W: Not found → new student
    W->>DB: INSERT student record
    W-->>T: Welcome + Language question (Step 0)
    T-->>S: WhatsApp reply

    loop 8-Step Intake (Steps 0–7)
        S->>T: Answer (number/text)
        T->>W: POST (From, Body)
        W->>DB: Save answer, increment onboardingStep
        W-->>T: Next question
        T-->>S: WhatsApp reply
    end

    Note over W,DB: Step 7 complete → onboardingComplete = true
    W->>DB: Match scholarships by caste + income
    W-->>T: Scholarships + First-Year Resources
    T-->>S: WhatsApp reply
    W->>R: recalculateRiskScore(studentId)
    R->>DB: UPDATE riskScore, riskLevel
```

### 2. Knowledge Agent (Post-Onboarding)

```mermaid
flowchart TD
    A[Student sends message] --> B{Keyword match}
    B -->|scholarship / apply| C[matchScholarships<br/>NSP, Rajiv Gandhi, Vidyasiri, AICTE]
    B -->|fee help / fee extension| D[Fee extension guidance<br/>+ draft letter offer]
    B -->|resources / fresher / guide| E[First-year resources<br/>NPTEL, NSS, documents, deadlines]
    B -->|yes + fee pending| F[Generate fee extension<br/>request letter template]
    B -->|change language| G[Language selection menu]
    B -->|anything else| H[Help menu in student's language]
```

### 3. Risk Scoring Engine

```mermaid
flowchart LR
    A[Trigger:<br/>Every inbound message<br/>OR daily cron at 06:00 UTC] --> B[Fetch student from DB]
    B --> C{daysSilent}
    C -->|>= 14 days| D[+5 points]
    C -->|7–13 days| E[+3 points]
    B --> F{feeStatus}
    F -->|pending| G[+3 points]
    F -->|partial| H[+1 point]
    B --> I{Last 5 nudges<br/>ignored >= 3}
    I -->|yes| J[+2 points]
    D & E & G & H & J --> K[Total Score 0–15]
    K -->|0–3| L[LOW]
    K -->|4–6| M[MEDIUM]
    K -->|7–9| N[HIGH<br/>Auto-flag student]
    K -->|10+| O[CRITICAL<br/>Auto-flag student]
```

### 4. Counselor Dashboard & Nudge Flow

```mermaid
sequenceDiagram
    participant C as Counselor (Browser)
    participant API as Express API
    participant DB as PostgreSQL
    participant T as Twilio
    participant S as Student (WhatsApp)

    loop Auto-refresh every 60s
        C->>API: GET /api/dashboard/summary
        API->>DB: Aggregate stats + risk breakdown
        DB-->>API: DashboardSummary
        API-->>C: totalStudents, atRisk, criticalCount...
    end

    C->>API: POST /api/students/:id/check-in { message }
    API->>DB: INSERT outbound conversation
    API->>DB: INSERT nudge_history (responded=false)
    API->>T: Send WhatsApp/SMS message
    T-->>S: Delivered to student
    API-->>C: 200 OK

    Note over S,DB: Student replies on WhatsApp
    S->>T: Inbound message
    T->>API: POST /api/webhook/twilio
    API->>DB: Mark latest pending nudge responded=true
    API->>DB: recalculateRiskScore (ignored nudge count drops)
```

---

## 📡 API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/healthz` | Health check |
| `GET` | `/api/students` | List students (filter by riskLevel, college, search, flagged) |
| `GET` | `/api/students/:id` | Student profile |
| `PATCH` | `/api/students/:id` | Update student (feeStatus, flagged) |
| `GET` | `/api/students/:id/conversations` | Conversation history |
| `GET` | `/api/students/:id/nudges` | Nudge history with responded status |
| `POST` | `/api/students/:id/check-in` | Send counselor check-in via WhatsApp/SMS |
| `GET` | `/api/risk-flags` | List risk flags (filter by resolved, severity) |
| `PATCH` | `/api/risk-flags/:id/resolve` | Mark a risk flag as resolved |
| `GET` | `/api/scholarships` | List active scholarship schemes |
| `GET` | `/api/dashboard/summary` | Dashboard stats + risk breakdown |
| `POST` | `/api/webhook/twilio` | Twilio inbound message webhook |
| `POST` | `/api/admin/run-silence-detector` | Manually trigger silence detector |

---

## 🧮 Risk Score Formula

```
Score = days_silent_score + fee_score + ignored_nudges_score    (max 15)

days_silent >= 14   →  +5
days_silent 7–13    →  +3
fee = pending       →  +3
fee = partial       →  +1
nudges ignored >= 3 →  +2

0–3   → 🟢 LOW
4–6   → 🟡 MEDIUM
7–9   → 🔴 HIGH      (auto-flag)
10+   → ⚫ CRITICAL   (auto-flag)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 24+
- **pnpm** 11+
- **PostgreSQL** database (recommend [Neon](https://neon.tech))
- **Twilio** account with WhatsApp Sandbox

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# Server
PORT=8080
NODE_ENV=development
SESSION_SECRET=your-secret-key

# Twilio (WhatsApp Sandbox)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=whatsapp:+14155238886
```

### Installation & Running

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start frontend dashboard (port 5173)
pnpm --filter @workspace/disha-dashboard run dev

# Regenerate API hooks (after OpenAPI spec changes)
pnpm --filter @workspace/api-spec run codegen

# Manually trigger silence detector (for testing)
curl -X POST http://localhost:8080/api/admin/run-silence-detector
```

### Twilio Webhook Setup

1. Set up your [Twilio WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. Set the webhook URL to: `https://your-domain.com/api/webhook/twilio`
3. Method: `POST`

---

## 🌐 Deployment (Render)

This project is deployed on [Render](https://render.com) as a single **Web Service**:

| Setting | Value |
|---|---|
| **Build Command** | `npx pnpm install && npx pnpm run build` |
| **Start Command** | `node --enable-source-maps ./artifacts/api-server/dist/index.mjs` |
| **Environment** | Add all `.env` variables in the Render dashboard |

The Express server serves both the API (`/api/*`) and the React SPA (all other routes).

---

## 🗺 Roadmap

| Phase | Feature |
|---|---|
| v1.1 | AI-powered responses (Gemini/GPT integration) |
| v1.2 | College ERP attendance integration |
| v1.3 | Push notifications for counselors |
| v2.0 | Multi-college support with role-based access |
| v2.1 | Analytics dashboard with trend analysis |
| v3.0 | Native mobile app for counselors |

---

## 👨‍💻 Author

**Mohammed Ikram**

---

*Disha — Giving direction to every first-generation student's journey. 🎓*
