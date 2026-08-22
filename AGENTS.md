# RecoverAI — Agent Instructions

## What this is

RecoverAI is an AI revenue-recovery system for merchants.

It detects revenue at risk, diagnoses the reason, determines an appropriate recovery intervention, checks that intervention against deterministic merchant policies, executes approved actions through controlled tools and durable workflows, and measures the money actually recovered.

The central product loop is:

**Detect → Diagnose → Decide → Gate → Act → Recover → Measure**

Read `scope.md` before building anything. It is the living product plan and must remain accurate as implementation progresses.

---

# How to work

Before building anything:

1. Decide what is being built.
2. Explain why that approach was chosen in a few plain sentences.
3. Identify any genuine architectural fork.
4. If there is no meaningful fork, make the decision yourself.
5. Stop after the decision and wait for approval before implementing.

Do not silently start coding after describing the plan.

Every build step must have its own short checklist in `scope.md`.

As each item is actually completed:

* Mark it `[x]`.
* Keep unfinished work `[ ]`.
* Update the relevant specification if implementation changes the original plan.

If the implementation proves the plan wrong:

1. Say so.
2. Explain what was learned.
3. Update `scope.md`.
4. Then change the implementation.

Do not quietly work around contradictions.

---

# Decision-making

Most implementation details do not require questions.

Decide reasonable defaults yourself.

Ask one question only when there is a genuine fork where two or more approaches are materially different.

When asking:

* Ask one question at a time.
* Give 2–3 concrete options.
* Explain the tradeoff briefly.
* Wait for the answer.

Do not ask a long questionnaire.

---

# Build philosophy

## Thin slice first

The first working slice should be extremely small:

```text
Payment event
    ↓
Recovery analysis
    ↓
Recommendation
    ↓
Policy decision
    ↓
Recorded result
```

Do not build the entire dashboard before proving the core recovery loop works.

After the thin slice works, thicken the system incrementally.

---

# Architecture principles

## AI reasons, code controls money

The LLM must never be the final authority for a financial action.

Correct architecture:

```text
LLM
 ↓
Recommendation
 ↓
Deterministic Policy Engine
 ↓
Approved / Rejected
 ↓
Controlled Tool
 ↓
Razorpay
```

Never:

```text
LLM
 ↓
Direct Razorpay API call
```

---

## MCP

Use MCP for controlled application capabilities where it genuinely improves the architecture.

Potential tools include:

* `get_payment`
* `get_customer`
* `get_payment_history`
* `get_order`
* `check_recovery_eligibility`
* `retry_payment`
* `send_recovery_message`
* `schedule_recovery`
* `stop_recovery`

Every tool must:

* Validate input.
* Enforce authorization.
* Respect policy constraints.
* Return structured results.
* Record important financial actions.

Do not create MCP tools merely to make the project sound agentic.

---

# Policy engine

Financial guardrails must be deterministic.

Examples:

* Maximum retry count.
* Maximum amount per automatic action.
* Eligible failure categories.
* Customer eligibility.
* Minimum delay between attempts.
* Escalation conditions.
* Hard stopping conditions.

The LLM may recommend:

```text
retry_payment
```

The policy engine decides:

```text
ALLOWED
```

or:

```text
REJECTED
```

---

# Trigger.dev

Use Trigger.dev for durable recovery workflows.

Good use cases:

* Delayed retry.
* Multi-step recovery.
* Batch recovery.
* Scheduled notifications.
* Recovery escalation.
* Retry handling.
* Long-running workflows.

Do not use Trigger.dev for simple synchronous operations that do not benefit from durability.

---

# Razorpay

Use Razorpay Test Mode during development.

Important rules:

* Order creation is server-side.
* Key Secret is never exposed to the client.
* Key ID may be exposed to the client for Checkout.
* Payment signatures are verified server-side.
* Payment webhooks are treated as authoritative server-side events where appropriate.
* Store payment/order identifiers needed for idempotency and auditability.
* Never claim real money was recovered when the system only simulated the event.

Razorpay's current Standard Checkout documentation requires a Key ID and Key Secret, recommends server-side order creation and signature verification, and recommends webhooks for server-side payment confirmation.

---

# AI

OpenRouter is the model gateway.

Primary model:

```text
OPENROUTER_MODEL_ID
```

The actual model slug must be configured through environment variables rather than hard-coded throughout the application.

Current target:

**NVIDIA Nemotron**

Do not assume a model slug from memory if OpenRouter's current catalog provides a different identifier.

The OpenRouter API is OpenAI-compatible and supports streaming chat completions.

---

# Database

Use:

* Drizzle ORM
* Neon Postgres

Core entities are expected to include:

* Merchant
* Customer
* Product
* Order
* Payment
* RecoveryCase
* RecoveryAttempt
* RecoveryWorkflow
* Policy
* AuditEvent

