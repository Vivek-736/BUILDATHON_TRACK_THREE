# RecoverAI

> **AI Revenue Recovery**
>
> Detect revenue at risk. Determine the right intervention. Recover the money. Prove it.

## Product Principle

RecoverAI is a merchant revenue-recovery control center.

It watches payment and checkout events, identifies revenue at risk, diagnoses why the revenue is slipping away, recommends a bounded recovery action, executes that action through controlled tools and durable workflows, and measures the actual money recovered.

The core loop is:

**Detect → Diagnose → Decide → Gate → Act → Recover → Measure**

The product is not an AI chatbot. The AI is responsible for reasoning and choosing an intervention; deterministic policy rules control what it is allowed to do.

---

# At a glance

| #  | Feature                      | Phase      | Status |
| -- | ---------------------------- | ---------- | ------ |
| 1  | Project foundation           | Foundation | done   |
| 2  | Product/storefront data      | Phase 1    | done   |
| 3  | Razorpay payment flow        | Phase 1    | done   |
| 4  | Revenue-at-risk intelligence | Phase 2    | done   |
| 5  | AI recovery agent            | Phase 3    | done   |
| 6  | MCP recovery tools           | Phase 4    | done   |
| 7  | Recovery policy engine       | Phase 4    | done   |
| 8  | Trigger.dev workflows        | Phase 5    | done   |
| 9  | Batch recovery               | Phase 6    | done   |
| 10 | Analytics & metrics          | Phase 6    | done   |
| 11 | Audit trail                  | Phase 7    | done   |
| 12 | Demo polish                  | Phase 7    | done   |

---

# Foundation

## Stack

Already decided:

* Next.js App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* Drizzle ORM
* Neon Postgres
* Clerk
* OpenRouter
* NVIDIA Nemotron model
* Trigger.dev
* Razorpay Test Mode

## Engineering principles

* Strict TypeScript.
* No `any`.
* Feature-based folder structure.
* Functional style by default.
* Immutable data where practical.
* Server-side secrets only.
* Validate external input at boundaries.
* Never expose raw provider/API exceptions.
* AI recommendations never bypass deterministic policy checks.
* Every money-changing action is auditable.
* Every recovery workflow has explicit stopping conditions.
* Demo data must be reproducible.
* Metrics shown in the UI must come from actual recorded events, not hard-coded claims.

---

# Screens

## 1. NovaCart Storefront

A small fictional merchant storefront containing approximately 8–10 products.

Purpose:

* Make the demo feel like a real merchant.
* Give payments meaningful product context.
* Create realistic checkout events.

The storefront is not the main product.

---

## 2. Checkout / Payment

Customer selects a product and reaches checkout.

The checkout should support Razorpay Test Mode.

Purpose:

* Demonstrate a genuine payment flow.
* Generate successful and failed payment scenarios.
* Connect the customer-facing experience to the merchant recovery system.

Razorpay order creation happens server-side. The browser receives the order and uses the public Key ID for Checkout. The Key Secret never reaches the browser. Payment signatures are verified server-side.

---

## 3. Recovery Dashboard

The primary merchant screen.

Show:

* Revenue at risk
* Recoverable revenue
* Revenue recovered
* Recovery rate
* Recovery opportunities
* Recovery funnel
* Recent successful recoveries

Example:

```text
Revenue at Risk       ₹12.48L
Recoverable           ₹7.82L
Recovered             ₹5.94L
Recovery Rate         76.0%
```

The most important number is:

**Money actually recovered.**

---

## 4. Recovery Opportunities

A merchant-facing queue of cases.

Each case contains:

* Customer
* Product
* Amount
* Failure type
* Recovery probability
* Recommended intervention
* Current status

Example cases:

### Transient payment failure

Action: Retry

### Checkout abandonment

Action: Recovery reminder

### Insufficient funds

Action: Delayed retry / notification

### Repeated failure

Action: Stop and escalate

---

## 5. Recovery Case

The most important AI screen.

Example:

```text
Arjun Sharma
AirPulse Buds
₹3,499

Payment failed
Bank timeout

Customer history
4 successful payments

AI recommendation
Retry once after 15 minutes

Recovery probability
87%

Expected recovery
₹3,499
```

Below the recommendation:

### Why this action?

The AI explains its decision using available transaction, customer and policy context.

Then:

### Policy Gate

