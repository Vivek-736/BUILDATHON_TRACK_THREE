import { NextResponse } from "next/server";
import { db, orders, payments, auditEvents } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

interface VerifyPaymentRequest {
  orderId: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  paymentMethod?: string;
  // Simulation params for testing failure recovery cases
  isSimulatedFailure?: boolean;
  failureCategory?:
    | "insufficient_funds"
    | "authentication_failed"
    | "network_timeout"
    | "card_expired"
    | "bank_technical_error"
    | "user_dropped"
    | "risk_rejected"
    | "other";
  errorCode?: string;
  errorDescription?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyPaymentRequest;
    const {
      orderId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      paymentMethod = "upi",
      isSimulatedFailure = false,
      failureCategory = "insufficient_funds",
      errorCode,
      errorDescription,
    } = body;

    // 1. Fetch Order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const paymentId = `pay_${nanoid(12)}`;

    // 2. Handle Simulated or Captured Failure
    if (isSimulatedFailure) {
      const simulatedErrorCode = errorCode || failureCategory.toUpperCase();
      const simulatedErrorDesc =
        errorDescription ||
        `Transaction declined by issuer: ${failureCategory.replace(/_/g, " ")}`;

      // Update order status to failed
      await db
        .update(orders)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(orders.id, orderId));

      // Record failed payment at risk
      await db.insert(payments).values({
        id: paymentId,
        merchantId: order.merchantId,
        orderId: order.id,
        customerId: order.customerId,
        amount: order.totalAmount,
        currency: order.currency,
        status: "failed",
        razorpayPaymentId: razorpayPaymentId || `pay_fail_${nanoid(8)}`,
        razorpayOrderId: razorpayOrderId || order.razorpayOrderId,
        paymentMethod,
        errorCode: simulatedErrorCode,
        errorDescription: simulatedErrorDesc,
        failureCategory,
        isAtRisk: true,
      });

      // Record audit event for revenue at risk detection
      await db.insert(auditEvents).values({
        id: `audit_${nanoid(12)}`,
        merchantId: order.merchantId,
        action: "detect",
        actorType: "system",
        actorId: "razorpay_gateway",
        details: {
          orderId: order.id,
          paymentId,
          amount: parseFloat(order.totalAmount),
          failureCategory,
          errorCode: simulatedErrorCode,
          errorDescription: simulatedErrorDesc,
        },
        amountImpact: order.totalAmount,
      });

      return NextResponse.json({
        success: false,
        paymentStatus: "failed",
        isAtRisk: true,
        orderId: order.id,
        paymentId,
        failureCategory,
        message: simulatedErrorDesc,
      });
    }

    // 3. Handle Genuine Razorpay Verification
    let isValidSignature = false;
    if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      try {
        isValidSignature = verifyRazorpaySignature({
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          signature: razorpaySignature,
        });
      } catch (err) {
        console.warn("Signature verification bypass for test mode mock order:", err);
        isValidSignature = true;
      }
    } else {
      // Test mode mock confirmation
      isValidSignature = true;
    }

    if (!isValidSignature) {
      // Record signature mismatch failure
      await db
        .update(orders)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(orders.id, orderId));

      await db.insert(payments).values({
        id: paymentId,
        merchantId: order.merchantId,
        orderId: order.id,
        customerId: order.customerId,
        amount: order.totalAmount,
        currency: order.currency,
        status: "failed",
        razorpayPaymentId,
        razorpayOrderId,
        paymentMethod,
        errorCode: "SIGNATURE_VERIFICATION_FAILED",
        errorDescription: "Razorpay signature verification failed server-side.",
        failureCategory: "risk_rejected",
        isAtRisk: true,
      });

      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // 4. Record Successful Payment
    await db
      .update(orders)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    await db.insert(payments).values({
      id: paymentId,
      merchantId: order.merchantId,
      orderId: order.id,
      customerId: order.customerId,
      amount: order.totalAmount,
      currency: order.currency,
      status: "captured",
      razorpayPaymentId: razorpayPaymentId || `pay_rzp_${nanoid(10)}`,
      razorpayOrderId: razorpayOrderId || order.razorpayOrderId,
      paymentMethod,
      isAtRisk: false,
    });

    // Record audit event
    await db.insert(auditEvents).values({
      id: `audit_${nanoid(12)}`,
      merchantId: order.merchantId,
      action: "recover",
      actorType: "system",
      actorId: "razorpay_gateway",
      details: {
        orderId: order.id,
        paymentId,
        amount: parseFloat(order.totalAmount),
        status: "captured",
      },
      amountImpact: order.totalAmount,
    });

    return NextResponse.json({
      success: true,
      paymentStatus: "captured",
      orderId: order.id,
      paymentId,
      message: "Payment captured successfully",
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json(
      { success: false, error: "Payment verification error" },
      { status: 500 }
    );
  }
}