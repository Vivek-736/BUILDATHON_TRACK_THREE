"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Zap, ShoppingCart, ShieldCheck } from "lucide-react";
import { useCart, CartProduct } from "../context/cart-context";

interface ProductCardProps {
  product: CartProduct & {
    inventoryCount?: number;
    rating?: number;
    reviewsCount?: number;
  };
  onBuyNow?: (product: CartProduct) => void;
}

export function ProductCard({ product, onBuyNow }: ProductCardProps) {
  const { addItem } = useCart();
  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
  const originalPrice = Math.round(price * 1.35);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  const rating = product.rating || (4.2 + (price % 5) * 0.15).toFixed(1);
  const reviewsCount = product.reviewsCount || Math.floor((price * 3) % 800) + 120;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    if (onBuyNow) {
      onBuyNow(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-gray-300 transition-all duration-200">
      {/* Product Image Container */}
      <Link href={`/store/products/${product.id}`} className="block relative aspect-4/3 bg-gray-50 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
            No image available
          </div>
        )}

        {/* Discount Badge */}
        <div className="absolute top-2.5 left-2.5 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
          {discountPercent}% OFF
        </div>

        {/* Category Pill */}
        {product.category && (
          <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded border border-gray-200">
            {product.category}
          </div>
        )}
      </Link>

      {/* Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <Link href={`/store/products/${product.id}`}>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-[#ea580c] transition min-h-10">
              {product.title}
            </h3>
          </Link>

          {/* Rating Pill & Reviews */}
          <div className="flex items-center gap-2 mt-2">
            <div className="inline-flex items-center gap-1 bg-emerald-700 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
              <span>{rating}</span>
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-xs text-gray-400">({reviewsCount.toLocaleString()})</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-600 font-medium">
              <ShieldCheck className="w-3 h-3 text-blue-500" /> Assured
            </span>
          </div>

          {/* Price Block */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">
              ₹{price.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-gray-400 line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              Save ₹{(originalPrice - price).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Free Delivery Tag */}
          <p className="text-[11px] text-gray-500 mt-1">
            Free Delivery • Dispatches Today
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>

          <button
            onClick={handleBuyNow}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-gray-900 hover:bg-black text-xs font-bold text-white transition shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-[#ea580c]" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}