```text
✓ Retry permitted
✓ Amount within threshold
✓ Customer eligible
✓ Retry count: 0 / 2

ACTION APPROVED
```

The merchant can then execute the bounded recovery action.

---

# 6. Recovery Workflows

Shows Trigger.dev-driven execution.

Example:

```text
Payment Failed
      ↓
AI Diagnosis
      ↓
Policy Check
      ↓
Wait 15 minutes
      ↓
Retry
      ↓
Payment Result
      ↓
Recovered
```

Also demonstrate graceful failure:

```text
Retry 1 ❌
      ↓
Retry 2 ❌
      ↓
STOP
      ↓
Manual escalation
```

The system must demonstrate that the agent knows when **not** to continue.

---

# 7. Audit & Analytics

Two related views can live under one screen.

## Analytics

Show:

* Total cases processed
* Revenue at risk
* Recoverable revenue
* Revenue recovered
* Recovery rate
* Intervention success rate
* Average recovery time
* Recovery by failure category

## Audit Trail

For every recovery case:

```text
Payment failed
↓
Failure classified
↓
Customer history retrieved
↓
AI recommendation generated
↓
Policy evaluated
↓
Action approved
↓
Recovery attempted
↓
Payment result
↓
Revenue recovered
```

Every financial action must have an audit record.

---

# Phase 0 — Foundation

### Goal

Create the application skeleton and establish infrastructure.

### Build checklist

* [x] Create Next.js application
* [x] Configure TypeScript and Tailwind
* [x] Install shadcn/ui
* [x] Configure typography and design tokens
* [x] Configure Drizzle / Neon Postgres
* [x] Configure Clerk
* [x] Configure OpenRouter
* [x] Configure Trigger.dev
* [x] Configure Razorpay Test Mode
* [x] Create environment validation
* [x] Establish feature-based folder structure

### Showcase

Nothing yet.

This phase exists so every later phase has a stable foundation.

---

# Phase 1 — NovaCart + Payment Flow

### Goal

Create the merchant world and generate believable payment events.

### Build checklist

* [x] Product catalog
* [x] Product detail
* [x] Cart
* [x] Checkout
* [x] Customer records
* [x] Razorpay Test Mode order creation
* [x] Payment verification
* [x] Payment webhook handling
* [x] Payment status persistence
* [x] Seed realistic historical data

### Showcase

Customer buys:

**AirPulse Buds — ₹3,499**

Payment succeeds or fails.

That event becomes visible to the merchant.

---

# Phase 2 — Revenue Intelligence

### Goal

Turn raw payment events into revenue opportunities.

### Build checklist

* [x] Failure classification
* [x] Abandoned checkout detection
* [x] Revenue-at-risk calculation
* [x] Recoverability scoring
* [x] Recovery probability
* [x] Recovery opportunity queue
* [x] Dashboard KPIs

### Showcase

```text
1,284 revenue-loss events
        ↓
947 recoverable
        ↓
₹7.82L recoverable revenue
```

The merchant now knows where money is slipping away.

---

# Phase 3 — AI Recovery Agent

### Goal

Give the system reasoning capability.

The Nemotron model receives structured context rather than unrestricted access to the application.

Context may include:

* Payment details
* Failure reason
* Customer history
* Previous recovery attempts
* Product/order information
* Merchant recovery policy

The agent determines:

1. Why the payment/revenue was lost.
2. Whether recovery is appropriate.
3. Which intervention should be attempted.
4. Why that intervention makes sense.
5. Expected recovery probability.

### Build checklist

* [x] Recovery agent
* [x] Structured agent state
* [x] Failure diagnosis
* [x] Intervention selection
* [x] Recovery probability
* [x] Human-readable explanation
* [x] Error handling

### Showcase

```text
Payment failed
      ↓
AI investigates
      ↓
Transient bank timeout
      ↓
Repeat customer
      ↓
Retry recommended
      ↓
87% recovery probability
```

---

# Phase 4 — MCP + Policy Engine

### Goal

Separate AI reasoning from financial execution.

The AI does not directly call Razorpay.

The agent uses controlled tools.

Potential tools:

* `get_payment`
* `get_customer`
* `get_payment_history`
* `get_order`
* `check_recovery_eligibility`
* `retry_payment`
* `send_recovery_message`
* `schedule_recovery`
* `stop_recovery`

## Policy Engine

The policy engine deterministically checks:

