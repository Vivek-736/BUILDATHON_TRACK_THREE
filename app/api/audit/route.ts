import { NextResponse } from "next/server";
import { getAuditRecords } from "@/features/audit/services/audit-service";
import { getCurrentMerchant } from "@/lib/clerk";

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();
    const merchantId = merchant?.id || "merchant_novacart_01";

    const records = await getAuditRecords(merchantId);

    return NextResponse.json({
      success: true,
      records,
      count: records.length,
    });
  } catch (error) {
    console.error("Audit query error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve audit trail" },
      { status: 500 }
    );
  }
}