import { NextResponse } from "next/server";
import { getOpportunityQueue } from "@/features/analytics/services/intelligence-service";
import { getCurrentMerchant } from "@/lib/clerk";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const merchant = await getCurrentMerchant();
    const merchantId = merchant?.id || "merchant_novacart_01";

    const cases = await getOpportunityQueue(merchantId, category);

    return NextResponse.json({
      success: true,
      cases,
      totalCount: cases.length,
    });
  } catch (error) {
    console.error("Dashboard cases error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve opportunity queue" },
      { status: 500 }
    );
  }
}