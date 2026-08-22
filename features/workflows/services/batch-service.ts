import { db, payments, auditEvents } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { diagnoseRecoveryCase } from "@/features/recovery/services/agent-service";
import { evaluateRecoveryPolicy } from "@/features/policies/services/policy-engine";
import { executeRecoveryIntervention } from "@/features/recovery/services/tools-service";

export interface BatchRunResult {
  totalProcessed: number;
  eligibleCount: number;
  interventionsExecuted: number;
  successfulRecoveries: number;
  totalAmountRecovered: number;
  recoveryRatePercent: number;
  processedCases: Array<{
    paymentId: string;
    amount: number;
    failureCategory: string;
    diagnosisAction: string;
    policyDecision: string;
    isRecovered: boolean;
  }>;
}

export async function runBatchRecovery(merchantId?: string): Promise<BatchRunResult> {
  const mId = merchantId || "merchant_novacart_01";

  // 1. Fetch all at-risk or unrecovered failed payments
  const failedPayments = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      failureCategory: payments.failureCategory,
      status: payments.status,
    })
    .from(payments)
    .where(and(eq(payments.merchantId, mId), eq(payments.isAtRisk, true)));

  let eligibleCount = 0;
  let interventionsExecuted = 0;
  let successfulRecoveries = 0;
  let totalAmountRecovered = 0;

  const processedCases: BatchRunResult["processedCases"] = [];

  for (const payment of failedPayments) {
    const amt = parseFloat(payment.amount) || 0;
    try {
      // Step 1: Diagnose
      const diagnosis = await diagnoseRecoveryCase(payment.id);

      // Step 2: Policy Check
      const policyResult = await evaluateRecoveryPolicy(payment.id, diagnosis.recommendedAction);

      const isEligible = policyResult.decision === "ALLOWED";
      if (isEligible) {
        eligibleCount += 1;
      }

      let isRecovered = false;

      // Step 3: Controlled Execution if allowed
      if (isEligible) {
        interventionsExecuted += 1;
        const execResult = await executeRecoveryIntervention(
          payment.id,
          diagnosis.recommendedAction,
          true
        );

        if (execResult.success && execResult.caseStatus === "recovered") {
          successfulRecoveries += 1;
          totalAmountRecovered += amt;
          isRecovered = true;
        }
      }

      processedCases.push({
        paymentId: payment.id,
        amount: amt,
        failureCategory: payment.failureCategory || "other",
        diagnosisAction: diagnosis.recommendedAction,
        policyDecision: policyResult.decision,
        isRecovered,
      });
    } catch (err) {
      console.error(`Batch processing error on payment ${payment.id}:`, err);
    }
  }

  const recoveryRatePercent =
    failedPayments.length > 0
      ? Math.round((successfulRecoveries / failedPayments.length) * 1000) / 10
      : 0;

  // Log Batch Audit Event
  try {
    await db.insert(auditEvents).values({
      id: `audit_batch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      merchantId: mId,
      actorType: "workflow",
      actorId: "batch_recovery_processor",
      action: "BATCH_RECOVERY_COMPLETED",
      amountImpact: totalAmountRecovered.toFixed(2),
      details: {
        totalProcessed: failedPayments.length,
        eligibleCount,
        interventionsExecuted,
        successfulRecoveries,
        totalAmountRecovered,
        recoveryRatePercent,
      },
    });
  } catch (auditErr) {
    console.error("Failed to log batch audit event:", auditErr);
  }

  return {
    totalProcessed: failedPayments.length,
    eligibleCount,
    interventionsExecuted,
    successfulRecoveries,
    totalAmountRecovered: Math.round(totalAmountRecovered),
    recoveryRatePercent,
    processedCases,
  };
}