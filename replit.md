# Disha — दिशा

AI-powered counselor dashboard for first-generation college students, with WhatsApp/SMS bot integration via Twilio.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/disha-dashboard run dev` — run the counselor dashboard frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` — for WhatsApp/SMS sending

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + Tailwind + shadcn/ui
- Messaging: Twilio (WhatsApp + SMS fallback)

## Where things live

- DB schema: `lib/db/src/schema/` — students, conversations, risk_flags, scholarships, nudge_history
- API contract: `lib/api-spec/openapi.yaml`
- API routes: `artifacts/api-server/src/routes/`
- Twilio helper: `artifacts/api-server/src/lib/twilio.ts`
- Intake agent: `artifacts/api-server/src/lib/intake.ts`
- Risk scoring: `artifacts/api-server/src/lib/risk.ts`
- Dashboard: `artifacts/disha-dashboard/src/`

## Architecture decisions

- Students onboard entirely via WhatsApp/SMS — no app install required
- Twilio webhook at `POST /api/webhook/twilio` receives all incoming messages and routes to intake or knowledge agent
- Risk scores are recalculated on every incoming message
- Counselor dashboard auto-refreshes every 60 seconds
- The dashboard shows real-time risk flags with one-click check-in that fires a WhatsApp message to the student

## Product

Five core features:
1. **Intake Agent** — Onboards new students through a 8-question WhatsApp flow
2. **Knowledge Agent** — Answers questions about scholarships, fees, college rules
3. **Scholarship Matching** — Matches students against 4+ Karnataka/national schemes
4. **Silence Detector** — Risk scores every student daily; flags at-risk students to counselor
5. **Counselor Dashboard** — Real-time web dashboard with alert inbox, student profiles, conversation history, and one-click check-in

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after OpenAPI spec changes
- Always run `pnpm run typecheck:libs` after schema changes in `lib/db` before typechecking api-server
- Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER) must be set as env secrets for WhatsApp sending to work
- The webhook route accepts `application/x-www-form-urlencoded` (Twilio's default format)
