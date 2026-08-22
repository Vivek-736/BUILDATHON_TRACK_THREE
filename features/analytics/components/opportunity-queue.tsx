"use client";

import { useState } from "react";
import { 
  Search, 
  ExternalLink, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Clock 
} from "lucide-react";
import type { OpportunityItem } from "../services/intelligence-service";

interface OpportunityQueueProps {
  items: OpportunityItem[];
  onSelectCase: (paymentId: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export function OpportunityQueue({
  items,
  onSelectCase,
  selectedCategory,
  onSelectCategory,
}: OpportunityQueueProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const filteredItems = items.filter((item) => {
    // Tier filter
    if (tierFilter !== "all" && item.probabilityTier !== tierFilter) {
      return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.orderId.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.customerEmail.toLowerCase().includes(q) ||
        item.failureCategory.toLowerCase().includes(q) ||
        item.itemsSummary.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden space-y-3">
      {/* Header & Controls Strip */}
      <div className="p-3.5 sm:p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50/50">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ea580c]" />
            Revenue Opportunity Queue
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Active revenue-at-risk pipeline prioritized by algorithmic recovery probability
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-36 sm:min-w-44">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter cases..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-7 pr-2.5 py-1 text-xs text-gray-900 focus:outline-none transition"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
          </div>

          {/* Probability Tier Filter */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
            <button
              onClick={() => setTierFilter("all")}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition ${
                tierFilter === "all" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTierFilter("high")}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition ${
                tierFilter === "high" ? "bg-white text-emerald-700 shadow-2xs" : "text-gray-500 hover:text-emerald-700"
              }`}
            >
              High ≥75%
            </button>
            <button
              onClick={() => setTierFilter("medium")}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition ${
                tierFilter === "medium" ? "bg-white text-amber-700 shadow-2xs" : "text-gray-500 hover:text-amber-700"
              }`}
            >
              Medium
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Table fitted cleanly without horizontal scroll */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-200 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Case</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Failure Reason</th>
              <th className="py-2.5 px-2 text-center">Prob</th>
              <th className="py-2.5 px-2 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <AlertCircle className="w-5 h-5 text-gray-300" />
                    <span className="text-xs font-medium text-gray-500">No matching cases</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const dateFormatted = new Date(item.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectCase(item.id)}
                    className="hover:bg-gray-50/80 transition cursor-pointer group"
                  >
                    {/* Case / Order Reference */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-gray-900 font-mono block text-xs">
                        #{item.orderId.slice(-7)}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        {dateFormatted}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-2.5 px-3 max-w-[130px]">
                      <span className="font-semibold text-gray-900 block truncate">
                        {item.customerName}
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate">
                        {item.customerEmail}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900 whitespace-nowrap">
                      ₹{item.amountAtRisk.toLocaleString("en-IN")}
                    </td>

                    {/* Failure Category */}
                    <td className="py-2.5 px-3 max-w-[140px]">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 capitalize truncate max-w-full">
                        {item.failureCategory.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Recovery Probability */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.probabilityTier === "high"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.probabilityTier === "medium"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        <Sparkles className="w-2.5 h-2.5 fill-current" />
                        {item.recoveryProbability}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      {item.status === "recovered" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Recovered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                          <Clock className="w-3 h-3" /> Detected
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(item.id);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-900 hover:bg-black text-white text-[11px] font-semibold transition shadow-2xs group-hover:scale-102"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}