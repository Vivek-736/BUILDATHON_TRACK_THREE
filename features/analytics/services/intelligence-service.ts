import { db, payments, orders, customers } from "@/lib/db";
import { eq, desc, sql } from "drizzle-orm";

export interface OpportunityItem {
  id: string; // paymentId
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerRiskScore: number;
  amountAtRisk: number;
  currency: string;
  failureCategory: string;
  errorCode?: string;
  errorDescription?: string;
  recoveryProbability: number; // 0 to 100
  probabilityTier: "high" | "medium" | "low";
  isRecoverable: boolean;
  status: string;
  itemsSummary: string;
  createdAt: Date;
}

export interface DashboardStats {
  revenueAtRisk: number;
  recoverableRevenue: number;
  revenueRecovered: number;
  recoveryRatePercent: number;
  totalLossCases: number;
  recoverableCases: number;
  recoveredCases: number;
  activeOpportunitiesCount: number;
}

export interface CategoryStat {
  category: string;
  label: string;
  count: number;
  amount: number;
  percentage: number;
  averageProbability: number;
}

/**
 * Deterministic recoverability probability algorithm
 */
export function calculateRecoveryProbability(
  failureCategory?: string | null,
  customerRiskScore = 10,
  amount = 0,
  attemptsCount = 0
): { probability: number; tier: "high" | "medium" | "low"; isRecoverable: boolean } {
  // Base probability by failure category transient nature
  let baseScore = 60;
  switch (failureCategory) {
    case "bank_technical_error":
      baseScore = 92;
      break;
    case "network_timeout":
      baseScore = 88;
      break;
    case "insufficient_funds":
      baseScore = 78;
      break;
    case "user_dropped":
      baseScore = 68;
      break;
    case "authentication_failed":
      baseScore = 52;
      break;
    case "card_expired":
      baseScore = 18;
      break;
    case "risk_rejected":
      baseScore = 6;
      break;
    default:
      baseScore = 45;
  }

  // Customer risk adjustment (lower risk score = higher reliability)
  // Risk score 0 -> +8%, Risk score 50+ -> -15%
  const riskAdjustment = Math.max(-20, Math.min(10, (20 - customerRiskScore) * 0.5));

  // High amount adjustment (higher amounts require extra diligence)
  const amountAdjustment = amount > 50000 ? -8 : amount < 5000 ? 5 : 0;

  // Retry attempt decay (each past attempt lowers likelihood)
  const attemptDecay = attemptsCount * 12;

  const finalScore = Math.max(
    5,
    Math.min(98, Math.round(baseScore + riskAdjustment + amountAdjustment - attemptDecay))
  );

  const tier: "high" | "medium" | "low" =
    finalScore >= 75 ? "high" : finalScore >= 45 ? "medium" : "low";

  const isRecoverable = finalScore >= 35 && attemptsCount < 3;

  return { probability: finalScore, tier, isRecoverable };
}

export async function getDashboardStats(merchantId?: string): Promise<DashboardStats> {
  const mId = merchantId || "merchant_novacart_01";

  // 1. Fetch all payments for merchant
  const allPayments = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      status: payments.status,
      isAtRisk: payments.isAtRisk,
      failureCategory: payments.failureCategory,
      customerId: payments.customerId,
      customerRiskScore: customers.riskScore,
    })
    .from(payments)
    .leftJoin(customers, eq(payments.customerId, customers.id))
    .where(eq(payments.merchantId, mId));

  let revenueAtRisk = 0;
  let recoverableRevenue = 0;
  let revenueRecovered = 0;
  let totalLossCases = 0;
  let recoverableCases = 0;
  let recoveredCases = 0;

  for (const p of allPayments) {
    const amt = parseFloat(p.amount) || 0;
    const cRisk = parseFloat(p.customerRiskScore || "10");

    if (p.status === "captured") {
      revenueRecovered += amt;
      recoveredCases += 1;
    } else if (p.status === "failed" || p.isAtRisk) {
      revenueAtRisk += amt;
      totalLossCases += 1;

      const { probability, isRecoverable } = calculateRecoveryProbability(
        p.failureCategory,
        cRisk,
        amt
      );

      if (isRecoverable) {
        recoverableCases += 1;
        // Expected recoverable value weighted by probability
        recoverableRevenue += amt * (probability / 100);
      }
    }
  }

  const totalEvaluated = revenueAtRisk + revenueRecovered;
  const recoveryRatePercent =
    totalEvaluated > 0
      ? Math.round((revenueRecovered / totalEvaluated) * 1000) / 10
      : 0;

  return {
    revenueAtRisk: Math.round(revenueAtRisk),
    recoverableRevenue: Math.round(recoverableRevenue),
    revenueRecovered: Math.round(revenueRecovered),
    recoveryRatePercent,
    totalLossCases,
    recoverableCases,
    recoveredCases,
    activeOpportunitiesCount: totalLossCases,
  };
}

