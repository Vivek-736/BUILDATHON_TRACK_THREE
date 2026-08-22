"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "@/features/analytics/components/dashboard-header";
import { KpiCardGrid } from "@/features/analytics/components/kpi-card-grid";
import { CategoryBreakdown } from "@/features/analytics/components/category-breakdown";
import { OpportunityQueue } from "@/features/analytics/components/opportunity-queue";
import { CaseInspectDrawer } from "@/features/analytics/components/case-inspect-drawer";
import { BatchRecoveryCard } from "@/features/analytics/components/batch-recovery-card";
import { AuditTimeline } from "@/features/audit/components/audit-timeline";
import type { 
  DashboardStats, 
  CategoryStat, 
  OpportunityItem 
} from "@/features/analytics/services/intelligence-service";
import { 
  ShieldCheck, 
  Layers, 
  FileText, 
  LayoutDashboard,
  Zap
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    revenueAtRisk: 0,
    recoverableRevenue: 0,
    revenueRecovered: 0,
    recoveryRatePercent: 0,
    totalLossCases: 0,
    recoverableCases: 0,
    recoveredCases: 0,
    activeOpportunitiesCount: 0,
  });

  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [cases, setCases] = useState<OpportunityItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState("NovaCart India");
  const [activeTab, setActiveTab] = useState<"overview" | "batch" | "audit">("overview");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (category = selectedCategory) => {
    try {
      setIsRefreshing(true);
      const [statsRes, casesRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch(`/api/dashboard/cases?category=${encodeURIComponent(category)}`),
      ]);

      const statsData = await statsRes.json();
      const casesData = await casesRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
        setCategories(statsData.categoryStats || []);
        if (statsData.merchant?.name) {
          setMerchantName(statsData.merchant.name);
        }
      }

      if (casesData.success) {
        setCases(casesData.cases || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData(selectedCategory);
  }, [selectedCategory, fetchData]);

  const handleCategoryFilter = (cat: string) => {
    setSelectedCategory(cat);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col font-sans">
      {/* Header */}
      <DashboardHeader
        merchantName={merchantName}
        onRefresh={() => fetchData(selectedCategory)}
        isRefreshing={isRefreshing}
        onDemoReset={() => fetchData("all")}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Title Bar with Mode Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Revenue Recovery Intelligence Control Center
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live monitoring, autonomous Nemotron diagnosis, deterministic policy guardrails, and measured ₹ recovery.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center bg-gray-200/80 p-1 rounded-xl border border-gray-200 text-xs font-bold self-start md:self-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === "overview"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview & Queue</span>
            </button>

            <button
              onClick={() => setActiveTab("batch")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === "batch"
                  ? "bg-white text-[#ea580c] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Batch Recovery</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === "audit"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Trail</span>
            </button>
          </div>
        </div>

        {/* 1. Global KPI Metrics (Always Visible) */}
        <KpiCardGrid stats={stats} />

        {/* 2. Tab Contents */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols): Revenue Opportunity Queue */}
            <div className="lg:col-span-8 space-y-6">
              <OpportunityQueue
                items={cases}
                onSelectCase={(paymentId) => setSelectedCaseId(paymentId)}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategoryFilter}
              />
            </div>

            {/* Right Column (4 cols): Category Breakdown & Guardrails */}
            <div className="lg:col-span-4 space-y-6">
              <CategoryBreakdown
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategoryFilter}
              />

              {/* Active Merchant Policy Guardrails */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#ea580c]" />
                    Enforced Guardrails
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    Policy Engine Active
                  </span>
                </div>

                <div className="space-y-2 text-xs text-gray-600 divide-y divide-gray-100">
                  <div className="flex justify-between pt-1.5">
                    <span>Max Retry Limit:</span>
                    <span className="font-bold text-gray-900">3 Attempts</span>
                  </div>
                  <div className="flex justify-between pt-1.5">
                    <span>Max Autonomous Cap:</span>
                    <span className="font-bold text-gray-900 font-mono">₹50,000</span>
                  </div>
                  <div className="flex justify-between pt-1.5">
                    <span>AI Reasoning Authority:</span>
                    <span className="font-semibold text-emerald-700">Proposal Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "batch" && (
          <div className="space-y-6">
            <BatchRecoveryCard onBatchComplete={() => fetchData("all")} />

            {/* Queue Preview */}
            <OpportunityQueue
              items={cases}
              onSelectCase={(paymentId) => setSelectedCaseId(paymentId)}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryFilter}
            />
          </div>
        )}

        {activeTab === "audit" && (
          <div className="space-y-6">
            <AuditTimeline />
          </div>
        )}
      </main>

      {/* Case Inspect Drawer */}
      <CaseInspectDrawer
        paymentId={selectedCaseId}
        onClose={() => setSelectedCaseId(null)}
        onCaseRecovered={() => fetchData(selectedCategory)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white text-gray-400 py-6 text-xs text-center">
        <p>RecoverAI Control Center • All revenue metrics derived from verified Neon Postgres database ledger events.</p>
      </footer>
    </div>
  );
}