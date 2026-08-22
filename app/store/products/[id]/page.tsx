"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, ArrowLeft, Zap, ShoppingCart, Truck, RotateCcw, Award } from "lucide-react";
import { CartProvider, useCart, CartProduct } from "@/features/storefront/context/cart-context";
import { StorefrontHeader } from "@/features/storefront/components/storefront-header";
import { CartDrawer } from "@/features/storefront/components/cart-drawer";
import { CheckoutModal } from "@/features/storefront/components/checkout-modal";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  return (
    <CartProvider>
      <ProductDetailContent productId={unwrappedParams.id} />
    </CartProvider>
  );
}

function ProductDetailContent({ productId }: { productId: string }) {
  const [product, setProduct] = useState<CartProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col">
        <StorefrontHeader />
        <div className="max-w-7xl mx-auto px-4 py-12 w-full animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col">
        <StorefrontHeader />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-xs text-gray-500 mb-6">The requested product could not be found in our catalog.</p>
          <Link href="/" className="px-5 py-2 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
  const originalPrice = Math.round(price * 1.35);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  const handleBuyNow = () => {
    addItem(product, 1);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Electronics</span>
        </Link>

        {/* Main Product Layout */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-xs">
          {/* Left: Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
              {product.imageUrl && (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  priority
                  className="object-cover"
                />
              )}
              <div className="absolute top-3 left-3 bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded shadow-xs">
                {discountPercent}% OFF
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => addItem(product, 1)}
                className="py-3 px-4 rounded-xl bg-gray-100 border border-gray-200 text-gray-800 text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3 px-4 rounded-xl bg-gray-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-xs"
              >
                <Zap className="w-4 h-4 fill-current text-[#ea580c]" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Right: Info & Purchase Details */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  {product.category || "General"}
                </span>
                <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> NovaCart Assured
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                {product.title}
              </h1>

              {/* Ratings */}
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-1 bg-emerald-700 text-white text-xs font-bold px-2 py-0.5 rounded">
                  <span>4.6</span>
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <span className="text-xs text-gray-500">1,280 Ratings & 450 Reviews</span>
              </div>

              {/* Price Details */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-gray-900">
                    ₹{price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    Save ₹{(originalPrice - price).toLocaleString("en-IN")} ({discountPercent}% off)
                  </span>
                </div>
                <p className="text-xs text-emerald-600 font-semibold">Inclusive of all taxes • Free Express Shipping</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Product Overview
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {product.description || "High performance electronic device built for premium reliability and unmatched audio-visual experience."}
                </p>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                <div className="p-3 rounded-lg bg-gray-50 text-center space-y-1 border border-gray-200">
                  <Truck className="w-5 h-5 text-gray-700 mx-auto" />
                  <span className="block text-[11px] font-bold text-gray-900">Free Express Delivery</span>
                  <span className="block text-[10px] text-gray-500">In 24-48 Hours</span>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 text-center space-y-1 border border-gray-200">
                  <RotateCcw className="w-5 h-5 text-gray-700 mx-auto" />
                  <span className="block text-[11px] font-bold text-gray-900">7 Days Replacement</span>
                  <span className="block text-[10px] text-gray-500">Hassle Free</span>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 text-center space-y-1 border border-gray-200">
                  <Award className="w-5 h-5 text-gray-700 mx-auto" />
                  <span className="block text-[11px] font-bold text-gray-900">1 Year Warranty</span>
                  <span className="block text-[10px] text-gray-500">Brand Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}