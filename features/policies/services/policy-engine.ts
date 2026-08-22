import { db, policies, auditEvents, payments, customers, recoveryCases } from "@/lib/db";
import { eq } from "drizzle-orm";

export interface PolicyEvaluationResult {
  decision: "ALLOWED" | "REJECTED" | "REQUIRES_APPROVAL";
  ruleViolated?: string;
  reason: string;
  policyId: string;
  policyName: string;
  maxRetries: number;
  currentAttempts: number;
  maxAmountCap: number;
  amountAtRisk: number;
}

export async function evaluateRecoveryPolicy(
  paymentId: string,
  proposedAction: "retry_payment" | "send_recovery_link" | "schedule_delayed_retry" | "stop_recovery"
): Promise<PolicyEvaluationResult> {
  // 1. Fetch payment, customer, recoveryCase, and policy records
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!payment) {
    throw new Error(`Payment record ${paymentId} not found`);
  }

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, payment.customerId))
    .limit(1);

  const [recoveryCase] = await db
    .select()
    .from(recoveryCases)
    .where(eq(recoveryCases.paymentId, paymentId))
    .limit(1);

  const [policy] = await db
    .select()
    .from(policies)
    .where(eq(policies.merchantId, payment.merchantId))
    .limit(1);

  const defaultPolicy = {
    id: policy?.id || "policy_default",
    name: policy?.name || "Standard Autonomous Recovery Guardrail",
    maxRetries: policy?.maxRetries ?? 3,
    maxAmountPerAutoAction: parseFloat(policy?.maxAmountPerAutoAction || "50000.00"),
    requireHumanApprovalAbove: parseFloat(policy?.requireHumanApprovalAbove || "100000.00"),
    eligibleCategories: policy?.eligibleCategories ?? [
      "insufficient_funds",
      "network_timeout",
      "bank_technical_error",
      "user_dropped",
    ],
  };

  const amountNum = parseFloat(payment.amount);
  const attemptsCount = recoveryCase?.attemptsCount ?? 0;
  const customerRisk = parseFloat(customer?.riskScore || "10");
  const failureCategory = payment.failureCategory || "other";

  // If action is stop_recovery, it is always allowed safely
  if (proposedAction === "stop_recovery") {
    return {
      decision: "ALLOWED",
      reason: "Safe terminal halt recommended and permitted by policy.",
      policyId: defaultPolicy.id,
      policyName: defaultPolicy.name,
      maxRetries: defaultPolicy.maxRetries,
      currentAttempts: attemptsCount,
      maxAmountCap: defaultPolicy.maxAmountPerAutoAction,
      amountAtRisk: amountNum,
    };
  }

  // 1. Check Max Retries Rule
  if (attemptsCount >= defaultPolicy.maxRetries) {
    return {
      decision: "REJECTED",
      ruleViolated: "MAX_RETRIES_EXCEEDED",
      reason: `Maximum retry limit of ${defaultPolicy.maxRetries} attempts reached. Recovery stopped to prevent transaction spam.`,
      policyId: defaultPolicy.id,
      policyName: defaultPolicy.name,
      maxRetries: defaultPolicy.maxRetries,
      currentAttempts: attemptsCount,
      maxAmountCap: defaultPolicy.maxAmountPerAutoAction,
      amountAtRisk: amountNum,
    };
  }

  // 2. Check Transaction Amount Cap Rule
  if (amountNum > defaultPolicy.requireHumanApprovalAbove) {
    return {
      decision: "REQUIRES_APPROVAL",
      ruleViolated: "HIGH_VALUE_THRESHOLD_EXCEEDED",
      reason: `Transaction amount (₹${amountNum.toLocaleString("en-IN")}) exceeds human-approval threshold of ₹${defaultPolicy.requireHumanApprovalAbove.toLocaleString("en-IN")}.`,
      policyId: defaultPolicy.id,
      policyName: defaultPolicy.name,
      maxRetries: defaultPolicy.maxRetries,
      currentAttempts: attemptsCount,
      maxAmountCap: defaultPolicy.maxAmountPerAutoAction,
      amountAtRisk: amountNum,
    };
  }

  if (amountNum > defaultPolicy.maxAmountPerAutoAction) {
    return {
      decision: "REJECTED",
      ruleViolated: "AUTO_TRANSACTION_CAP_EXCEEDED",
      reason: `Amount (₹${amountNum.toLocaleString("en-IN")}) exceeds autonomous policy cap of ₹${defaultPolicy.maxAmountPerAutoAction.toLocaleString("en-IN")}.`,
      policyId: defaultPolicy.id,
      policyName: defaultPolicy.name,
      maxRetries: defaultPolicy.maxRetries,
      currentAttempts: attemptsCount,
      maxAmountCap: defaultPolicy.maxAmountPerAutoAction,
      amountAtRisk: amountNum,
    };
  }

  // 3. Check Eligible Category Rule
  if (!defaultPolicy.eligibleCategories.includes(failureCategory)) {
    return {
      decision: "REJECTED",
      ruleViolated: "INELIGIBLE_FAILURE_CATEGORY",
      reason: `Failure category "${failureCategory.replace(/_/g, " ")}" is ineligible for autonomous recovery per policy rules.`,
      policyId: defaultPolicy.id,
      policyName: defaultPolicy.name,
      maxRetries: defaultPolicy.maxRetries,
      currentAttempts: attemptsCount,
      maxAmountCap: defaultPolicy.maxAmountPerAutoAction,
      amountAtRisk: amountNum,
    };
  }

  // 4. Check Customer Risk Threshold
  if (customerRisk > 75) {
    return {
      decision: "REJECTED",
      ruleViolated: "CUSTOMER_RISK_THRESHOLD_EXCEEDED",
      reason: `Customer risk score (${customerRisk}%) exceeds safety threshold for automated retries.`,
      policyId: defaultPolicy.id,
      policyName: defaultPolicy.name,
      maxRetries: defaultPolicy.maxRetries,
      currentAttempts: attemptsCount,
      maxAmountCap: defaultPolicy.maxAmountPerAutoAction,
      amountAtRisk: amountNum,
    };
  }

  // All deterministic guardrails passed!
  const result: PolicyEvaluationResult = {
    decision: "ALLOWED",
    reason: `Complies with merchant policy (${defaultPolicy.name}): amount ≤ ₹${defaultPolicy.maxAmountPerAutoAction.toLocaleString("en-IN")}, attempts (${attemptsCount}/${defaultPolicy.maxRetries}), and verified category.`,
    policyId: defaultPolicy.id,
    policyName: defaultPolicy.name,
    maxRetries: defaultPolicy.maxRetries,
    currentAttempts: attemptsCount,
    maxAmountCap: defaultPolicy.maxAmountPerAutoAction,
    amountAtRisk: amountNum,
  };

  // Log Policy Audit Event
  try {
    await db.insert(auditEvents).values({
      id: `audit_policy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      merchantId: payment.merchantId,
      recoveryCaseId: recoveryCase?.id,
      actorType: "policy_engine",
      actorId: defaultPolicy.id,
      action: "POLICY_GATE_EVALUATED",
      amountImpact: payment.amount,
      details: {
        decision: result.decision,
        ruleViolated: result.ruleViolated,
        reason: result.reason,
        proposedAction,
        amount: amountNum,
        attemptsCount,
      },
    });
  } catch (auditErr) {
    console.error("Failed to log policy audit event:", auditErr);
  }

  return result;
}