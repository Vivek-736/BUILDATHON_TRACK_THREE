"use client";

import { useState } from "react";
import { 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  TrendingUp,
} from "lucide-react";
import type { BatchRunResult } from "@/features/workflows/services/batch-service";

interface BatchRecoveryCardProps {
  onBatchComplete?: () => void;
}

export function BatchRecoveryCard({ onBatchComplete }: BatchRecoveryCardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchRunResult | null>(null);

  const handleRunBatch = async () => {
    try {
      setIsRunning(true);
      const res = await fetch("/api/batch/run", { method: "POST" });
      const data = await res.json();
      if (data.success && data.batchResult) {
        setBatchResult(data.batchResult);
        if (onBatchComplete) {
          onBatchComplete();
        }
      }
    } catch (err) {
      console.error("Batch run failed:", err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-[#ea580c] border border-orange-200 text-xs font-bold mb-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>High-Scale Batch Recovery Processor</span>
          </div>
          <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
            Autonomous Batch Revenue Recovery
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 max-w-xl">
            Process multiple payment failures in parallel through the AI reasoning pipeline, apply deterministic policy guardrails, and capture recoverable revenue at scale.
          </p>
        </div>

        <button
          onClick={handleRunBatch}
          disabled={isRunning}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs flex items-center gap-2 transition shadow-xs disabled:opacity-50 shrink-0"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#ea580c]" />
              <span>Processing Batch Pipeline...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-[#ea580c] fill-current" />
              <span>Run 1-Click Batch Recovery Demo</span>
            </>
          )}
        </button>
      </div>

      {/* Recovery Funnel Visualization */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#ea580c]" />
          Recovery Conversion Funnel
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Step 1: Evaluated */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-500 font-semibold uppercase block">
              1. Losses Ingested
            </span>
            <span className="text-xl font-extrabold text-gray-900 font-mono block">
              {batchResult ? batchResult.totalProcessed : "—"} Cases
            </span>
            <span className="text-[10px] text-gray-400">Gateway decline pool</span>
          </div>

          {/* Step 2: Policy Eligible */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-500 font-semibold uppercase block">
              2. Policy Approved
            </span>
            <span className="text-xl font-extrabold text-blue-700 font-mono block">
              {batchResult ? batchResult.eligibleCount : "—"} Eligible
            </span>
            <span className="text-[10px] text-blue-600 font-medium">Passed guardrails</span>
          </div>

          {/* Step 3: Interventions */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
            <span className="text-[10px] text-gray-500 font-semibold uppercase block">
              3. Tool Executions
            </span>
            <span className="text-xl font-extrabold text-[#ea580c] font-mono block">
              {batchResult ? batchResult.interventionsExecuted : "—"} Actions
            </span>
            <span className="text-[10px] text-orange-600 font-medium">Controlled MCP retries</span>
          </div>

          {/* Step 4: Confirmed Recovered */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
            <span className="text-[10px] text-emerald-800 font-semibold uppercase block">
              4. Confirmed Recovered
            </span>
            <span className="text-xl font-extrabold text-emerald-700 font-mono block">
              {batchResult ? `₹${batchResult.totalAmountRecovered.toLocaleString("en-IN")}` : "—"}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold">
              {batchResult ? `${batchResult.recoveryRatePercent}% conversion` : "Direct revenue gain"}
            </span>
          </div>
        </div>
      </div>

      {/* Batch Completion Alert */}
      {batchResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h5 className="text-xs font-bold text-emerald-900">
                Batch Recovery Completed Successfully!
              </h5>
              <p className="text-[11px] text-emerald-700">
                Recovered {batchResult.successfulRecoveries} transactions totaling ₹{batchResult.totalAmountRecovered.toLocaleString("en-IN")}. Verified ledger updated.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-extrabold text-emerald-800 bg-white px-2.5 py-1 rounded border border-emerald-200">
            +{batchResult.recoveryRatePercent}% Rate
          </span>
        </div>
      )}
    </div>
  );
}