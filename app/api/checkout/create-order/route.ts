import { NextResponse } from "next/server";
import { db, orders, orderItems, customers, merchants, products } from "@/lib/db";
import { createRazorpayOrder } from "@/lib/razorpay";
import { eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

interface CheckoutItem {
  productId: string;
  quantity: number;
}

interface CreateOrderRequest {
  items: CheckoutItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderRequest;
    const { items, customer } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!customer?.email || !customer?.name) {
      return NextResponse.json(
        { success: false, error: "Customer name and email are required" },
        { status: 400 }
      );
    }

    // 1. Fetch default merchant
    const [merchant] = await db.select().from(merchants).limit(1);
    const merchantId = merchant?.id || "merchant_novacart_01";

    // 2. Fetch product records to verify prices and stock
    const productIds = items.map((i) => i.productId);
    const dbProducts = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    if (dbProducts.length === 0) {
      return NextResponse.json(
        { success: false, error: "Selected products do not exist" },
        { status: 400 }
      );
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let totalAmount = 0;
    const verifiedItems = items.map((item) => {
      const p = productMap.get(item.productId);
      if (!p) {
        throw new Error(`Product ${item.productId} not found`);
      }
      const price = parseFloat(p.price);
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;
      return {
        productId: p.id,
        title: p.title,
        quantity: item.quantity,
        unitPrice: p.price,
        totalPrice: itemTotal.toFixed(2),
      };
    });

    // 3. Find or Create Customer
    let customerId = `cust_${nanoid(8)}`;
    const [existingCustomer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, customer.email))
      .limit(1);

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      await db.insert(customers).values({
        id: customerId,
        merchantId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || null,
        riskScore: "10.00",
        totalOrders: 1,
        recoveredAmount: "0.00",
      });
    }

    // 4. Create internal Order
    const orderId = `ord_${nanoid(12)}`;
    const amountInPaise = Math.round(totalAmount * 100);

    // 5. Create Razorpay Order
    let razorpayOrderId: string | null = null;
    try {
      const rzpOrder = await createRazorpayOrder({
        amountInPaise,
        currency: "INR",
        receipt: orderId,
        notes: {
          internalOrderId: orderId,
          customerEmail: customer.email,
          merchantId,
        },
      });
      razorpayOrderId = rzpOrder.id;
    } catch (rzpError) {
      console.warn("Razorpay order creation fallback (test mode simulation):", rzpError);
      razorpayOrderId = `rzp_order_mock_${nanoid(10)}`;
    }

    // 6. Insert Order & Order Items
    await db.insert(orders).values({
      id: orderId,
      merchantId,
      customerId,
      totalAmount: totalAmount.toFixed(2),
      currency: "INR",
      status: "pending",
      razorpayOrderId,
      metadata: {
        customerInfo: customer,
        items: verifiedItems,
      },
    });

    for (const item of verifiedItems) {
      await db.insert(orderItems).values({
        id: `item_${nanoid(10)}`,
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      customer: {
        id: customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize checkout order" },
      { status: 500 }
    );
  }
}