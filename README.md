# 📊 Weekly Report Dashboard

A full-stack web application built with **Next.js 16** and **Prisma** that enables team members to submit structured weekly progress reports and managers to track, filter, and analyze team submissions through an interactive visual dashboard and a conversational AI assistant.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React_19-149ECA?style=for-the-badge&logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>
<p>
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img alt="Neon" src="https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img alt="NextAuth.js" src="https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=auth0&logoColor=white" />
</p>
<p>
  <img alt="Zod" src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" />
  <img alt="Recharts" src="https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" />
  <img alt="Groq" src="https://img.shields.io/badge/Groq_(Llama_3.3)-F55036?style=for-the-badge&logo=groq&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

---

## 🚀 Key Features

*   **🔑 Secure Authentication & RBAC** — Role-based access control with secure credentials sign-in (`TEAM_MEMBER`, `MANAGER`, and `ADMIN`).
    *   *Password Eye Icon*: Interactive toggle button to hide or reveal password input values.
    *   *Real-time Password Complexity Checker*: Interactive checklist showing length, lowercase, uppercase, and digit rules dynamically as you type.
    *   *Instant Inline Validation*: Form fields validate instantly on keypress and automatically clear validation errors if inputs are corrected or emptied.
    *   *Admin-Gated Elevated Roles*: Team Member signups are active immediately; Manager/Admin signups are held as `PENDING` and cannot log in until an existing Admin approves the request from the **Pending Approvals** screen.
*   **📋 Fixed Weekly Report Structure** — Enforces a uniform report format (Week Date range, Project, Tasks Completed, Tasks Planned, Blocker tags, Hours Worked, and Notes) to keep reporting consistent and comparable across the team.
*   **⏳ Draft & Submission Lifecycle** — Supports saving progress as a draft for continuous editing. Once submitted, reports are permanently locked to preserve record integrity.
*   **📊 Manager Dashboard & Visual Insights**:
    *   *Metrics*: Total submissions, compliance rate, pending reports, and active blockers.
    *   *Visualizations*: Workload distribution by project (Interactive Donut Chart with slice opacity transitions on hover), submission status trends (Stacked Bar Chart), and task trends over time (Line Chart with active dot contrast rings).
    *   *Custom tooltips*: Recharts graphics utilize premium glassmorphic tooltips to show hover details.
    *   *Timeline*: A real-time timeline feed showing recent logs, status updates, and user credentials.
*   **📁 Project Management (CRUD)** — Full project list management (create, view, update, delete) accessible to managers.
*   **🤖 AI Chat Assistant (Good-to-Have)** — A floating conversational chat window showing a scrollable message thread, automatic scroll anchoring, typing indicators, and natural language Q&A about team activity (e.g. *"What did the team work on this week?"*) powered by Groq (Llama 3.3), with a built-in local summary fallback when no API key is configured.

---

## 🛠️ Technical Stack

