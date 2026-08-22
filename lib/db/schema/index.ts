import { pgTable, text, timestamp, integer, numeric, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "created",
  "authorized",
  "captured",
  "failed",
  "refunded"
]);

export const recoveryStatusEnum = pgEnum("recovery_status", [
  "detected",
  "diagnosing",
  "action_proposed",
  "policy_approved",
  "policy_rejected",
  "executing",
  "recovered",
  "stopped",
  "failed"
]);

export const failureCategoryEnum = pgEnum("failure_category", [
  "insufficient_funds",
  "authentication_failed",
  "network_timeout",
  "card_expired",
  "bank_technical_error",
  "user_dropped",
  "risk_rejected",
  "other"
]);

// 1. Merchants
export const merchants = pgTable("merchants", {
  id: text("id").primaryKey(), // clerk user id or internal merchant id
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  storeName: text("store_name").notNull().default("NovaCart Store"),
  currency: text("currency").notNull().default("INR"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Customers
export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  merchantId: text("merchant_id").references(() => merchants.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  riskScore: numeric("risk_score", { precision: 5, scale: 2 }).default("0.00"),
  totalOrders: integer("total_orders").default(0).notNull(),
  recoveredAmount: numeric("recovered_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Products
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  merchantId: text("merchant_id").references(() => merchants.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  inventoryCount: integer("inventory_count").default(100).notNull(),
  imageUrl: text("image_url"),
  category: text("category").default("general"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 4. Orders
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  merchantId: text("merchant_id").references(() => merchants.id).notNull(),
  customerId: text("customer_id").references(() => customers.id).notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("INR"),
  status: orderStatusEnum("status").default("pending").notNull(),
  razorpayOrderId: text("razorpay_order_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 5. Order Items
export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  productId: text("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
});

// 6. Payments
export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  merchantId: text("merchant_id").references(() => merchants.id).notNull(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  customerId: text("customer_id").references(() => customers.id).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("INR"),
  status: paymentStatusEnum("status").default("created").notNull(),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpayOrderId: text("razorpay_order_id"),
  paymentMethod: text("payment_method"), // upi, card, netbanking, wallet
  errorCode: text("error_code"),
  errorDescription: text("error_description"),
  failureCategory: failureCategoryEnum("failure_category"),
  isAtRisk: boolean("is_at_risk").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 7. Recovery Cases
export const recoveryCases = pgTable("recovery_cases", {
  id: text("id").primaryKey(),
  merchantId: text("merchant_id").references(() => merchants.id).notNull(),
  paymentId: text("payment_id").references(() => payments.id).notNull(),
  orderId: text("order_id").references(() => orders.id).notNull(),
  customerId: text("customer_id").references(() => customers.id).notNull(),
  amountAtRisk: numeric("amount_at_risk", { precision: 12, scale: 2 }).notNull(),
  recoveredAmount: numeric("recovered_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  status: recoveryStatusEnum("status").default("detected").notNull(),
  failureCategory: failureCategoryEnum("failure_category").notNull(),
  diagnosis: text("diagnosis"),
  recommendedIntervention: text("recommended_intervention"),
  confidenceScore: numeric("confidence_score", { precision: 5, scale: 2 }),
  policyDecision: text("policy_decision"), // ALLOWED / REJECTED
  policyReason: text("policy_reason"),
  attemptsCount: integer("attempts_count").default(0).notNull(),
  maxAttempts: integer("max_attempts").default(3).notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 8. Recovery Attempts
export const recoveryAttempts = pgTable("recovery_attempts", {
  id: text("id").primaryKey(),
  recoveryCaseId: text("recovery_case_id").references(() => recoveryCases.id).notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  actionType: text("action_type").notNull(), // retry_payment, send_recovery_link, customer_prompt
  status: text("status").notNull(), // initiated, succeeded, failed, skipped
  resultDetails: jsonb("result_details").$type<Record<string, unknown>>().default({}),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 9. Recovery Workflows
export const recoveryWorkflows = pgTable("recovery_workflows", {
  id: text("id").primaryKey(),
  recoveryCaseId: text("recovery_case_id").references(() => recoveryCases.id).notNull(),
  triggerRunId: text("trigger_run_id"),
  workflowType: text("workflow_type").notNull().default("standard_recovery"),
  currentState: text("current_state").notNull().default("initiated"),
  stepIndex: integer("step_index").default(0).notNull(),
  isFinished: boolean("is_finished").default(false).notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 10. Policies
export const policies = pgTable("policies", {
  id: text("id").primaryKey(),
  merchantId: text("merchant_id").references(() => merchants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  maxRetries: integer("max_retries").default(3).notNull(),
  maxAmountPerAutoAction: numeric("max_amount_per_auto_action", { precision: 12, scale: 2 }).default("50000.00").notNull(),
  minDelaySeconds: integer("min_delay_seconds").default(300).notNull(),
  eligibleCategories: jsonb("eligible_categories").$type<string[]>().default([
    "insufficient_funds",
    "network_timeout",
    "bank_technical_error",
    "user_dropped"
  ]).notNull(),
  requireHumanApprovalAbove: numeric("require_human_approval_above", { precision: 12, scale: 2 }).default("100000.00"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 11. Audit Events
export const auditEvents = pgTable("audit_events", {
  id: text("id").primaryKey(),
  merchantId: text("merchant_id").references(() => merchants.id).notNull(),
  recoveryCaseId: text("recovery_case_id").references(() => recoveryCases.id),
  action: text("action").notNull(), // detect, diagnose, decide, gate, act, recover, stop
  actorType: text("actor_type").notNull(), // ai_agent, policy_engine, workflow, merchant_user, system
  actorId: text("actor_id").notNull(),
  details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
  amountImpact: numeric("amount_impact", { precision: 12, scale: 2 }),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const merchantsRelations = relations(merchants, ({ many }) => ({
  customers: many(customers),
  products: many(products),
  orders: many(orders),
  payments: many(payments),
  recoveryCases: many(recoveryCases),
  policies: many(policies),
  auditEvents: many(auditEvents),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  merchant: one(merchants, { fields: [orders.merchantId], references: [merchants.id] }),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  items: many(orderItems),
  payments: many(payments),
  recoveryCases: many(recoveryCases),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
  customer: one(customers, { fields: [payments.customerId], references: [customers.id] }),
  recoveryCases: many(recoveryCases),
}));

export const recoveryCasesRelations = relations(recoveryCases, ({ one, many }) => ({
  merchant: one(merchants, { fields: [recoveryCases.merchantId], references: [merchants.id] }),
  payment: one(payments, { fields: [recoveryCases.paymentId], references: [payments.id] }),
  order: one(orders, { fields: [recoveryCases.orderId], references: [orders.id] }),
  customer: one(customers, { fields: [recoveryCases.customerId], references: [customers.id] }),
  attempts: many(recoveryAttempts),
  workflows: many(recoveryWorkflows),
  auditEvents: many(auditEvents),
}));