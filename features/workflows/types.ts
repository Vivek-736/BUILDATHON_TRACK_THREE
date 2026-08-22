export type WorkflowState =
  | "initiated"
  | "waiting_delay"
  | "evaluating_policy"
  | "executing_action"
  | "completed"
  | "stopped"
  | "failed";

export interface RecoveryWorkflowRecord {
  id: string;
  recoveryCaseId: string;
  triggerRunId?: string;
  workflowType: string;
  currentState: WorkflowState;
  stepIndex: number;
  isFinished: boolean;
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}