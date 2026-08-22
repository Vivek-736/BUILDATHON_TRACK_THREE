"use client";

import { PieChart, Zap } from "lucide-react";
import type { CategoryStat } from "../services/intelligence-service";

interface CategoryBreakdownProps {
  categories: CategoryStat[];
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
}

export function CategoryBreakdown({
  categories,
  onSelectCategory,
  selectedCategory = "all",
}: CategoryBreakdownProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Failure Classification Distribution</h3>
        <p className="text-xs text-gray-400">No payment failures recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#ea580c]" />
            Revenue Loss by Failure Category
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Calibrated recovery likelihood and loss volume distribution
          </p>
        </div>

        {selectedCategory !== "all" && onSelectCategory && (
          <button
            onClick={() => onSelectCategory("all")}
            className="text-xs text-[#ea580c] font-semibold hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="space-y-3 pt-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.category;
          return (
            <div
              key={cat.category}
              onClick={() => onSelectCategory && onSelectCategory(isSelected ? "all" : cat.category)}
              className={`p-3 rounded-lg border transition cursor-pointer ${
                isSelected
                  ? "bg-orange-50/50 border-orange-300 ring-1 ring-orange-300"
                  : "bg-gray-50/70 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-900">{cat.label}</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-gray-900">
                    ₹{cat.amount.toLocaleString("en-IN")}
                  </span>
                  <span className="text-gray-400 text-[11px]">({cat.count} cases)</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#ea580c] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, cat.percentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1.5">
                <span>{cat.percentage}% of total losses</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <Zap className="w-3 h-3 fill-current" />
                  ~{cat.averageProbability}% Recoverability
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}