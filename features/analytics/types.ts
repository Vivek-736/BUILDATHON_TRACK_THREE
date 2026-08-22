export interface RecoveryMetrics {
  revenueAtRisk: number;
  recoverableRevenue: number;
  revenueRecovered: number;
  recoveryRatePercent: number;
  totalCases: number;
  recoveredCases: number;
  failedCases: number;
  policyStops: number;
  averageRecoveryTimeSeconds: number;
}