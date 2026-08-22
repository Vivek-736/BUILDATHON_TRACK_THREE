import { NextResponse } from "next/server";
import { db, orders, payments, auditEvents } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    // If webhook secret is set, verify signature
    if (process.env.RAZORPAY_WEBHOOK_SECRET && signature) {
      const isValid = verifyWebhookSignature({
        body: rawBody,
        signature,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 400 }
        );
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const paymentEntity = event.payload?.payment?.entity;
    const orderEntity = event.payload?.order?.entity;

    console.log(`Received Razorpay webhook: ${eventType}`);

    const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;

    if (rzpOrderId) {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.razorpayOrderId, rzpOrderId))
        .limit(1);

      if (order) {
        if (eventType === "payment.captured") {
          await db
            .update(orders)
            .set({ status: "completed", updatedAt: new Date() })
            .where(eq(orders.id, order.id));

          await db.insert(payments).values({
            id: `pay_${nanoid(12)}`,
            merchantId: order.merchantId,
            orderId: order.id,
            customerId: order.customerId,
            amount: order.totalAmount,
            currency: order.currency,
            status: "captured",
            razorpayPaymentId: paymentEntity?.id,
            razorpayOrderId: rzpOrderId,
            paymentMethod: paymentEntity?.method || "unknown",
            isAtRisk: false,
          });
        } else if (eventType === "payment.failed") {
          const errorCode = paymentEntity?.error_code || "PAYMENT_FAILED";
          const errorDescription = paymentEntity?.error_description || "Payment failed at gateway";

          let failureCategory: "insufficient_funds" | "network_timeout" | "bank_technical_error" | "authentication_failed" | "other" = "other";
          if (errorCode.includes("INSUFFICIENT")) failureCategory = "insufficient_funds";
          else if (errorCode.includes("TIMEOUT")) failureCategory = "network_timeout";
          else if (errorCode.includes("AUTH") || errorCode.includes("OTP")) failureCategory = "authentication_failed";
          else if (errorCode.includes("BANK") || errorCode.includes("GATEWAY")) failureCategory = "bank_technical_error";

          await db
            .update(orders)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(orders.id, order.id));

          const paymentId = `pay_${nanoid(12)}`;
          await db.insert(payments).values({
            id: paymentId,
            merchantId: order.merchantId,
            orderId: order.id,
            customerId: order.customerId,
            amount: order.totalAmount,
            currency: order.currency,
            status: "failed",
            razorpayPaymentId: paymentEntity?.id,
            razorpayOrderId: rzpOrderId,
            paymentMethod: paymentEntity?.method || "unknown",
            errorCode,
            errorDescription,
            failureCategory,
            isAtRisk: true,
          });

          await db.insert(auditEvents).values({
            id: `audit_${nanoid(12)}`,
            merchantId: order.merchantId,
            action: "detect",
            actorType: "system",
            actorId: "razorpay_webhook",
            details: {
              orderId: order.id,
              paymentId,
              amount: parseFloat(order.totalAmount),
              errorCode,
              errorDescription,
              failureCategory,
            },
            amountImpact: order.totalAmount,
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    );
  }
}