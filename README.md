<div align="center">

# 📊 Weekly Report Dashboard

**A full-stack team reporting platform — members submit structured weekly reports,<br/>managers analyze the whole team through dashboards, filters, and an AI assistant.**

<br/>

<img alt="Next.js" src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
<img alt="React" src="https://img.shields.io/badge/React_19-149ECA?style=for-the-badge&logo=react&logoColor=white" />
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />

<img alt="Prisma" src="https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img alt="PostgreSQL" src="https://img.shields.io/badge/Neon_Postgres-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
<img alt="NextAuth.js" src="https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=auth0&logoColor=white" />
<img alt="Zod" src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" />

<img alt="Recharts" src="https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" />
<img alt="Groq" src="https://img.shields.io/badge/Groq_·_Llama_3.3-F55036?style=for-the-badge&logo=groq&logoColor=white" />
<img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />

<br/>
<br/>

[Features](#-features) · [Quick Start](#-quick-start) · [Demo Accounts](#-demo-accounts) · [Architecture](#%EF%B8%8F-architecture) · [API](#%EF%B8%8F-api-overview) · [AI Assistant](#-ai-assistant-approach) · [Deployment](#%EF%B8%8F-deploying-to-vercel) · [Deliverables](#%EF%B8%8F-deliverables)

</div>

---

## ✨ Features

### 🔑 Authentication & Role-Based Access
Credentials sign-in backed by **NextAuth (JWT sessions)** and **bcrypt** password hashing, with three roles: `TEAM_MEMBER`, `MANAGER`, `ADMIN`.

- Live password-strength checklist, show/hide toggle, and instant inline validation on the auth forms
- **Admin-gated elevated signups** — Team Members are active immediately; Manager/Admin registrations are held `PENDING` and cannot sign in until an Admin approves them from the Approvals screen
- Route-level protection (edge middleware) **and** per-endpoint guards on every API route

### 📋 Personal Weekly Reports
A fixed, identical report structure for every member — week date range, project, tasks completed, tasks planned, blockers, hours, notes — so reports stay comparable across the team.

- **Draft → Submit lifecycle**: drafts are freely editable and deletable; submitted reports are permanently locked to preserve record integrity
- **Drafts are private to their author** — managers see an unsubmitted draft only as a content-redacted **Pending** row (member / project / week, no detail view)
- Report history organized week by week with grouped headers
- Late submissions are detected automatically and flagged as `LATE`

### 📊 Manager Dashboard & Team Reports
- **Summary metrics**: reports submitted this week, team compliance rate, open blockers, pending members
- **Charts (Recharts)**: reports submitted per week (line), submission status by member incl. pending (stacked bars), workload across top projects (horizontal bars), plus a recent-activity feed
- **All Team Reports** view with combined filters: week quick-pick (This week / Last week / earlier), member, project, status (`Submitted / Pending / Late`), and custom date range
- Full-page report detail view with member profile, hours, week range, and highlighted blockers

### 📁 Projects & Team Management
- Full project CRUD for managers, with duplicate-name protection and deletion blocked while reports reference a project
- Assign team members to projects from the Team page (checkbox modal, diffed updates)
- Admins can change member roles, with lockout guards so the system always keeps at least one admin

### 🤖 AI Chat Assistant *(Good-to-Have)*
A floating chat widget for managers with natural-language Q&A about team activity — *"What did the team work on this week?"* — powered by **Groq (Llama 3.3 70B)** with a **fully local fallback** when no API key is configured. Detailed write-up in [AI Assistant Approach](#-ai-assistant-approach).

---

## 🚀 Quick Start

> **Prerequisites:** Node.js 20+, npm, and a PostgreSQL connection string (a free [Neon](https://neon.tech) database works out of the box).

**1 — Install dependencies**

```bash
npm install
```

**2 — Configure environment variables**

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
| --- | :---: | --- |
| `DATABASE_URL` | ✅ | Neon / PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Random string used to sign session tokens |
| `NEXTAUTH_URL` | ✅ | `http://localhost:3000` for local development |
| `GROQ_API_KEY` | — | Enables LLM answers; without it the assistant uses the local fallback |
| `ALLOW_PUBLIC_ELEVATED_SIGNUP` | — | Keep `false` so Manager/Admin signups require Admin approval |

**3 — Set up the database**

```bash
npx prisma migrate dev
npx prisma generate
```

**4 — Seed demo data**

```bash
npm run db:seed
```

Creates **19 users, 24 projects, 48 project assignments, and 96 weekly reports** with realistic content and mixed statuses. The seeder resets demo tables first, so rerunning always yields the same clean dataset.

**5 — Run the app**

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** and sign in with a demo account below.

---

## 👥 Demo Accounts

All seeded accounts share the password **`Password123`** and are pre-approved.

| Email | Role | What you can do |
| --- | --- | --- |
| `member@weekly.local` | `TEAM_MEMBER` | Create, edit, and submit weekly reports; browse own history |
| `manager@weekly.local` | `MANAGER` | Team dashboard, all reports + filters, project & assignment management, AI assistant |
| `admin@weekly.local` | `ADMIN` | Everything managers can, plus signup approvals and member role management |

**Role assignment & approval flow** — anyone can register as a `TEAM_MEMBER` and use the app immediately. Registering as `MANAGER` or `ADMIN` creates the account in a `PENDING` state; sign-in stays blocked (with a clear message) until an Admin approves or rejects the request at **Approvals** (`/manager/approvals`).

---

## 🏗️ Architecture

Single **Next.js 16 App Router** application — the React frontend and the REST API live in one deployable unit.

```text
src/
├── app/
│   ├── login/  register/          # Public auth pages
│   ├── member/                    # Member workspace (new report, edit, history)
│   ├── manager/                   # Manager hub (dashboard, reports, projects, team, approvals)
│   └── api/                       # REST endpoints (auth, reports, manager, projects, ai)
├── components/
│   ├── ui/                        # Design system (Button, Input, Card, Modal, Badge, …)
│   ├── layout/                    # Navbar + role-specific sidebars
│   ├── reports/                   # Report form, table, filters, cards
│   ├── charts/                    # Recharts visualizations + shared theming
│   └── ai/                        # Floating AI chat widget
├── lib/                           # auth, session guards, validations, dashboard analytics, utils
└── types/                         # Shared TypeScript types
prisma/
├── schema.prisma                  # Users, Projects, UserProject, WeeklyReport (+ enums)
└── seed.ts                        # Deterministic demo seeder
docs/
└── er-diagram.dbml                # ER diagram source (import at dbdiagram.io)
```

**Layered responsibilities**

| Layer | Where | Notes |
| --- | --- | --- |
| Route protection | `src/proxy.ts` | Edge middleware gates `/member/**` and `/manager/**` by role |
| Endpoint guards | `src/lib/session.ts` | `requireSession / requireTeamMember / requireManager / requireAdmin` |
| Validation | `src/lib/validations.ts` | Zod schemas shared by API routes and client forms |
| Business logic | `src/lib/dashboard.ts`, route handlers | Analytics, draft privacy, submission rules |
| Data | Prisma 7 + Neon Postgres | Migrations + deterministic seed |

---

## 🛡️ API Overview

Every endpoint enforces its access level server-side — the UI hiding a button is never the only protection.

| Method & Route | Access | Description |
| --- | --- | --- |
| `POST /api/auth/register` | Public | Register (elevated roles created as `PENDING`) |
| `POST /api/auth/[...nextauth]` | Public | NextAuth sign-in / session / sign-out |
| `GET /api/reports/my` | Member | Own reports, newest week first |
| `POST /api/reports` | Member | Create a report draft |
| `PUT · DELETE /api/reports/[id]` | Member | Edit / delete own **drafts** only |
| `POST /api/reports/[id]/submit` | Member | Submit & permanently lock a report |
| `GET /api/manager/dashboard` | Manager | Summary metrics + chart datasets |
| `GET /api/manager/reports` | Manager | Filterable team reports; drafts appear as content-redacted `PENDING` rows |
| `GET · POST /api/projects` | Session / Manager | List projects (members need it for the report form) / create |
| `PUT · DELETE /api/projects/[id]` | Manager | Update / delete (blocked while reports reference the project) |
| `GET · PATCH /api/manager/members` | Manager / Admin | List members + assignments / change roles (lockout-guarded) |
| `PUT /api/manager/members/[id]/projects` | Manager | Set a member's project assignments |
| `GET · PATCH /api/manager/approvals` | Admin | List / decide pending elevated signups |
| `POST /api/ai/chat` | Manager | AI assistant Q&A over team reports |

---

## 🤖 AI Assistant Approach

### Architecture
The assistant lives behind a single manager-gated endpoint, `POST /api/ai/chat`. On each question it:

1. Verifies the caller is a `MANAGER` or `ADMIN` — team members can neither reach the endpoint nor see the widget
2. Queries up to 100 recent **submitted** reports (drafts are never included) and compacts them into a structured analytics context: current-week submission counts, pending members, open blockers, per-project workload and hours, recent report snippets
3. Sends the question + context to **Groq** (`llama-3.3-70b-versatile`, OpenAI-compatible API, `temperature 0.2`, `max_tokens 900`) — a grounded context-injection approach (lightweight RAG over stored reports) rather than fine-tuning or tool use
4. If `GROQ_API_KEY` is missing or the call fails, a **fully local fallback** answers by keyword-routing the question (blockers / workload / status / summary) over the same analytics — the feature never breaks without a key. Responses are tagged `mode: "ai"` or `mode: "local"`

### Prompt Design
The system prompt constrains the model to the injected data:

> *"You are a concise assistant for an engineering manager. Answer using only the weekly report data provided in the context. Prefer concrete names, projects, weeks, blockers, and hours when available. If the context does not contain the answer, say so and suggest the closest available summary."*

The user turn is templated as `Question: <question>` followed by the compacted report context, so answers always reflect fresh data. Low temperature keeps answers factual, and the model is explicitly told to admit when the context lacks an answer.

### Data Privacy
- **Access control** — endpoint and widget are manager/admin-only; the assistant never exposes report data to other members
- **What leaves the app** — with a key configured, the compacted context (names, projects, task text, blockers, hours) is sent to Groq per request only; no conversation history is persisted server-side
- **Draft privacy** — unsubmitted drafts are never fed to the assistant or any external API
- **Zero-egress mode** — without a key, the local fallback answers entirely in-process; recommended for privacy-sensitive deployments
- **Input hardening** — questions are validated and capped at 1,000 characters to limit prompt-injection surface

---

## ☁️ Deploying to Vercel

<details>
<summary><b>Step-by-step deployment guide</b></summary>

<br/>

1. **Import the repo** into Vercel (New Project → select this GitHub repo). The framework preset auto-detects Next.js; no build changes needed — `npm run build` already runs `prisma generate` first.
2. **Add environment variables** in Project Settings → Environment Variables:
   - `DATABASE_URL` — the same Neon connection string (Neon is serverless-friendly as-is)
   - `NEXTAUTH_SECRET` — the same secret, or a freshly generated one for production
   - `NEXTAUTH_URL` — **your production URL** (e.g. `https://your-app.vercel.app`, not `localhost`). If the final domain is unknown, deploy once, copy the assigned URL, set the variable, and redeploy
   - `GROQ_API_KEY` — *(optional)* enables LLM answers; the local fallback works without it
3. **Migrations** — the schema is already applied to the live Neon database, so no deploy-time step is needed. After future schema changes, run `npx prisma migrate deploy` against the same `DATABASE_URL` before redeploying.
4. **Redeploy** after adding env vars — Vercel doesn't inject new variables into an existing deployment.

</details>

---

## 🗃️ Deliverables

| Deliverable | Link |
| --- | --- |
| **GitHub Repository** | [github.com/MacroMaster101/weekly-report-dashboard](https://github.com/MacroMaster101/weekly-report-dashboard) |
| **ER Diagram** | [View on Google Drive](https://drive.google.com/file/d/1gfjdz2Y40RZZx3JBHwDeA8u0509ateUn/view?usp=sharing) · source: [`docs/er-diagram.dbml`](docs/er-diagram.dbml) |
| **Video Demo** | [Watch on Google Drive](https://drive.google.com/file/d/1Eyz1_fVWB-Cr8xyYfv5KXerL1sYok5UD/view?usp=sharing) |
| **Presentation Slides** | [View on Google Slides](https://docs.google.com/presentation/d/1LKFZeBU-E9T3gX-ziaqwojrmLdDjla5Fc-x833wdHi0/edit?usp=sharing) |
