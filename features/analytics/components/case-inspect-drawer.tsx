"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  X, 
  AlertOctagon, 
  Sparkles,  
  User, 
  ShoppingBag, 
  Activity, 
  Zap,
  CheckCircle2,
  Cpu,
  ShieldAlert
} from "lucide-react";
import type { RecoveryDiagnosis } from "@/features/recovery/services/agent-service";

interface CaseInspectDrawerProps {
  paymentId: string | null;
  onClose: () => void;
}

interface CaseDetail {
  paymentId: string;
  orderId: string;
  customerId: string;
  amount: string;
  currency: string;
  status: string;
  failureCategory: string;
  errorCode?: string;
  errorDescription?: string;
  paymentMethod?: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerRiskScore: string;
  customerTotalOrders: number;
  customerRecoveredAmount: string;
  amountNum: number;
  recoveryProbability: number;
  probabilityTier: "high" | "medium" | "low";
  isRecoverable: boolean;
  items: Array<{
    id: string;
    title: string;
    unitPrice: string;
    quantity: number;
    totalPrice: string;
    imageUrl?: string;
    category?: string;
  }>;
  audits: Array<{
    id: string;
    action: string;
    actorType: string;
    actorId: string;
    details: Record<string, unknown>;
    timestamp: string;
  }>;
}

