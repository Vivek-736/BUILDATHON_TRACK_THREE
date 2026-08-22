import { 
  db, 
  merchants, 
  customers, 
  products, 
  policies, 
  orders, 
  orderItems, 
  payments, 
  auditEvents 
} from "./index";

async function seed() {
  console.log("🌱 Starting RecoverAI / NovaCart database seed...");

  // 1. Merchant
  const defaultMerchant = {
    id: "merchant_novacart_01",
    name: "NovaCart India",
    email: "support@novacart.in",
    storeName: "NovaCart Electronics & Lifestyle",
    currency: "INR",
  };

  console.log("Inserting default merchant...");
  await db
    .insert(merchants)
    .values(defaultMerchant)
    .onConflictDoUpdate({
      target: merchants.id,
      set: {
        name: defaultMerchant.name,
        storeName: defaultMerchant.storeName,
        updatedAt: new Date(),
      },
    });

  // 2. Policy
  const defaultPolicy = {
    id: "policy_novacart_default",
    merchantId: defaultMerchant.id,
    name: "Standard Autonomous Recovery Guardrail",
    description: "Autonomously retries payments under ₹50k for transient failure codes with exponential backoff.",
    maxRetries: 3,
    maxAmountPerAutoAction: "50000.00",
    minDelaySeconds: 300,
    eligibleCategories: [
      "insufficient_funds",
      "network_timeout",
      "bank_technical_error",
      "user_dropped"
    ],
    requireHumanApprovalAbove: "100000.00",
    isActive: true,
  };

  console.log("Inserting default policy...");
  await db
    .insert(policies)
    .values(defaultPolicy)
    .onConflictDoUpdate({
      target: policies.id,
      set: {
        maxRetries: defaultPolicy.maxRetries,
        maxAmountPerAutoAction: defaultPolicy.maxAmountPerAutoAction,
        updatedAt: new Date(),
      },
    });

  // 3. Customers
  const defaultCustomers = [
    {
      id: "cust_aarav",
      merchantId: defaultMerchant.id,
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      phone: "+91 98765 43210",
      riskScore: "12.50",
      totalOrders: 4,
      recoveredAmount: "3499.00",
    },
    {
      id: "cust_priya",
      merchantId: defaultMerchant.id,
      name: "Priya Patel",
      email: "priya.patel@example.com",
      phone: "+91 98234 56789",
      riskScore: "8.00",
      totalOrders: 6,
      recoveredAmount: "0.00",
    },
    {
      id: "cust_rohan",
      merchantId: defaultMerchant.id,
      name: "Rohan Mehta",
      email: "rohan.mehta@example.com",
      phone: "+91 98123 45678",
      riskScore: "44.00",
      totalOrders: 2,
      recoveredAmount: "8999.00",
    },
    {
      id: "cust_ananya",
      merchantId: defaultMerchant.id,
      name: "Ananya Sen",
      email: "ananya.sen@example.com",
      phone: "+91 98901 23456",
      riskScore: "4.20",
      totalOrders: 9,
      recoveredAmount: "12499.00",
    },
    {
      id: "cust_vikram",
      merchantId: defaultMerchant.id,
      name: "Vikram Malhotra",
      email: "vikram.m@example.com",
      phone: "+91 98345 67890",
      riskScore: "28.00",
      totalOrders: 3,
      recoveredAmount: "0.00",
    },
  ];

  console.log("Inserting customers...");
  for (const c of defaultCustomers) {
    await db
      .insert(customers)
      .values(c)
      .onConflictDoUpdate({
        target: customers.id,
        set: {
          name: c.name,
          phone: c.phone,
          riskScore: c.riskScore,
          updatedAt: new Date(),
        },
      });
  }

  // 4. Products with verified high-res Unsplash images
  const defaultProducts = [
    {
      id: "prod_airpulse",
      merchantId: defaultMerchant.id,
      title: "AirPulse Pro ANC Wireless Earbuds",
      description: "Active Noise Cancellation, 36-hour total playback, IPX5 water resistance, fast pairing, and rich spatial audio.",
      price: "3499.00",
      inventoryCount: 45,
      imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
      category: "Audio",
    },
    {
      id: "prod_apex_chrono",
      merchantId: defaultMerchant.id,
      title: "Apex Chrono Ultra Smartwatch",
      description: "1.43\" AMOLED always-on display, titanium alloy casing, continuous heart rate & SpO2 monitor, GPS navigation, and 7-day battery life.",
      price: "4999.00",
      inventoryCount: 28,
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      category: "Wearables",
    },
    {
      id: "prod_echobeam",
      merchantId: defaultMerchant.id,
      title: "EchoBeam 120W Dolby Cinematic Soundbar",
      description: "Wireless subwoofer, Dolby Atmos audio processing, HDMI eARC support, Bluetooth 5.3, with dedicated gaming and movie sound profiles.",
      price: "8999.00",
      inventoryCount: 15,
      imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80",
      category: "Audio",
    },
    {
      id: "prod_ultravision",
      merchantId: defaultMerchant.id,
      title: "UltraVision 27\" 4K UHD Creator Monitor",
      description: "100% sRGB color gamut, USB-C 90W power delivery, HDR400 certified, ultra-thin bezels, and height-adjustable ergonomic stand.",
      price: "24999.00",
      inventoryCount: 9,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
      category: "Displays",
    },
    {
      id: "prod_neoglow",
      merchantId: defaultMerchant.id,
      title: "NeoGlow Tri-Mode Mechanical Keyboard",
      description: "Hot-swappable tactile switches, per-key RGB backlighting, custom PBT keycaps, sound-dampening foam, and multi-device Bluetooth/2.4G.",
      price: "6299.00",
      inventoryCount: 34,
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
      category: "Accessories",
    },
    {
      id: "prod_aerocharge",
      merchantId: defaultMerchant.id,
      title: "AeroCharge Mag 3-in-1 Fast Wireless Stand",
      description: "Simultaneous 15W magnetic phone charging, smartwatch dock, and earbud tray with intelligent thermal dissipation.",
      price: "2799.00",
      inventoryCount: 50,
      imageUrl: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&q=80",
      category: "Accessories",
    },
    {
      id: "prod_soundbreeze",
      merchantId: defaultMerchant.id,
      title: "SoundBreeze Master ANC Studio Headphones",
      description: "Hi-Res wireless certified, custom 45mm neodymium drivers, ultra-plush memory foam earcups, transparency mode, and 50hr battery.",
      price: "12499.00",
      inventoryCount: 20,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      category: "Audio",
    },
    {
      id: "prod_lumina",
      merchantId: defaultMerchant.id,
      title: "Lumina Smart RGB Magnetic Ambient Light",
      description: "16M colors, music sync sensor, touch dimmer control, magnetic base with 360° rotation, and seamless app automation.",
      price: "1999.00",
      inventoryCount: 42,
      imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
      category: "Smart Home",
    },
  ];

  console.log("Inserting products...");
  for (const p of defaultProducts) {
    await db
      .insert(products)
      .values(p)
      .onConflictDoUpdate({
        target: products.id,
        set: {
          title: p.title,
          description: p.description,
          price: p.price,
          inventoryCount: p.inventoryCount,
          imageUrl: p.imageUrl,
          category: p.category,
          updatedAt: new Date(),
        },
      });
  }

  // 5. Initial Sample Orders & Payment Records (to demonstrate real historical data)
  console.log("Seeding sample historical transactions...");
  const sampleOrder1 = {
    id: "ord_hist_01",
    merchantId: defaultMerchant.id,
    customerId: "cust_aarav",
    totalAmount: "3499.00",
    currency: "INR",
    status: "completed" as const,
    razorpayOrderId: "order_mock_001",
    metadata: { items: [{ id: "prod_airpulse", title: "AirPulse Pro ANC Wireless Earbuds", quantity: 1 }] },
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
  };

  await db.insert(orders).values(sampleOrder1).onConflictDoNothing();

  await db.insert(orderItems).values({
    id: "item_hist_01",
    orderId: sampleOrder1.id,
    productId: "prod_airpulse",
    quantity: 1,
    unitPrice: "3499.00",
    totalPrice: "3499.00",
  }).onConflictDoNothing();

  await db.insert(payments).values({
    id: "pay_hist_01",
    merchantId: defaultMerchant.id,
    orderId: sampleOrder1.id,
    customerId: "cust_aarav",
    amount: "3499.00",
    currency: "INR",
    status: "captured",
    razorpayPaymentId: "pay_mock_success_01",
    razorpayOrderId: "order_mock_001",
    paymentMethod: "upi",
    isAtRisk: false,
    createdAt: new Date(Date.now() - 86400000 * 2),
  }).onConflictDoNothing();

  // Failed historical payment (At risk)
  const sampleOrder2 = {
    id: "ord_hist_02",
    merchantId: defaultMerchant.id,
    customerId: "cust_rohan",
    totalAmount: "8999.00",
    currency: "INR",
    status: "failed" as const,
    razorpayOrderId: "order_mock_002",
    metadata: { items: [{ id: "prod_echobeam", title: "EchoBeam 120W Dolby Cinematic Soundbar", quantity: 1 }] },
    createdAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
  };

  await db.insert(orders).values(sampleOrder2).onConflictDoNothing();

  await db.insert(orderItems).values({
    id: "item_hist_02",
    orderId: sampleOrder2.id,
    productId: "prod_echobeam",
    quantity: 1,
    unitPrice: "8999.00",
    totalPrice: "8999.00",
  }).onConflictDoNothing();

  await db.insert(payments).values({
    id: "pay_hist_02",
    merchantId: defaultMerchant.id,
    orderId: sampleOrder2.id,
    customerId: "cust_rohan",
    amount: "8999.00",
    currency: "INR",
    status: "failed",
    razorpayPaymentId: "pay_mock_fail_02",
    razorpayOrderId: "order_mock_002",
    paymentMethod: "card",
    errorCode: "INSUFFICIENT_FUNDS",
    errorDescription: "The customer bank account had insufficient balance for the transaction amount.",
    failureCategory: "insufficient_funds",
    isAtRisk: true,
    createdAt: new Date(Date.now() - 86400000 * 1),
  }).onConflictDoNothing();

  // Audit event for the failure
  await db.insert(auditEvents).values({
    id: "audit_hist_01",
    merchantId: defaultMerchant.id,
    action: "detect",
    actorType: "system",
    actorId: "razorpay_webhook_listener",
    details: {
      orderId: sampleOrder2.id,
      amount: 8999.00,
      reason: "Payment failure detected: INSUFFICIENT_FUNDS",
    },
    amountImpact: "8999.00",
    timestamp: new Date(Date.now() - 86400000 * 1),
  }).onConflictDoNothing();

  console.log("✅ Seed completed successfully!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});