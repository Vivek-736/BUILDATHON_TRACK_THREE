"use client";

import { useState } from "react";
import Image from "next/image";
import { Store, RefreshCw, RotateCcw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

interface DashboardHeaderProps {
  merchantName?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onDemoReset?: () => void;
}

export function DashboardHeader({
  merchantName = "NovaCart India",
  onRefresh,
  isRefreshing = false,
  onDemoReset,
}: DashboardHeaderProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleResetClick = async () => {
    if (confirm("Reset demo dataset back to initial test conditions?")) {
      try {
        setIsResetting(true);
        const res = await fetch("/api/demo/reset", { method: "POST" });
        const data = await res.json();
        if (data.success && onDemoReset) {
          onDemoReset();
        }
      } catch (err) {
        console.error("Reset failed:", err);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center transition-transform group-hover:scale-105">
              <Image
                src="/favicon.svg"
                alt="RecoverAI Logo"
                width={24}
                height={24}
                priority
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-gray-900 leading-tight">
                Recover<span className="text-[#ea580c]">AI</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                Revenue Intelligence Engine
              </span>
            </div>
          </Link>

          <span className="h-4 w-px bg-gray-200 hidden sm:block" />

          {/* Active Store Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-xs text-gray-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-gray-900">{merchantName}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1-Click Demo Reset */}
          <button
            onClick={handleResetClick}
            disabled={isResetting}
            title="Reset demo dataset to initial baseline"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-red-700 hover:bg-red-50 border border-gray-200 transition disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-red-600" : ""}`} />
            <span className="hidden lg:inline">Reset Demo</span>
          </button>

          {/* Refresh Action */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#ea580c]" : ""}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
          )}

          {/* Storefront shortcut */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 transition"
          >
            <Store className="w-3.5 h-3.5 text-[#ea580c]" />
            <span className="hidden sm:inline">Storefront</span>
          </Link>

          {/* Clerk Profile */}
          <div className="flex items-center pl-1 border-l border-gray-200">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full border border-gray-200",
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}