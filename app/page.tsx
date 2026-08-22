"use client";

import { useState, useEffect } from "react";
import { CartProvider } from "@/features/storefront/context/cart-context";
import { StorefrontHeader } from "@/features/storefront/components/storefront-header";
import { CategoryBar } from "@/features/storefront/components/category-bar";
import { ProductCard } from "@/features/storefront/components/product-card";
import { CartDrawer } from "@/features/storefront/components/cart-drawer";
import { CheckoutModal } from "@/features/storefront/components/checkout-modal";
import { CartProduct } from "@/features/storefront/context/cart-context";
import { 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  TrendingUp, 
  RefreshCw, 
  LayoutDashboard
} from "lucide-react";

export default function StorefrontHomePage() {
  return (
    <CartProvider>
      <StorefrontContent />
    </CartProvider>
  );
}

function StorefrontContent() {
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<CartProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success && data.products) {
          setProducts(data.products);
          setFilteredProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    let result = products;

    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, products]);

  const handleBuyNow = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col">
      {/* Flipkart-Style Storefront Header */}
      <StorefrontHeader onSearch={setSearchQuery} />

      {/* Categories Bar */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Promotional Hero Banner with Big Dashboard Icon */}
        <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-200 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#ea580c] text-xs font-bold">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>SUPER SAVINGS FESTIVAL • UP TO 40% OFF</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Premium Electronics with <br />
                <span className="text-[#ea580c]">Instant Recovery Assurance</span>
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl">
                Experience seamless checkout backed by RecoverAI revenue protection. Complete real test payments or simulate issuer declines to watch automated recovery in action.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#ea580c]" />
                  Genuine Razorpay Standard Checkout
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  Live Revenue-at-Risk Pipeline
                </span>
              </div>
            </div>

            {/* Right Column: Big Dashboard Icon */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gray-50 border border-gray-200 flex items-center justify-center shadow-xs group hover:border-gray-300 transition-all duration-300">
                <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
                  <LayoutDashboard className="w-20 h-20 sm:w-24 sm:h-24 text-gray-800 stroke-[1.25] group-hover:scale-105 transition-transform duration-300" />
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Merchant Console</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#ea580c]" />
              Featured Deals in {selectedCategory === "All" ? "All Categories" : selectedCategory}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {filteredProducts.length} items • 100% verified authentic merchant inventory
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="text-xs text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reset Filters
          </button>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-80 bg-white rounded-xl border border-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center my-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">No products found</h3>
            <p className="text-xs text-gray-500">
              Try searching with different keywords or clearing your category filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer Component */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white text-gray-500 py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-gray-900">NovaCart</span>
            <span>• Powered by RecoverAI Revenue Engine</span>
          </div>
          
          <p>© 2026 NovaCart India. All rights reserved. Razorpay Test Mode Demo.</p>
        </div>
      </footer>
    </div>
  );
}