| Layer | Technology | Notes |
| --- | --- | --- |
| ![Next.js](https://img.shields.io/badge/-Next.js-000?style=flat-square&logo=nextdotjs&logoColor=white) | **Next.js 16** | App Router — unified frontend & API routes |
| ![React](https://img.shields.io/badge/-React-149ECA?style=flat-square&logo=react&logoColor=white) | **React 19** | Client components + server components |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | **TypeScript** | Strict mode across frontend & backend |
| ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | **Tailwind CSS v4** | Obsidian Dark & Silver-Zinc Light custom themes |
| ![Prisma](https://img.shields.io/badge/-Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white) | **Prisma 7** | Type-safe ORM, migrations, schema modeling |
| ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) | **Neon Serverless Postgres** | Managed, autoscaling database |
| ![NextAuth](https://img.shields.io/badge/-NextAuth.js-000?style=flat-square&logo=auth0&logoColor=white) | **NextAuth.js** | Credentials provider, JWT sessions, RBAC |
| ![Zod](https://img.shields.io/badge/-Zod-3E67B1?style=flat-square&logo=zod&logoColor=white) | **Zod** | Request validation & form schemas |
| ![Recharts](https://img.shields.io/badge/-Recharts-FF6384?style=flat-square&logo=chartdotjs&logoColor=white) | **Recharts** | Dashboard charts & custom tooltips |
| ![Groq](https://img.shields.io/badge/-Groq-F55036?style=flat-square&logo=groq&logoColor=white) | **Groq (Llama 3.3)** | AI chat assistant, OpenAI-compatible API |
| ![Vercel](https://img.shields.io/badge/-Vercel-000?style=flat-square&logo=vercel&logoColor=white) | **Vercel** | Deployment target |

---

## 📂 Project Structure

```text
src/
  app/
    login/, register/                 # Authentication pages
    member/                           # Member views (new report, history logs)
    manager/                          # Manager views (dashboard, reports table, project list)
    api/                              # Backend REST endpoints (auth, reports, projects, ai)
  components/
    ui/                               # Shared design system components (Button, Input, Card, Modal)
    layout/                           # Shell layout & navbar tab structures
    charts/                           # Custom chart visualizations and tooltips
    ai/                               # Floating AI widget component
  lib/                                # Helper utilities (prisma Client, validations schema, auth)
prisma/
  schema.prisma                       # Database schema definition
  seed.ts                             # Deterministic demo seeder with users, projects, assignments, reports
```

---

## 💻 Setup Instructions

### 📦 1. Install Dependencies
Run the following command at the root of the project to install necessary packages:
```bash
npm install
```

### 🔑 2. Configure Environment Variables
Create a `.env` configuration file by copying the template:
```bash
cp .env.example .env
```
Fill in the values in your `.env` file:
*   `DATABASE_URL`: Your Neon Postgres serverless connection string.
*   `NEXTAUTH_SECRET`: A random security string to sign session tokens.
*   `NEXTAUTH_URL`: Set to `http://localhost:3000` for local development.
*   `GROQ_API_KEY`: *(Optional)* Your API key from Groq Console to enable LLM-powered answers. Without it, the chatbot uses a built-in local summary fallback.
*   `ALLOW_PUBLIC_ELEVATED_SIGNUP`: Keep `false` for normal use so Manager/Admin signups require Admin approval. Set `true` only for controlled demos where elevated signups should be auto-approved.

### 💾 3. Set Up the Database
Deploy database schemas and generate the Prisma Client bindings:
```bash
npx prisma migrate dev
npx prisma generate
```

### 🌱 4. Seed Demo Data
Reset and populate the demo database with realistic users, projects, project assignments, and weekly logs:
```bash
npm run db:seed
```
The seed creates 19 users, 24 projects, 48 project assignments, and 96 weekly reports. It resets the demo tables first, so rerunning it gives a clean consistent dataset.

### ⚡ 5. Start the Development Server
Launch the local Next.js development server:
```bash
npm run dev
```
Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## ☁️ Deploying to Vercel

1.  **Import the repo** into Vercel (New Project → select this GitHub repo). Framework preset auto-detects as Next.js; no build command changes needed — `npm run build` already runs `prisma generate` first.
2.  **Add environment variables** in Project Settings → Environment Variables:
    *   `DATABASE_URL` — the same Neon connection string (Neon is already serverless-friendly, no changes needed).
    *   `NEXTAUTH_SECRET` — the same generated secret, or a freshly generated one for production.
    *   `NEXTAUTH_URL` — **must be your production URL**, e.g. `https://your-app.vercel.app` (not `localhost`). If you're not sure of the final domain yet, deploy once, copy the assigned `*.vercel.app` URL, then set this variable and redeploy.
    *   `GROQ_API_KEY` — *(optional)* the same Groq key for LLM-powered answers. Without it, the AI assistant still uses the local summary fallback.
3.  **Database migrations** — the schema is already applied to the live Neon database, so no extra migration step is required at deploy time. If you change `schema.prisma` later, run `npx prisma migrate deploy` against the same `DATABASE_URL` before redeploying.
4.  **Redeploy** after adding env vars (Vercel doesn't pick up new variables on an already-running deployment).

---

## 👥 Demo Credentials
All seeded demo accounts use the password `Password123` and are pre-approved, bypassing the signup approval flow described below.

| Email | Role | Access Level |
| --- | --- | --- |
| `member@weekly.local` | `TEAM_MEMBER` | Create, edit drafts, and submit weekly reports. |
| `manager@weekly.local` | `MANAGER` | View all reports, filter logs, manage projects, and use AI assistant. |
| `admin@weekly.local` | `ADMIN` | Full application administration, including approving new Manager/Admin signups. |

### Role assignment & approval flow
Anyone can register as a `TEAM_MEMBER` and use the app immediately. Registering as `MANAGER` or `ADMIN` instead creates the account in a `PENDING` state — sign-in is blocked with a clear message until an existing Admin visits **Manager Hub → Approvals** (`/manager/approvals`, Admin-only) and approves or rejects the request.

---

## 🛡️ API Endpoints Summary

| Method & Route | Access Level | Description |
| --- | --- | --- |
| `POST /api/auth/register` | Public | Registers a new user. |
| `POST /api/auth/[...nextauth]` | Public | Authentication endpoint. |
| `GET /api/reports/my` | Member | Retrieves user's own reports. |
| `POST /api/reports` | Member | Creates a new report draft. |
| `PUT /api/reports/[id]` | Member | Updates a report draft. |
| `POST /api/reports/[id]/submit` | Member | Permanently submits and locks a report. |
| `GET /api/manager/dashboard` | Manager | Fetch summary metrics and charts dataset. |
| `GET /api/manager/reports` | Manager | Fetch filterable list of all submissions. |
| `POST /api/projects` | Manager | Creates a new project category. |
| `POST /api/ai/chat` | Manager | Natural language assistant responder. |
| `GET /api/manager/approvals` | Admin | Lists pending Manager/Admin signup requests. |
| `PATCH /api/manager/approvals/[id]` | Admin | Approves or rejects a pending signup request. |

---

## 🗃️ Deliverables & Links

*   **ER Diagram Source**: [docs/er-diagram.dbml](docs/er-diagram.dbml) *(Import to dbdiagram.io to generate interactive visual link)*
*   **Video Demo Link**: *[Add Google Drive video link here]*
*   **Presentation Slides**: *[Add Google Slides link here]*
