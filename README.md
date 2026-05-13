# Disha — दिशा

> AI-powered counselor dashboard for first-generation college students in India.  
> Students onboard via WhatsApp/SMS (no app install). Counselors monitor via a real-time web dashboard.

---

## System Workflow

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

---

### 2. Knowledge Agent (Post-Onboarding Queries)

```mermaid
flowchart TD
    A[Student sends message] --> B{Keyword match}
    B -->|scholarship / apply| C[matchScholarships\nNSP, Rajiv Gandhi, Vidyasiri, AICTE]
    B -->|fee help / fee extension| D[Fee extension guidance\n+ draft letter offer]
    B -->|resources / fresher / guide| E[First-year resources\nNPTEL, NSS, documents, deadlines]
    B -->|yes + fee pending| F[Generate fee extension\nrequest letter template]
    B -->|anything else| G[Default help menu]
    C --> H[Save outbound message to DB]
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I[Mark pending nudge as responded\nif student had unanswered check-in]
    I --> J[recalculateRiskScore]
    J --> K[TwiML response → Twilio → Student]
```

---

### 3. Risk Scoring Engine

```mermaid
flowchart LR
    A[Trigger:\nEvery inbound message\nOR daily cron at 06:00 UTC] --> B[Fetch student from DB]
    B --> C{daysSilent}
    C -->|>= 14 days| D[+5 points]
    C -->|7–13 days| E[+3 points]
    B --> F{feeStatus}
    F -->|pending| G[+3 points]
    F -->|partial| H[+1 point]
    B --> I{Last 5 nudges\nignored >= 3}
    I -->|yes| J[+2 points]
    D & E & G & H & J --> K[Total Score 0–15]
    K -->|0–3| L[LOW]
    K -->|4–6| M[MEDIUM]
    K -->|7–9| N[HIGH\nAuto-flag student]
    K -->|10+| O[CRITICAL\nAuto-flag student]
    N --> P[INSERT risk_flag\nif none open]
    O --> P
```

---

### 4. Daily Silence Detector (Cron Job)

```mermaid
flowchart TD
    A[node-cron fires\nEvery day at 06:00 UTC] --> B[SELECT all students]
    B --> C[For each student:\ncompute daysSilent\nfrom lastMessageAt or createdAt]
    C --> D[UPDATE students SET daysSilent]
    D --> E[recalculateRiskScore for each student]
    E --> F{score >= 7?}
    F -->|yes + no open flag| G[INSERT risk_flag\ncritical / high]
    F -->|no| H[No action]
    G & H --> I[Done — counselor sees fresh\nalerts on next dashboard load]

    J[POST /api/admin/run-silence-detector] -->|Manual trigger for demos| B
```

---

### 5. Counselor Dashboard & Nudge Tracking Flow

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

        C->>API: GET /api/risk-flags?resolved=false
        API->>DB: SELECT unresolved flags
        DB-->>API: RiskFlag[]
        API-->>C: Alert inbox
    end

    C->>API: GET /api/students/:id/conversations
    API-->>C: Full conversation history

    C->>API: GET /api/students/:id/nudges
    API-->>C: Nudge history with responded status

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

    C->>API: POST /api/risk-flags/:id/resolve
    API->>DB: UPDATE resolved = true
    API-->>C: Flag removed from inbox
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 24, TypeScript 5.9 |
| Monorepo | pnpm workspaces |
| API Server | Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod v4 + drizzle-zod |
| API Contract | OpenAPI 3 spec → Orval codegen (React Query hooks + Zod schemas) |
| Build | esbuild (server), Vite (frontend) |
| Frontend | React 18, Vite, Tailwind CSS v4, shadcn/ui |
| Animations | Framer Motion |
| Messaging | Twilio (WhatsApp primary, SMS fallback) |
| Scheduling | node-cron (daily silence detector) |
| Deployment | Replit |

---

## Six Core Features

| # | Feature | Description |
|---|---|---|
| 1 | **Intake Agent** | 8-step WhatsApp onboarding: language → name → college → year/branch → hometown → income → caste → fee status |
| 2 | **Knowledge Agent** | Answers scholarship, fee, and college-life queries post-onboarding |
| 3 | **Scholarship Matching** | Auto-matches NSP, Karnataka Rajiv Gandhi, Vidyasiri, AICTE Pragati based on caste + income profile |
| 4 | **Silence Detector** | Daily cron at 06:00 UTC — recomputes `daysSilent` for every student, refreshes risk scores, auto-creates flags. Manual trigger via `POST /api/admin/run-silence-detector` |
| 5 | **Nudge History Tracker** | Every counselor check-in is recorded with `responded` status. Automatically marked as responded when the student replies on WhatsApp. Feeds into risk score (`ignored nudges ≥ 3 → +2 pts`) |
| 6 | **Counselor Dashboard** | Real-time web dashboard — alert inbox, student profiles, conversation history, nudge history tab with responded/awaiting status, one-click check-in |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/healthz` | Health check |
| GET | `/api/students` | List students (filter by riskLevel, college, search, flagged) |
| GET | `/api/students/:id` | Student profile |
| PATCH | `/api/students/:id` | Update student (feeStatus, flagged) |
| GET | `/api/students/:id/conversations` | Conversation history |
| GET | `/api/students/:id/nudges` | Nudge history with responded status |
| POST | `/api/students/:id/check-in` | Send counselor check-in via WhatsApp/SMS |
| GET | `/api/risk-flags` | List risk flags (filter by resolved, severity) |
| PATCH | `/api/risk-flags/:id/resolve` | Mark a risk flag as resolved |
| GET | `/api/scholarships` | List active scholarship schemes |
| GET | `/api/dashboard/summary` | Dashboard stats + risk breakdown |
| POST | `/api/webhook/twilio` | Twilio inbound message webhook |
| POST | `/api/admin/run-silence-detector` | Manually trigger silence detector |

---

## Risk Score Formula

```
Score = days_silent_score + fee_score + ignored_nudges_score

days_silent >= 14  →  +5
days_silent 7–13   →  +3
fee = pending      →  +3
fee = partial      →  +1
nudges ignored ≥3  →  +2

0–3   → LOW
4–6   → MEDIUM
7–9   → HIGH     (auto-flag)
10+   → CRITICAL  (auto-flag)
```

---

## Running Locally

```bash
# Install deps
pnpm install

# Push DB schema
pnpm --filter @workspace/db run push

# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start dashboard (port auto-assigned)
pnpm --filter @workspace/disha-dashboard run dev

# Regenerate API hooks after OpenAPI changes
pnpm --filter @workspace/api-spec run codegen

# Manually trigger silence detector (demo / testing)
curl -X POST http://localhost:80/api/admin/run-silence-detector
```

**Required env:**
- `DATABASE_URL` — PostgreSQL connection string
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` — for WhatsApp/SMS
- `SESSION_SECRET` — session signing

**Twilio webhook:** `POST /api/webhook/twilio`  
**WhatsApp Sandbox:** `+14155238886` (join with your sandbox keyword)
