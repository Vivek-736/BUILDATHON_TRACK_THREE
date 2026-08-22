"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "@/features/analytics/components/dashboard-header";
import { KpiCardGrid } from "@/features/analytics/components/kpi-card-grid";
import { CategoryBreakdown } from "@/features/analytics/components/category-breakdown";
import { OpportunityQueue } from "@/features/analytics/components/opportunity-queue";
import { CaseInspectDrawer } from "@/features/analytics/components/case-inspect-drawer";
import type { 
  DashboardStats, 
  CategoryStat, 
  OpportunityItem 
} from "@/features/analytics/services/intelligence-service";
import { ShieldCheck } from "lucide-react";

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
      {/* Merchant Dashboard Header */}
      <DashboardHeader
        merchantName={merchantName}
        onRefresh={() => fetchData(selectedCategory)}
        isRefreshing={isRefreshing}
      />

      {/* Main Operations Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Title & Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Revenue Recovery Intelligence
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live monitor for uncaptured payment events, algorithmic recoverability scoring, and policy protection.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-2xs text-xs font-semibold text-gray-700 self-start sm:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Policy Engine: Active</span>
          </div>
        </div>

        {/* 1. Primary KPI Grid */}
        <KpiCardGrid stats={stats} />

        {/* 2. Main 2-Column Analytics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Revenue Opportunity Queue Table */}
          <div className="lg:col-span-8">
            <OpportunityQueue
              items={cases}
              onSelectCase={(paymentId) => setSelectedCaseId(paymentId)}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryFilter}
            />
          </div>

          {/* Right Column (4 cols): Category Breakdown & Guardrails Summary */}
          <div className="lg:col-span-4 space-y-6">
            <CategoryBreakdown
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryFilter}
            />

            {/* Merchant Guardrail Status Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#ea580c]" />
                  Active Guardrail Rules
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Enforced
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-600 divide-y divide-gray-100">
                <div className="flex justify-between pt-1.5">
                  <span>Max Auto Retries:</span>
                  <span className="font-bold text-gray-900">3 Attempts</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span>Max Auto Transaction:</span>
                  <span className="font-bold text-gray-900 font-mono">₹50,000</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span>Backoff Interval:</span>
                  <span className="font-bold text-gray-900">300s Exponential</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span>AI Reasoning Authority:</span>
                  <span className="font-semibold text-emerald-700">Proposal Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Case Inspection Slide-over Drawer */}
      <CaseInspectDrawer
        paymentId={selectedCaseId}
        onClose={() => setSelectedCaseId(null)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white text-gray-400 py-6 text-xs text-center">
        <p>RecoverAI Control Center • All metrics derived from verified database ledger events.</p>
      </footer>
    </div>
  );
}