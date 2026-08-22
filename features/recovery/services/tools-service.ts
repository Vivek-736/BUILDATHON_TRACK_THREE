import {
  db,
  payments,
  orders,
  customers,
  recoveryCases,
  recoveryAttempts,
  auditEvents,
} from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  evaluateRecoveryPolicy,
  PolicyEvaluationResult,
} from "@/features/policies/services/policy-engine";

export interface ExecutionResult {
  success: boolean;
  actionExecuted: string;
  policyResult: PolicyEvaluationResult;
  caseStatus: string;
  recoveredAmount?: number;
  message: string;
  recoveryAttemptId?: string;
}

export async function executeRecoveryIntervention(
  paymentId: string,
  proposedAction:
    | "retry_payment"
    | "send_recovery_link"
    | "schedule_delayed_retry"
    | "stop_recovery",
  simulateSuccess = true,
): Promise<ExecutionResult> {
  // 1. Fetch payment and order
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!payment) {
    throw new Error(`Payment ${paymentId} not found`);
  }

  // 2. Deterministic Policy Gate Check (Code controls money!)
  const policyResult = await evaluateRecoveryPolicy(paymentId, proposedAction);

  const caseId = `rcase_${payment.id}`;
  const amountNum = parseFloat(payment.amount);

  // Ensure recovery case exists in DB
  await db
    .insert(recoveryCases)
    .values({
      id: caseId,
      merchantId: payment.merchantId,
      paymentId: payment.id,
      orderId: payment.orderId,
      customerId: payment.customerId,
      amountAtRisk: payment.amount,
      failureCategory: payment.failureCategory || "other",
      status:
        policyResult.decision === "ALLOWED"
          ? "policy_approved"
          : "policy_rejected",
      policyDecision: policyResult.decision,
      policyReason: policyResult.reason,
    })
    .onConflictDoUpdate({
      target: recoveryCases.id,
      set: {
        policyDecision: policyResult.decision,
        policyReason: policyResult.reason,
        status:
          policyResult.decision === "ALLOWED"
            ? "policy_approved"
            : "policy_rejected",
        updatedAt: new Date(),
      },
    });

  // If Policy Rejects the action, HALT IMMEDIATELY
  if (policyResult.decision !== "ALLOWED") {
    await db
      .update(recoveryCases)
      .set({
        status: "policy_rejected",
        updatedAt: new Date(),
      })
      .where(eq(recoveryCases.id, caseId));

    return {
      success: false,
      actionExecuted: proposedAction,
      policyResult,
      caseStatus: "policy_rejected",
      message: `Action halted by policy engine: ${policyResult.reason}`,
    };
  }

  // 3. Execute the Approved Controlled Tool
  const attemptId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const currentAttempts = (policyResult.currentAttempts || 0) + 1;

  if (
    proposedAction === "retry_payment" ||
    proposedAction === "schedule_delayed_retry"
  ) {
    if (simulateSuccess) {
      // 1. Settle Payment
      await db
        .update(payments)
        .set({
          status: "captured",
          isAtRisk: false,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentId));

      // 2. Mark Order Completed
      await db
        .update(orders)
        .set({
          status: "completed",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, payment.orderId));

      // 3. Mark Recovery Case as Recovered
      await db
        .update(recoveryCases)
        .set({
          status: "recovered",
          recoveredAmount: payment.amount,
          attemptsCount: currentAttempts,
          resolvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(recoveryCases.id, caseId));

      // 4. Record Recovery Attempt
      await db.insert(recoveryAttempts).values({
        id: attemptId,
        recoveryCaseId: caseId,
        attemptNumber: currentAttempts,
        actionType: "retry_payment",
        status: "succeeded",
        resultDetails: {
          capturedAmount: amountNum,
          currency: payment.currency,
          gateway: "Razorpay Standard Checkout",
        },
      });

      // 5. Update Customer stats
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, payment.customerId))
        .limit(1);

      if (customer) {
        const prevRecovered = parseFloat(customer.recoveredAmount || "0");
        await db
          .update(customers)
          .set({
            recoveredAmount: (prevRecovered + amountNum).toFixed(2),
            updatedAt: new Date(),
          })
          .where(eq(customers.id, customer.id));
      }

      // 6. Log Financial Action Execution in Audit Trail
      await db.insert(auditEvents).values({
        id: `audit_exec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        merchantId: payment.merchantId,
        recoveryCaseId: caseId,
        actorType: "policy_engine",
        actorId: "controlled_tool_retry_payment",
        action: "REVENUE_RECOVERED_CAPTURED",
        amountImpact: payment.amount,
        details: {
          attemptNumber: currentAttempts,
          recoveredAmount: amountNum,
          policyApproval: policyResult.decision,
          settledAt: new Date().toISOString(),
        },
      });

      return {
        success: true,
        actionExecuted: "retry_payment",
        policyResult,
        caseStatus: "recovered",
        recoveredAmount: amountNum,
        recoveryAttemptId: attemptId,
        message: `Payment authorized and ₹${amountNum.toLocaleString("en-IN")} successfully captured!`,
      };
    }
  } else if (proposedAction === "send_recovery_link") {
    // Generate recovery link
    const recoveryUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/store/order-status/${payment.orderId}?retry=true`;

    await db.insert(recoveryAttempts).values({
      id: attemptId,
      recoveryCaseId: caseId,
      attemptNumber: currentAttempts,
      actionType: "send_recovery_link",
      status: "initiated",
      resultDetails: {
        recoveryUrl,
        sentVia: "SMS / Instant Notification",
      },
    });

    await db
      .update(recoveryCases)
      .set({
        status: "executing",
        attemptsCount: currentAttempts,
        updatedAt: new Date(),
      })
      .where(eq(recoveryCases.id, caseId));

    await db.insert(auditEvents).values({
      id: `audit_exec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      merchantId: payment.merchantId,
      recoveryCaseId: caseId,
      actorType: "controlled_tool",
      actorId: "tool_send_recovery_link",
      action: "RECOVERY_LINK_DISPATCHED",
      amountImpact: payment.amount,
      details: {
        recoveryUrl,
        attemptNumber: currentAttempts,
      },
    });

    return {
      success: true,
      actionExecuted: "send_recovery_link",
      policyResult,
      caseStatus: "executing",
      recoveryAttemptId: attemptId,
      message: `Recovery checkout link generated and dispatched to customer!`,
    };
  } else if (proposedAction === "stop_recovery") {
    await db
      .update(recoveryCases)
      .set({
        status: "stopped",
        updatedAt: new Date(),
      })
      .where(eq(recoveryCases.id, caseId));

    await db.insert(auditEvents).values({
      id: `audit_exec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      merchantId: payment.merchantId,
      recoveryCaseId: caseId,
      actorType: "controlled_tool",
      actorId: "tool_stop_recovery",
      action: "RECOVERY_HALTED",
      amountImpact: payment.amount,
      details: {
        reason: "Terminal failure condition",
      },
    });

    return {
      success: true,
      actionExecuted: "stop_recovery",
      policyResult,
      caseStatus: "stopped",
      message: "Recovery process gracefully stopped per policy.",
    };
  }

  return {
    success: false,
    actionExecuted: proposedAction,
    policyResult,
    caseStatus: "failed",
    message: "Action not recognized",
  };
}