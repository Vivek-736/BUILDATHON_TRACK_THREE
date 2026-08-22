"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingCart, ShieldCheck, LayoutDashboard } from "lucide-react";
import { useCart } from "../context/cart-context";

interface StorefrontHeaderProps {
  onSearch?: (query: string) => void;
}

export function StorefrontHeader({ onSearch }: StorefrontHeaderProps) {
  const { totalItems, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 text-gray-900 shadow-xs">

      {/* Main Flipkart-style bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative w-9 h-9 p-1 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/favicon.svg"
              alt="NovaCart Logo"
              width={26}
              height={26}
              priority
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-xl tracking-tight text-gray-900">
                Nova<span className="text-[#ea580c]">Cart</span>
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium tracking-wide flex items-center gap-0.5">
              Explore <span className="text-[#ea580c] font-semibold">Plus</span>
              <ShieldCheck className="w-2.5 h-2.5 text-blue-500 inline" />
            </span>
          </div>
        </Link>

        {/* Flipkart style Search Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-2xl relative hidden md:block"
        >
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              placeholder="Search for electronics, earbuds, smartwatches, monitors..."
              className="w-full bg-gray-50 text-sm text-gray-900 rounded-md pl-10 pr-4 py-2 border border-gray-200 focus:outline-none transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
          </div>
        </form>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Link to Merchant Control Plane */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#ea580c]" />
            <span className="hidden sm:inline">Merchant Console</span>
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-gray-900 text-white font-medium text-sm hover:bg-black transition shadow-xs"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Cart</span>
            {totalItems > 0 && (
              <span className="bg-[#ea580c] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-4.5 h-4.5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}