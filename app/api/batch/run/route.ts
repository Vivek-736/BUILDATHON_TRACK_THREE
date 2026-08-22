import { NextResponse } from "next/server";
import { runBatchRecovery } from "@/features/workflows/services/batch-service";
import { getCurrentMerchant } from "@/lib/clerk";

export async function POST() {
  try {
    const merchant = await getCurrentMerchant();
    const merchantId = merchant?.id || "merchant_novacart_01";

    const result = await runBatchRecovery(merchantId);

    return NextResponse.json({
      success: true,
      batchResult: result,
    });
  } catch (error) {
    console.error("Batch run error:", error);
    
    return NextResponse.json(
      { success: false, error: "Failed to run batch recovery" },
      { status: 500 }
    );
  }
}