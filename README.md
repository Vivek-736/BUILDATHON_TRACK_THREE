<div align="center">

<img src="./public/favicon.svg" width="48" height="48" alt="RecoverAI Logo" style="display:inline-block; vertical-align:middle; margin-right:12px;" />
<h1 style="display:inline-block; vertical-align:middle; margin:0; font-size:2.5rem; font-weight:800;">RecoverAI</h1>

<h3>Autonomous Revenue Recovery Intelligence & Gated Financial Workflows</h3>

<p>Detect revenue at risk. Diagnose the root cause. Gate with deterministic policies. Recover the money. Measure the exact financial impact.</p>

[![Next.js](https://img.shields.io/badge/Next.js-15%2B-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NVIDIA Nemotron](https://img.shields.io/badge/AI-NVIDIA%20Nemotron-76B900?style=flat-square&logo=nvidia)](https://openrouter.ai/)
[![Trigger.dev](https://img.shields.io/badge/Workflows-Trigger.dev%20v3-00DC82?style=flat-square&logo=triggerdotdev)](https://trigger.dev/)
[![Neon Postgres](https://img.shields.io/badge/Database-Neon%20Serverless-00E599?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-0C2340?style=flat-square&logo=razorpay)](https://razorpay.com/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-C5F74F?style=flat-square)](https://orm.drizzle.team/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat-square&logo=clerk)](https://clerk.com/)

</div>

---

## 🎯 The Vision & Core Loop

Every year, merchants lose billions in legitimate revenue due to transient gateway timeouts, issuer bank server hiccups, temporary balance insufficiencies, and friction during 3DS authentication. Most merchants either spam retries blindly (risking high fraud penalties) or do nothing at all.

**RecoverAI is not a chatbot.** It is a full-stack, autonomous revenue recovery control center that operates on a continuous, closed-loop principle:

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  DETECT  │ ──► │ DIAGNOSE │ ──► │  DECIDE  │ ──► │   GATE   │ ──► │   ACT    │ ──► │ RECOVER  │ ──► │ MEASURE  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
 Live Payment     AI (Nemotron)     Optimal Recovery  Deterministic   Controlled Tools  Durable Workflows   Exact Ledger
 Loss Ingested    Root Cause Anal.  Intervention      Policy Engine   (MCP Razorpay)    (Trigger.dev)       ₹ Captured
```

---

## 🛡️ Architectural Principle: AI Reasons, Code Controls Money

A core architectural tenet of RecoverAI is that **an LLM is never the final authority for a financial transaction**.

```
                           ┌──────────────────────────────────────────────┐
                           │          AI DIAGNOSTIC REASONING             │
                           │   (NVIDIA Nemotron / OpenRouter LLM)         │
                           └──────────────────────────────────────────────┘
                                                   │
                                          Proposes Intervention
                                                   ▼
                           ┌──────────────────────────────────────────────┐
                           │         DETERMINISTIC POLICY ENGINE          │
                           │   • Max 3 Attempts Per Case                  │
                           │   • Max Auto Amount Cap (≤ ₹50,000)          │
                           │   • Permitted Transient Categories Only      │
                           │   • Customer Risk Ceiling (≤ 75%)            │
                           └──────────────────────────────────────────────┘
                                            │              │
                                   ALLOWED  │              │  REJECTED
                                            ▼              ▼
                    ┌───────────────────────────────┐   ┌───────────────────────────────┐
                    │   CONTROLLED APPLICATION TOOL │   │     GRACEFUL POLICY HALT      │
                    │   • retry_payment             │   │   • Logs Policy Rejection     │
                    │   • send_recovery_link        │   │   • Prevents Financial Spam   │
                    │   • schedule_delayed_retry    │   └───────────────────────────────┘
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   TRIGGER.DEV DURABLE ENGINE  │
                    │   Stateful Backoffs & Retries │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   VERIFIED NEON DB LEDGER     │
                    │   • Real-time ₹ Recovered     │
                    │   • Immutable Audit Trail     │
                    └───────────────────────────────┘
```

---

## ✨ Key Capabilities & System Features

### 1. 🛍️ NovaCart Storefront & Interactive Simulation
- Realistic, high-conversion electronics storefront with interactive cart drawer.
- Integrated with Razorpay Standard Checkout in Test Mode.
- Live **Simulation Switcher** allowing instant injection of gateway failure states:
  - `Bank Server Technical Error`
  - `Insufficient Funds at Auth`
  - `Network Timeout`
  - `User Dropped Checkout Drawer`
  - `Card Expired (Terminal)`

### 2. 📊 Revenue Intelligence Engine & Recoverability Scoring
- Live KPI computations derived exclusively from persisted Neon database events:
  - **Revenue at Risk (₹)**: Current volume in jeopardy.
  - **Recoverable Revenue (₹)**: Algorithmic assessment of recoverable capital.
  - **Revenue Recovered (₹)**: Verified captured funds after successful interventions.
  - **Recovery Rate %**: Real-time conversion percentage.
- **Deterministic 0–100% Probability Scoring**: Multi-factor model assessing failure transient severity, customer lifetime value, historical order reliability, and retry backoff decay.

### 3. 🧠 Autonomous NVIDIA Nemotron Diagnostic Agent
- Structured prompt architecture ingesting gateway error traces, customer credit risk profiles, and active merchant policy constraints.
- Employs strict **Zod schema validation** returning:
  - `diagnosis`: Plain-English operational explanation of root cause.
  - `recommendedAction`: Bounded intervention (`retry_payment`, `send_recovery_link`, `schedule_delayed_retry`, `stop_recovery`).
  - `delaySeconds`: Optimal delay interval for transient recovery.
  - `rationale` & `confidenceScore`: Operational reasoning justification.
- Built-in automatic fallback model chain ensures continuous uptime.

### 4. ⚖️ Deterministic Policy Engine (Guardrails)
- Hard code-enforced guardrails evaluating every proposed action before execution:
  - **Max Retry Rule**: Rejects retries if attempt count ≥ 3.
  - **Auto Transaction Cap**: Restricts automatic operations to transactions ≤ ₹50,000.
  - **Category Whitelisting**: Allows automation only on recoverable transient decline reasons.
  - **Customer Risk Ceiling**: Halts automation if customer risk exceeds 75%.

### 5. ⏱️ Trigger.dev Durable Background Recovery Workflows
- Long-running, durable workflows that survive server restarts and cold boots.
- Executes multi-step recovery pipelines with exponential backoffs and delayed waits (e.g. 5-minute cooldown for bank issuer downtimes).

### 6. 🚀 High-Scale Autonomous Batch Recovery & Funnel Analytics
- Parallel batch processor capable of processing dozens/hundreds of unrecovered events in a single execution.
- Visual **Recovery Conversion Funnel**:
  - `Losses Ingested` ➔ `Policy Approved` ➔ `Tool Executions` ➔ `Confirmed Recovered (₹)`

### 7. 📜 Immutable Audit Trail Ledger & 1-Click Demo Reset
- Cryptographically timestamped operations ledger recording every action across `AI Agent`, `Policy Engine`, `Tool Execution`, and `Trigger.dev Workflows`.
- In-depth **JSON Payload Inspector** for judges and compliance auditors.
- **1-Click Demo Reset**: Instantly restores the baseline test dataset for clean, repeatable demo presentations.

---

## 🏗️ Tech Stack & Infrastructure

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15+ (App Router) | High-performance server components and API routes |
| **AI Reasoning** | NVIDIA Nemotron via OpenRouter | Diagnostic root-cause reasoning and JSON structured outputs |
| **Workflows** | Trigger.dev v3 | Durable, stateful background tasks and delayed retries |
| **Database** | Neon Serverless Postgres | High-concurrency relational store with branch support |
| **ORM** | Drizzle ORM | Type-safe schema definitions and relation queries |
| **Payments** | Razorpay Standard Checkout | Server-side order creation, signature verification, test mode |
| **Auth** | Clerk | Enterprise merchant session management and route protection |
| **Styling** | Tailwind CSS + Lucide Icons | Fintech control center UI design system |

---

## 🚀 Quickstart & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Vivek-736/BUILDATHON_TRACK_FOUR.git
cd recovery-ai
bun install # or npm install / pnpm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Database (Neon Serverless Postgres)
DATABASE_URL='postgresql://<user>:<password>@<host>/neondb?sslmode=require'

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# OpenRouter / NVIDIA Nemotron AI
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL_ID=meta-llama/llama-3.3-70b-instruct

# Trigger.dev v3 Workflows
TRIGGER_API_KEY=tr_dev_...
TRIGGER_PROJECT_ID=proj_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialize & Seed Database
```bash
# Push schema to Neon Postgres
bun run db:push

# Seed initial store products, policies, customers, and loss events
bun run db:seed
```

### 4. Run Development Server
```bash
bun dev
```

Open **[http://localhost:3000](http://localhost:3000)** for NovaCart Storefront or **[http://localhost:3000/dashboard](http://localhost:3000/dashboard)** for the Merchant Control Center.

---

## 🎬 3-Minute Demo Walkthrough Script

1. **Simulate a Loss in NovaCart**:
   - Go to [http://localhost:3000](http://localhost:3000). Add a product (e.g. Aura Wireless Noise-Cancelling Headphones) to the cart.
   - In Checkout, pick **"Simulate Bank Server Error"** or **"Simulate Insufficient Funds"** and complete payment.
   - The transaction fails cleanly with a raw gateway error trace.
2. **Inspect Case in Control Center**:
   - Navigate to `/dashboard`.
   - Observe **Revenue at Risk** increase live. Click **Inspect** on the new opportunity in the queue.
3. **Run AI Nemotron Diagnostic**:
   - Click **"Diagnose with AI Agent"**.
   - Watch the agent evaluate error codes, customer credit reliability (e.g. 10% risk), and recommend a bounded action (e.g. `schedule_delayed_retry` or `send_recovery_link`).
4. **Observe Deterministic Policy Gate**:
   - Notice the **Policy Engine Gate Status** (`ALLOWED ✓`).
5. **Execute Approved Recovery**:
   - Click **"Execute Approved Recovery"**.
   - Watch the controlled MCP tool capture the funds, settle the order in Razorpay, mark the case as `Recovered`, and increment the **Revenue Recovered (₹)** counter live!
6. **Scale Demo with Batch Recovery**:
   - Switch to the **Batch Recovery** tab. Click **"Run 1-Click Batch Recovery Demo"**.
   - Watch the parallel conversion funnel process all at-risk transactions and recover tens of thousands of rupees in seconds.
7. **Verify Audit Trail**:
   - Switch to the **Audit Trail** tab. Inspect the immutable log proving every AI reasoning step, policy check, and financial tool execution.

---

<div align="center">

**RecoverAI — Built with precision for the AI Revenue Recovery Buildathon.**

</div>
