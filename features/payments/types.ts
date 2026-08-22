export type PaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded";

export type FailureCategory =
  | "insufficient_funds"
  | "authentication_failed"
  | "network_timeout"
  | "card_expired"
  | "bank_technical_error"
  | "user_dropped"
  | "risk_rejected"
  | "other";

export interface PaymentRecord {
  id: string;
  merchantId: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  paymentMethod?: string;
  errorCode?: string;
  errorDescription?: string;
  failureCategory?: FailureCategory;
  isAtRisk: boolean;
  createdAt: Date;
}