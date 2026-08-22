"use client";

import Image from "next/image";
import { Store, RefreshCw } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

interface DashboardHeaderProps {
  merchantName?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  merchantName = "NovaCart India",
  onRefresh,
  isRefreshing = false,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Active Merchant Console */}
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

          {/* Merchant Store Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-xs text-gray-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-gray-900">{merchantName}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Refresh Action */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#ea580c]" : ""}`} />
              <span className="hidden md:inline">Refresh Data</span>
            </button>
          )}

          {/* Back to NovaCart Storefront link */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 transition"
          >
            <Store className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>Storefront View</span>
          </Link>

          {/* Clerk Auth Profile */}
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