import type { FailureCategory } from "../payments/types";

export interface PolicyRule {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  maxRetries: number;
  maxAmountPerAutoAction: number;
  minDelaySeconds: number;
  eligibleCategories: FailureCategory[];
  requireHumanApprovalAbove?: number;
  isActive: boolean;
}

export type PolicyEvaluationResult = {
  allowed: boolean;
  decision: "ALLOWED" | "REJECTED";
  reason: string;
  ruleViolated?: string;
};