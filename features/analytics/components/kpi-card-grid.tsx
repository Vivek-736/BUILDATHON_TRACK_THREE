"use client";

import { AlertOctagon, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";
import type { DashboardStats } from "../services/intelligence-service";

interface KpiCardGridProps {
  stats: DashboardStats;
}

export function KpiCardGrid({ stats }: KpiCardGridProps) {
  const recoverablePercentage =
    stats.revenueAtRisk > 0
      ? Math.min(100, Math.round((stats.recoverableRevenue / stats.revenueAtRisk) * 100))
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Revenue at Risk */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Revenue at Risk
          </span>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            ₹{stats.revenueAtRisk.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <span className="font-semibold text-red-600">{stats.totalLossCases} cases</span>
            <span>detected across gateway</span>
          </p>
        </div>

        <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400">
          Unrecovered transaction declines
        </div>
      </div>

      {/* 2. Recoverable Revenue */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recoverable Revenue
          </span>
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ea580c] border border-orange-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#ea580c] tracking-tight">
            ₹{stats.recoverableRevenue.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <span className="font-semibold text-gray-900">{recoverablePercentage}%</span>
            <span>of at-risk pool recoverable</span>
          </p>
        </div>

        <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400">
          {stats.recoverableCases} high-probability opportunities
        </div>
      </div>

      {/* 3. Revenue Recovered */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Revenue Recovered
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
            ₹{stats.revenueRecovered.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <span className="font-semibold text-emerald-700">{stats.recoveredCases} orders</span>
            <span>successfully captured</span>
          </p>
        </div>

        <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400">
          Direct recovered merchant earnings
        </div>
      </div>

      {/* 4. Recovery Efficiency Rate */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recovery Rate
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {stats.recoveryRatePercent}%
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <span className="font-semibold text-blue-600">Active</span>
            <span>pipeline protection</span>
          </p>
        </div>

        <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400">
          Calculated from recorded events
        </div>
      </div>
    </div>
  );
}