The exact schema should be decided before implementation of the data layer.

Do not add entities merely because they might be useful later.

---

# Authentication

Use Clerk.

Authenticated merchant users can access the RecoverAI control center.

Customer-facing NovaCart pages can remain public where appropriate.

Do not expose Clerk secrets to the browser.

Required Clerk configuration currently uses:

* `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
* `CLERK_SECRET_KEY`

according to Clerk's current Next.js documentation.


---

# Environment variables

Required:

```text
NEXT_PUBLIC_APP_URL

DATABASE_URL

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY

OPENROUTER_API_KEY
OPENROUTER_MODEL_ID

TRIGGER_SECRET_KEY
TRIGGER_PROJECT_REF

RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID
```

Optional depending on the Postgres provider:

```text
DIRECT_URL
```

Never commit secrets.

Never print secret values in logs.

---

# TypeScript

* Strict mode.
* No `any`.
* Prefer explicit domain types.
* Validate external data.
* Use discriminated unions for state where useful.
* Keep provider response types separate from internal domain types.

---

# Code style

* Functional style by default.
* Prefer immutable values.
* Use `const`.
* Avoid shared mutable state.
* Keep side effects at application boundaries.
* Prefer small pure functions.
* Keep business rules out of UI components.
* Keep provider-specific logic behind small service boundaries.

---

# Folder structure

Organize primarily by feature.

Prefer:

```text
src/
  app/
  features/
    storefront/
    payments/
    recovery/
    policies/
    workflows/
    analytics/
    audit/
  components/
    ui/
  lib/
    db/
    clerk/
    openrouter/
    razorpay/
```

Do not create giant generic folders such as:

```text
utils/
helpers/
services/
controllers/
```

containing unrelated application logic.

Shared infrastructure may live under `lib/`, but domain behavior belongs with its feature.

---

# UI

The product should feel like a premium fintech operations console.

Do not default to a generic AI dashboard.

Design direction:

* Warm coffee/dark brown foundation.
* Warm surfaces.
* Rust as the primary interactive accent.
* Green only for successful recovery/winner-style success states.
* Red only for errors.
* Strong typography.
* Clear financial hierarchy.
* Dense enough for operations work without becoming cluttered.
* Excellent keyboard navigation.
* Visible focus states.
* Real contrast.

Do not invent new colors casually.

---

# AI UX

Never show:

* Raw model exceptions.
* Provider JSON.
* Stack traces.
* Internal prompts.
* Secrets.
* Unprocessed tool failures.

Instead show:

```text
Recovery analysis couldn't be completed.

Retry analysis
```

The UI may show useful diagnostic context without exposing internal implementation details.

---

# Metrics

Financial metrics must be derived from persisted events.

Important metrics:

* Revenue at risk.
* Recoverable revenue.
* Revenue recovered.
* Recovery rate.
* Cases processed.
* Intervention success rate.
* Average recovery time.
* Recovery by failure category.
* Policy stops.

Never hard-code impressive numbers into production UI.

Seeded demo data is acceptable, but it must be clearly part of the reproducible demo dataset.

---

# Demo discipline

The final demo must prove:

1. A payment/revenue event becomes at risk.
2. AI diagnoses the problem.
3. AI recommends an intervention.
4. Policy checks the recommendation.
5. A controlled tool executes it.
6. The workflow completes.
7. Money recovered is measured.
8. A batch demonstrates scale.
9. One failure demonstrates graceful stopping.
10. The audit trail explains what happened.

The demo is not:

> "Look at our AI chatbot."

The demo is:

> **"Watch AI recover money safely, and then show me exactly how much it recovered."**

---

# Verification

After every meaningful build/change:

* Run the development server.
* Typecheck.
* Lint.
* Build.
* Manually verify the changed flow in a real browser.
* Use `curl` where a browser is unnecessary.

Do not install a test runner or browser automation framework.

Fix failures before marking the feature complete.

---

# No premature complexity

Do not add:

* Redis unless a real requirement appears.
* Pinecone unless retrieval genuinely needs it.
* Voice unless the core recovery workflow is already working.
* WhatsApp unless it improves the recovery scenario enough to justify integration work.
* Custom ML unless the recovery scoring problem actually requires it.
* Extra dashboards unless they support the judging story.

The core system comes first.

---

# Definition of done

A feature is done only when:

* Its scope is represented in `scope.md`.
* The implementation works.
* TypeScript passes.
* Lint passes.
* Production build passes.
* The real user flow has been manually verified.
* Errors are handled.
* Financial actions are auditable.
* The UI is accessible.
* `scope.md` status is updated.

---

# Context files

*Nested context files, if any are created for a specific part of the codebase, should be listed here.*
