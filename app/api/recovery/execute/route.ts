import { NextResponse } from "next/server";
import { executeRecoveryIntervention } from "@/features/recovery/services/tools-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId, proposedAction, simulateSuccess = true } = body;

    if (!paymentId || !proposedAction) {
      return NextResponse.json(
        { success: false, error: "paymentId and proposedAction are required" },
        { status: 400 }
      );
    }

    const executionResult = await executeRecoveryIntervention(
      paymentId,
      proposedAction,
      simulateSuccess
    );

    return NextResponse.json({
      success: executionResult.success,
      result: executionResult,
    });
  } catch (error) {
    console.error("Recovery execution error:", error);
    
    return NextResponse.json(
      { success: false, error: "Failed to execute recovery action" },
      { status: 500 }
    );
  }
}