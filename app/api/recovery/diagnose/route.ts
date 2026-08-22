import { NextResponse } from "next/server";
import { diagnoseRecoveryCase } from "@/features/recovery/services/agent-service";

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

    const diagnosis = await diagnoseRecoveryCase(paymentId);

    return NextResponse.json({
      success: true,
      paymentId,
      diagnosis,
    });
  } catch (error) {
    console.error("AI Diagnosis execution error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Recovery analysis couldn't be completed. Please retry.",
      },
      { status: 500 }
    );
  }
}