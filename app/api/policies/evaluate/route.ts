import { NextResponse } from "next/server";
import { evaluateRecoveryPolicy } from "@/features/policies/services/policy-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId, proposedAction } = body;

    if (!paymentId || !proposedAction) {
      return NextResponse.json(
        { success: false, error: "paymentId and proposedAction are required" },
        { status: 400 }
      );
    }

    const evaluation = await evaluateRecoveryPolicy(paymentId, proposedAction);

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error("Policy evaluation error:", error);
    
    return NextResponse.json(
      { success: false, error: "Failed to evaluate deterministic merchant policy" },
      { status: 500 }
    );
  }
}