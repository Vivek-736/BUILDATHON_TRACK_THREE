export type AuditActorType =
  | "ai_agent"
  | "policy_engine"
  | "workflow"
  | "merchant_user"
  | "system";

export type AuditActionType =
  | "detect"
  | "diagnose"
  | "decide"
  | "gate"
  | "act"
  | "recover"
  | "stop";

export interface AuditEventRecord {
  id: string;
  merchantId: string;
  recoveryCaseId?: string;
  action: AuditActionType;
  actorType: AuditActorType;
  actorId: string;
  details: Record<string, unknown>;
  amountImpact?: number;
  timestamp: Date;
}