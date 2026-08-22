"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Cpu, 
  ShieldCheck, 
  Wrench, 
  Clock, 
  Search, 
  RefreshCw, 
  Code
} from "lucide-react";
import type { AuditRecord } from "../services/audit-service";

export function AuditTimeline() {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actorFilter, setActorFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadAudit = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/audit");
      const data = await res.json();
      if (data.success && data.records) {
        setRecords(data.records);
      }
    } catch (err) {
      console.error("Failed to load audit records:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const filteredRecords = records.filter((r) => {
    if (actorFilter !== "all" && r.actorType !== actorFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        r.action.toLowerCase().includes(q) ||
        r.actorId.toLowerCase().includes(q) ||
        JSON.stringify(r.details).toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getActorBadge = (actorType: string) => {
    switch (actorType) {
      case "ai_agent":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-[#ea580c] border border-orange-200">
            <Cpu className="w-3 h-3" /> AI Agent
          </span>
        );
      case "policy_engine":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3 h-3" /> Policy Engine
          </span>
        );
      case "controlled_tool":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Wrench className="w-3 h-3" /> Tool Execution
          </span>
        );
      case "workflow":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3 h-3" /> Trigger.dev Workflow
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            System
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden space-y-4">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#ea580c]" />
            Immutable Audit Trail Ledger
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Cryptographically logged operations record: why AI reasoned, what policy approved, and what tools executed.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-36 sm:min-w-48">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit actions..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-7 pr-2.5 py-1 text-xs text-gray-900 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
          </div>

          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
            <button
              onClick={() => setActorFilter("all")}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition ${
                actorFilter === "all" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActorFilter("ai_agent")}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition ${
                actorFilter === "ai_agent" ? "bg-white text-[#ea580c] shadow-2xs" : "text-gray-500"
              }`}
            >
              AI Agent
            </button>
            <button
              onClick={() => setActorFilter("policy_engine")}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition ${
                actorFilter === "policy_engine" ? "bg-white text-blue-700 shadow-2xs" : "text-gray-500"
              }`}
            >
              Policy Engine
            </button>
          </div>

          <button
            onClick={loadAudit}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#ea580c]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-200 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Actor Type</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Impact (₹)</th>
              <th className="py-2.5 px-3">Details / Rationale</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  No audit events recorded yet.
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => {
                const dateStr = new Date(r.timestamp).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });

                const summaryText =
                  (r.details as { rationale?: string; reason?: string; diagnosis?: string })?.rationale ||
                  (r.details as { rationale?: string; reason?: string; diagnosis?: string })?.reason ||
                  (r.details as { rationale?: string; reason?: string; diagnosis?: string })?.diagnosis ||
                  JSON.stringify(r.details);

                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRecord(r)}
                    className="hover:bg-gray-50 transition cursor-pointer"
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-gray-500 text-[11px]">
                      {dateStr}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getActorBadge(r.actorType)}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900 text-xs">
                      {r.action}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      {r.amountImpact ? `₹${parseFloat(r.amountImpact).toLocaleString("en-IN")}` : "—"}
                    </td>

                    <td className="py-2.5 px-3 max-w-xs truncate text-[11px] text-gray-500">
                      {summaryText}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(r);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold"
                      >
                        <Code className="w-3 h-3" />
                        <span>JSON</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* JSON Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#ea580c]" />
                <h4 className="text-sm font-bold text-gray-900">Audit Event Details</h4>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-900 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Audit ID:</span>
                <span className="font-mono text-gray-900">{selectedRecord.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Action:</span>
                <span className="font-bold text-gray-900">{selectedRecord.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Actor:</span>
                <span className="font-mono text-gray-700">{selectedRecord.actorId} ({selectedRecord.actorType})</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 uppercase">Event Payload</span>
              <pre className="p-3 bg-gray-900 text-emerald-400 rounded-lg text-[11px] font-mono overflow-x-auto max-h-60">
                {JSON.stringify(selectedRecord.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}