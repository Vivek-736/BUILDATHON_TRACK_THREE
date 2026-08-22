import { NextResponse } from "next/server";
import { db, orders, orderItems, products, payments } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const items = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        totalPrice: orderItems.totalPrice,
        productId: products.id,
        productTitle: products.title,
        productImage: products.imageUrl,
        category: products.category,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, id))
      .orderBy(payments.createdAt)
      .limit(1);

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items,
        payment,
      },
    });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { success: false, error: "Unable to retrieve order" },
      { status: 500 }
    );
  }
}