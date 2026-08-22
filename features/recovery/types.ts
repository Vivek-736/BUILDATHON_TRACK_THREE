import type { FailureCategory } from "../payments/types";

export type RecoveryStatus =
  | "detected"
  | "diagnosing"
  | "action_proposed"
  | "policy_approved"
  | "policy_rejected"
  | "executing"
  | "recovered"
  | "stopped"
  | "failed";

export interface RecoveryCase {
  id: string;
  merchantId: string;
  paymentId: string;
  orderId: string;
  customerId: string;
  amountAtRisk: number;
  recoveredAmount: number;
  status: RecoveryStatus;
  failureCategory: FailureCategory;
  diagnosis?: string;
  recommendedIntervention?: string;
  confidenceScore?: number;
  policyDecision?: "ALLOWED" | "REJECTED";
  policyReason?: string;
  attemptsCount: number;
  maxAttempts: number;
  resolvedAt?: Date;
  createdAt: Date;
}