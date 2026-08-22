import { NextResponse } from "next/server";
import { diagnoseRecoveryCase } from "@/features/recovery/services/agent-service";
import { evaluateRecoveryPolicy } from "@/features/policies/services/policy-engine";
import { executeRecoveryIntervention } from "@/features/recovery/services/tools-service";
import { db, recoveryWorkflows } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: "paymentId is required" },
        { status: 400 }
      );
    }

    const workflowId = `wf_${paymentId}_${Date.now()}`;
    const caseId = `rcase_${paymentId}`;

    // 1. Log workflow entry
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
    } catch (err) {
      console.warn("Workflow init db warning:", err);
    }

    // Step 1: AI Diagnosis (Nemotron)
    const diagnosis = await diagnoseRecoveryCase(paymentId);

    // Step 2: Policy Gate Check
    const policyResult = await evaluateRecoveryPolicy(paymentId, diagnosis.recommendedAction);

    if (policyResult.decision !== "ALLOWED") {
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

      return NextResponse.json({
        success: false,
        workflowId,
        status: "policy_rejected",
        diagnosis,
        policyResult,
        message: `Workflow halted by policy: ${policyResult.reason}`,
      });
    }

    // Step 3: Controlled Execution
    const executionResult = await executeRecoveryIntervention(
      paymentId,
      diagnosis.recommendedAction,
      true
    );

    // Step 4: Complete workflow record
    await db
      .update(recoveryWorkflows)
      .set({
        currentState: executionResult.success ? "completed" : "failed",
        stepIndex: 3,
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

    return NextResponse.json({
      success: executionResult.success,
      workflowId,
      status: "completed",
      diagnosis,
      policyResult,
      executionResult,
    });
  } catch (error) {
    console.error("Workflow trigger error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to trigger recovery workflow" },
      { status: 500 }
    );
  }
}