export function CaseInspectDrawer({ paymentId, onClose }: CaseInspectDrawerProps) {
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<RecoveryDiagnosis | null>(null);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setCaseData(null);
      setAiDiagnosis(null);
      setDiagnosisError(null);
      return;
    }

    async function loadCase() {
      try {
        setIsLoading(true);
        setAiDiagnosis(null);
        setDiagnosisError(null);
        const res = await fetch(`/api/dashboard/cases/${paymentId}`);
        const data = await res.json();
        if (data.success && data.caseData) {
          setCaseData(data.caseData);
        }
      } catch (err) {
        console.error("Failed to load case details:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCase();
  }, [paymentId]);

  const handleRunAiDiagnosis = async () => {
    if (!paymentId) return;
    try {
      setIsDiagnosing(true);
      setDiagnosisError(null);
      const res = await fetch("/api/recovery/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });

      const data = await res.json();
      if (data.success && data.diagnosis) {
        setAiDiagnosis(data.diagnosis);
      } else {
        setDiagnosisError(data.error || "Recovery analysis couldn't be completed.");
      }
    } catch (err) {
      console.error("AI diagnosis trigger failed:", err);
      setDiagnosisError("Recovery analysis couldn't be completed. Please retry.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  if (!paymentId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-2xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-white border-l border-gray-200 text-gray-900 shadow-2xl flex flex-col justify-between">
          {/* Top Header */}
          <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Revenue-at-Risk Case</h2>
                <span className="text-[11px] font-mono text-gray-400">ID: {paymentId}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-20 bg-gray-100 rounded-xl" />
                <div className="h-32 bg-gray-100 rounded-xl" />
                <div className="h-40 bg-gray-100 rounded-xl" />
              </div>
            ) : !caseData ? (
              <div className="p-8 text-center text-gray-400">Case details not found</div>
            ) : (
              <>
                {/* 1. Value at Risk & Calibrated Probability Card */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      Amount at Risk
                    </span>
                    <span className="text-2xl font-extrabold text-gray-900 font-mono mt-0.5 block">
                      ₹{caseData.amountNum.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-red-600 font-medium">
                      Status: {caseData.status} • Order #{caseData.orderId.slice(-8)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      Recovery Probability
                    </span>
                    <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      {caseData.recoveryProbability}% Probability
                    </span>
                  </div>
                </div>

                {/* 2. AI Reasoning / Diagnosis Showcase */}
                {isDiagnosing ? (
                  <div className="p-5 bg-orange-50/70 border border-orange-200 rounded-xl space-y-3 animate-pulse">
                    <div className="flex items-center gap-2 text-[#ea580c] font-bold text-xs">
                      <Cpu className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Context via NVIDIA Nemotron...</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Evaluating gateway traces, customer risk score ({caseData.customerRiskScore}%), transaction volume (₹{caseData.amountNum}), and policy limits.
                    </p>
                  </div>
                ) : aiDiagnosis ? (
                  <div className="p-4 sm:p-5 bg-linear-to-b from-orange-50/50 to-white border border-orange-200 rounded-xl space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#ea580c] flex items-center gap-1.5 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 fill-current" />
                        AI Recovery Diagnosis (NVIDIA Nemotron)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {aiDiagnosis.confidenceScore}% Confidence
                      </span>
                    </div>

                    {/* Root cause */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                        Diagnosed Root Cause
                      </span>
                      <p className="text-xs font-semibold text-gray-900 leading-relaxed">
                        {aiDiagnosis.diagnosis}
                      </p>
                    </div>

                    {/* Recommended Action & Delay */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 rounded-lg bg-white border border-gray-200">
                        <span className="block text-[10px] text-gray-500 font-medium">Recommended Action</span>
                        <span className="block text-xs font-bold text-gray-900 capitalize mt-0.5">
                          {aiDiagnosis.recommendedAction.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-gray-200">
                        <span className="block text-[10px] text-gray-500 font-medium">Execution Timing</span>
                        <span className="block text-xs font-bold text-gray-900 mt-0.5">
                          {aiDiagnosis.delaySeconds === 0 ? "Instant Dispatch" : `Delayed (${aiDiagnosis.delaySeconds}s)`}
                        </span>
                      </div>
                    </div>

                    {/* Plain English Rationale */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                        Reasoning & Rationale
                      </span>
                      <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-200">
                        {aiDiagnosis.rationale}
                      </p>
                    </div>

                    {/* Risk summary */}
                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                      <span>Customer Profile: <strong className="text-gray-800">{aiDiagnosis.riskAssessment}</strong></span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Policy Compliant
                      </span>
                    </div>
                  </div>
                ) : diagnosisError ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs space-y-2">
                    <span className="font-bold text-red-700 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      Recovery analysis couldn&apos;t be completed.
                    </span>
                    <button
                      onClick={handleRunAiDiagnosis}
                      className="px-3 py-1.5 rounded-md bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition"
                    >
                      Retry Analysis
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">
                        Autonomous AI Reasoning
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        Run NVIDIA Nemotron diagnostic on this failure case
                      </span>
                    </div>
                    <button
                      onClick={handleRunAiDiagnosis}
                      disabled={isDiagnosing}
                      className="px-3.5 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#ea580c] fill-current" />
                      <span>Diagnose Now</span>
                    </button>
                  </div>
                )}

                {/* 3. Failure Diagnostic Reason */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#ea580c]" />
                    Gateway Raw Diagnostic Trace
                  </h3>
                  <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Failure Category:</span>
                      <span className="font-semibold text-gray-900 capitalize px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                        {caseData.failureCategory.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Gateway Code:</span>
                      <code className="font-mono text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-[11px]">
                        {caseData.errorCode || "TRANSACTION_DECLINED"}
                      </code>
                    </div>

                    <div className="pt-2 border-t border-gray-100 text-gray-600 text-[11px] leading-relaxed">
                      <strong>Issuer Reason:</strong>{" "}
                      {caseData.errorDescription || "Declined during authorization."}
                    </div>
                  </div>
                </div>

                {/* 4. Customer Profile & Historical Value */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    Customer Reliability Profile
                  </h3>
                  <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-semibold text-gray-900">{caseData.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-mono text-gray-700">{caseData.customerEmail}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-100">
                      <span className="text-gray-500">Risk Assessment:</span>
                      <span className="font-semibold text-emerald-700">
                        {caseData.customerRiskScore}% Risk Score (Verified Customer)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Order Items Summary */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-gray-500" />
                    Items in Order
                  </h3>
                  <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2.5 divide-y">
                    {caseData.items.map((item) => (
                      <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {item.imageUrl && (
                            <div className="relative w-9 h-9 rounded bg-gray-50 border border-gray-200 overflow-hidden shrink-0">
                              <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-gray-900 block">{item.title}</span>
                            <span className="text-[11px] text-gray-400">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-gray-900">
                          ₹{parseFloat(item.totalPrice).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-xs font-semibold text-gray-700 transition"
            >
              Close
            </button>

            {!aiDiagnosis ? (
              <button
                onClick={handleRunAiDiagnosis}
                disabled={isDiagnosing}
                className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-xs font-bold text-white flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-[#ea580c] fill-current" />
                <span>{isDiagnosing ? "Analyzing..." : "Diagnose with AI Agent"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Diagnosis Ready for Policy Engine</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}