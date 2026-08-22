import { NextResponse } from "next/server";
import { db, payments, recoveryCases, recoveryAttempts, auditEvents, orders } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const mId = "merchant_novacart_01";

    // 1. Reset baseline demo payments back to unrecovered at-risk states
    await db
      .update(payments)
      .set({
        status: "failed",
        isAtRisk: true,
        updatedAt: new Date(),
      })
      .where(eq(payments.merchantId, mId));

    // 2. Clean up recovery attempts
    await db.delete(recoveryAttempts);

    // 3. Reset recovery cases
    await db
      .update(recoveryCases)
      .set({
        status: "detected",
        recoveredAmount: "0.00",
        attemptsCount: 0,
        policyDecision: null,
        policyReason: null,
        resolvedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(recoveryCases.merchantId, mId));

    // 4. Log Demo Reset Audit Event
    await db.insert(auditEvents).values({
      id: `audit_reset_${Date.now()}`,
      merchantId: mId,
      actorType: "system",
      actorId: "demo_controller",
      action: "DEMO_SCENARIO_RESET",
      details: {
        message: "Demo dataset reset to initial competition state",
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Demo dataset successfully reset to initial test baseline!",
    });
  } catch (error) {
    console.error("Demo reset error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset demo state" },
      { status: 500 }
    );
  }
}