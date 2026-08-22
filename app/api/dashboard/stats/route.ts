import { NextResponse } from "next/server";
import { getDashboardStats, getFailureCategoryDistribution } from "@/features/analytics/services/intelligence-service";
import { getCurrentMerchant } from "@/lib/clerk";

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();
    const merchantId = merchant?.id || "merchant_novacart_01";

    const stats = await getDashboardStats(merchantId);
    const categoryStats = await getFailureCategoryDistribution(merchantId);

    return NextResponse.json({
      success: true,
      stats,
      categoryStats,
      merchant: {
        id: merchantId,
        name: merchant?.name || "NovaCart India",
        email: merchant?.email || "support@novacart.in",
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate revenue intelligence statistics" },
      { status: 500 }
    );
  }
}