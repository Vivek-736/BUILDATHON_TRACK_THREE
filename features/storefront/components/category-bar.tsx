"use client";

import { Headphones, Watch, Monitor, Keyboard, Home, Sparkles } from "lucide-react";

const CATEGORIES = [
  { id: "All", label: "All Products", icon: Sparkles },
  { id: "Audio", label: "Audio & ANC", icon: Headphones },
  { id: "Wearables", label: "Smartwatches", icon: Watch },
  { id: "Displays", label: "Monitors", icon: Monitor },
  { id: "Accessories", label: "Accessories", icon: Keyboard },
  { id: "Smart Home", label: "Smart Home", icon: Home },
];

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryBar({
  selectedCategory,
  onSelectCategory,
}: CategoryBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-2 px-4 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 sm:gap-2.5 min-w-max">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap ${
                isSelected
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-gray-500"}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}