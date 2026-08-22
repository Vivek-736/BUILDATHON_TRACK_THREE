import { NextResponse } from "next/server";
import { db, payments, customers, orderItems, products, auditEvents } from "@/lib/db";
import { calculateRecoveryProbability } from "@/features/analytics/services/intelligence-service";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [paymentRecord] = await db
      .select({
        paymentId: payments.id,
        orderId: payments.orderId,
        customerId: payments.customerId,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        failureCategory: payments.failureCategory,
        errorCode: payments.errorCode,
        errorDescription: payments.errorDescription,
        paymentMethod: payments.paymentMethod,
        razorpayPaymentId: payments.razorpayPaymentId,
        razorpayOrderId: payments.razorpayOrderId,
        createdAt: payments.createdAt,
        customerName: customers.name,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        customerRiskScore: customers.riskScore,
        customerTotalOrders: customers.totalOrders,
        customerRecoveredAmount: customers.recoveredAmount,
      })
      .from(payments)
      .innerJoin(customers, eq(payments.customerId, customers.id))
      .where(eq(payments.id, id))
      .limit(1);

    if (!paymentRecord) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    const items = await db
      .select({
        id: orderItems.id,
        title: products.title,
        unitPrice: orderItems.unitPrice,
        quantity: orderItems.quantity,
        totalPrice: orderItems.totalPrice,
        imageUrl: products.imageUrl,
        category: products.category,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, paymentRecord.orderId));

    const audits = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.recoveryCaseId, id))
      .orderBy(desc(auditEvents.timestamp));

    const amt = parseFloat(paymentRecord.amount) || 0;
    const cRisk = parseFloat(paymentRecord.customerRiskScore || "10");
    const { probability, tier, isRecoverable } = calculateRecoveryProbability(
      paymentRecord.failureCategory,
      cRisk,
      amt
    );

    return NextResponse.json({
      success: true,
      caseData: {
        ...paymentRecord,
        items,
        audits,
        amountNum: amt,
        recoveryProbability: probability,
        probabilityTier: tier,
        isRecoverable,
      },
    });
  } catch (error) {
    console.error("Single case query error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load case details" },
      { status: 500 }
    );
  }
}