export async function getOpportunityQueue(
  merchantId?: string,
  categoryFilter?: string
): Promise<OpportunityItem[]> {
  const mId = merchantId || "merchant_novacart_01";

  // Fetch failed payments with customer and order info
  const records = await db
    .select({
      paymentId: payments.id,
      orderId: payments.orderId,
      customerId: payments.customerId,
      customerName: customers.name,
      customerEmail: customers.email,
      customerPhone: customers.phone,
      customerRiskScore: customers.riskScore,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      failureCategory: payments.failureCategory,
      errorCode: payments.errorCode,
      errorDescription: payments.errorDescription,
      orderMetadata: orders.metadata,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .innerJoin(customers, eq(payments.customerId, customers.id))
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .where(eq(payments.merchantId, mId))
    .orderBy(desc(payments.createdAt));

  const items: OpportunityItem[] = [];

  for (const r of records) {
    if (categoryFilter && categoryFilter !== "all" && r.failureCategory !== categoryFilter) {
      continue;
    }

    const amt = parseFloat(r.amount) || 0;
    const cRisk = parseFloat(r.customerRiskScore || "10");
    const { probability, tier, isRecoverable } = calculateRecoveryProbability(
      r.failureCategory,
      cRisk,
      amt
    );

    // Extract item names from metadata if available
    let itemsSummary = "Store Order";
    const meta = r.orderMetadata as { items?: Array<{ title?: string; quantity?: number }> } | null;
    if (meta?.items && meta.items.length > 0) {
      itemsSummary = meta.items.map((i) => i.title || "Product").join(", ");
    }

    items.push({
      id: r.paymentId,
      orderId: r.orderId,
      customerId: r.customerId,
      customerName: r.customerName || "Customer",
      customerEmail: r.customerEmail,
      customerPhone: r.customerPhone || undefined,
      customerRiskScore: cRisk,
      amountAtRisk: amt,
      currency: r.currency,
      failureCategory: r.failureCategory || "other",
      errorCode: r.errorCode || undefined,
      errorDescription: r.errorDescription || undefined,
      recoveryProbability: probability,
      probabilityTier: tier,
      isRecoverable,
      status: r.status === "captured" ? "recovered" : "detected",
      itemsSummary,
      createdAt: r.createdAt,
    });
  }

  return items;
}

export async function getFailureCategoryDistribution(
  merchantId?: string
): Promise<CategoryStat[]> {
  const queue = await getOpportunityQueue(merchantId);
  const totalAmount = queue.reduce((sum, q) => sum + q.amountAtRisk, 0);

  const categoryMap = new Map<
    string,
    { count: number; amount: number; totalProb: number }
  >();

  for (const q of queue) {
    const cat = q.failureCategory || "other";
    const existing = categoryMap.get(cat) || { count: 0, amount: 0, totalProb: 0 };
    existing.count += 1;
    existing.amount += q.amountAtRisk;
    existing.totalProb += q.recoveryProbability;
    categoryMap.set(cat, existing);
  }

  const categoryLabels: Record<string, string> = {
    insufficient_funds: "Insufficient Balance",
    bank_technical_error: "Bank Technical Timeout",
    network_timeout: "Gateway Network Timeout",
    user_dropped: "Customer Abandoned Modal",
    authentication_failed: "3DS / OTP Auth Failed",
    card_expired: "Card Expired",
    risk_rejected: "Issuer Risk Rejected",
    other: "Other Gateway Errors",
  };

  const results: CategoryStat[] = [];

  for (const [cat, data] of categoryMap.entries()) {
    results.push({
      category: cat,
      label: categoryLabels[cat] || cat.replace(/_/g, " "),
      count: data.count,
      amount: Math.round(data.amount),
      percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0,
      averageProbability: Math.round(data.totalProb / data.count),
    });
  }

  return results.sort((a, b) => b.amount - a.amount);
}