* Maximum retries
* Amount thresholds
* Eligibility
* Previous attempts
* Recovery category
* Escalation rules
* Stopping rules

Architecture:

```text
AI Recommendation
        ↓
Policy Engine
        ↓
Approved / Rejected
        ↓
MCP Tool
        ↓
External Action
```

### Build checklist

* [x] MCP tool definitions
* [x] Tool validation
* [x] Policy rules
* [x] Authorization gate
* [x] Stopping rules
* [x] Audit events

### Showcase

The AI recommends an action.

The policy engine approves it.

The controlled tool executes it.

The entire operation is recorded.

---

# Phase 5 — Trigger.dev Recovery Workflows

### Goal

Turn individual actions into durable recovery workflows.

Example:

```text
Payment failure
      ↓
Diagnose
      ↓
Policy check
      ↓
Wait
      ↓
Retry
      ↓
Check result
      ↓
Success → Stop
Failure → Next allowed step
```

### Build checklist

* [x] Recovery task
* [x] Delayed execution
* [x] Retry sequence
* [x] Recovery notification
* [x] Result handling
* [x] Automatic stopping
* [x] Workflow status UI

### Showcase

A recovery case moves through the workflow live.

Then demonstrate one that stops after hitting the policy limit.

---

# Phase 6 — Batch Recovery + Measurement

### Goal

Prove RecoverAI works across a batch, not only one hand-picked transaction.

Target demo dataset:

* 1,000+ payment/recovery events
* Multiple failure categories
* Multiple customers
* Multiple products
* Successful and unsuccessful recoveries

Metrics:

* Cases processed
* Cases eligible
* Interventions executed
* Successful recoveries
* Revenue recovered
* Recovery rate
* Average recovery time

### Build checklist

* [x] Batch processor
* [x] Trigger.dev batch workflow
* [x] Aggregate metrics
* [x] Recovery funnel
* [x] Failure category analytics
* [x] Reproducible demo dataset

### Showcase

```text
1,284 cases
      ↓
947 recoverable
      ↓
731 interventions
      ↓
593 successful recoveries
      ↓
₹5.94L recovered
```

This is the main proof point of the project.

---

# Phase 7 — Audit + Demo Polish

### Goal

Make the system trustworthy and competition-ready.

### Build checklist

* [x] Complete audit timeline
* [x] AI decision explanation
* [x] Tool execution logs
* [x] Policy decisions
* [x] Loading states
* [x] Error states
* [x] Empty states
* [x] Demo reset
* [x] Seeded demo scenario
* [x] Responsive UI
* [x] Final visual polish
* [x] Architecture diagram
* [x] Final demo flow

### Showcase

The final story:

```text
Revenue at Risk
       ↓
AI Diagnosis
       ↓
Recovery Decision
       ↓
Policy Gate
       ↓
Controlled Execution
       ↓
Successful Recovery
       ↓
Measured ₹ Recovered
       ↓
Audit Trail
```

---

# Final Demo Scenario

The primary demo should be one carefully prepared story.

### 1. Show NovaCart

Customer buys **AirPulse Buds — ₹3,499**.

### 2. Payment fails

Simulate a transient bank failure.

### 3. Switch to RecoverAI

Dashboard shows the new revenue-at-risk case.

### 4. Open the case

AI explains:

> Transient failure + high-value repeat customer → retry recommended.

### 5. Policy gate

```text
Retry allowed ✓
Amount allowed ✓
Attempts 0/2 ✓
```

### 6. Execute

Trigger.dev runs the recovery workflow.

### 7. Payment succeeds

```text
₹3,499 RECOVERED
```

### 8. Run batch recovery

Show hundreds/thousands of synthetic cases processed.

### 9. Show the money

```text
₹5.94L recovered
```

### 10. Show the failure

A second case hits its retry limit.

```text
Retry 1 ❌
Retry 2 ❌
STOP 🛑
```

### 11. End on the audit trail

The judge sees exactly **why the AI acted, what allowed it to act, what executed, and what happened to the money.**

---

# What we deliberately aren't building

To keep this hackathon-sized:

* No giant merchant admin suite
* No complex CRM
* No full accounting system
* No real production fraud engine
* No WhatsApp/voice initially
* No unnecessary vector database
* No giant RAG pipeline
* No custom ML model unless the recovery scoring actually needs one
* No 20-screen dashboard

**The product is the recovery loop. Everything else exists to support that loop.**
