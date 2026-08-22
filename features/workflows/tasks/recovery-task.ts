import { task, wait } from "@trigger.dev/sdk/v3";
import { diagnoseRecoveryCase } from "@/features/recovery/services/agent-service";
import { evaluateRecoveryPolicy } from "@/features/policies/services/policy-engine";
import { executeRecoveryIntervention } from "@/features/recovery/services/tools-service";
import { db, recoveryWorkflows } from "@/lib/db";
import { eq } from "drizzle-orm";

export const recoverPaymentWorkflowTask = task({
  id: "recover-payment-workflow",
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: { paymentId: string }) => {
    const { paymentId } = payload;
    const workflowId = `wf_${paymentId}_${Date.now()}`;
    const caseId = `rcase_${paymentId}`;

    console.log(`[Trigger.dev] Starting durable recovery workflow for payment ${paymentId}`);

    // 1. Initialize workflow state machine
    try {
      await db.insert(recoveryWorkflows).values({
        id: workflowId,
        recoveryCaseId: caseId,
        triggerRunId: workflowId,
        workflowType: "standard_recovery",
        currentState: "diagnosing",
        stepIndex: 1,
        isFinished: false,
        payload: { step: "diagnosing", paymentId, startedAt: new Date().toISOString() },
      });
    } catch (dbErr) {
      console.warn("Workflow init record warning:", dbErr);
    }

    // Step 1: AI Reasoning Diagnosis
    console.log(`[Trigger.dev] Executing Step 1: AI Diagnosis (Nemotron) for ${paymentId}`);
    const diagnosis = await diagnoseRecoveryCase(paymentId);

    // Step 2: Deterministic Policy Gate Check
    console.log(`[Trigger.dev] Executing Step 2: Deterministic Policy Engine Gate Check`);
    const policyResult = await evaluateRecoveryPolicy(paymentId, diagnosis.recommendedAction);

    // Step 3: Check if policy rejected
    if (policyResult.decision !== "ALLOWED") {
      console.log(`[Trigger.dev] Policy gate REJECTED action for ${paymentId}: ${policyResult.reason}`);
      await db
        .update(recoveryWorkflows)
        .set({
          currentState: "policy_rejected",
          stepIndex: 2,
          isFinished: true,
          payload: { step: "policy_rejected", reason: policyResult.reason },
          updatedAt: new Date(),
        })
        .where(eq(recoveryWorkflows.id, workflowId));

      return {
        success: false,
        status: "policy_rejected",
        reason: policyResult.reason,
      };
    }

    // Step 4: Durable Delay if recommended (e.g. 5-300s backoff)
    if (diagnosis.delaySeconds > 0) {
      console.log(`[Trigger.dev] Executing Step 3: Durable wait for ${diagnosis.delaySeconds} seconds`);
      await db
        .update(recoveryWorkflows)
        .set({
          currentState: "waiting_delay",
          stepIndex: 3,
          payload: { step: "waiting_delay", delaySeconds: diagnosis.delaySeconds },
          updatedAt: new Date(),
        })
        .where(eq(recoveryWorkflows.id, workflowId));

      await wait.for({ seconds: Math.min(diagnosis.delaySeconds, 30) }); // capped to 30s in test mode
    }

    // Step 5: Controlled Tool Execution
    console.log(`[Trigger.dev] Executing Step 4: Controlled Tool Execution (${diagnosis.recommendedAction})`);
    const executionResult = await executeRecoveryIntervention(
      paymentId,
      diagnosis.recommendedAction,
      true
    );

    // Step 6: Finalize Workflow State
    await db
      .update(recoveryWorkflows)
      .set({
        currentState: executionResult.success ? "completed" : "failed",
        stepIndex: 4,
        isFinished: true,
        payload: {
          step: "finished",
          actionExecuted: diagnosis.recommendedAction,
          recoveredAmount: executionResult.recoveredAmount,
          completedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(recoveryWorkflows.id, workflowId));

    console.log(`[Trigger.dev] Recovery workflow successfully completed for ${paymentId}`);

    return {
      success: executionResult.success,
      workflowId,
      diagnosis,
      policyResult,
      executionResult,
    };
  },
});