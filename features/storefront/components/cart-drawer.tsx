"use client";

import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "../context/cart-context";

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export function CartDrawer({ onProceedToCheckout }: CartDrawerProps) {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    subtotal,
    totalItems,
  } = useCart();

  if (!isCartOpen) return null;

  const deliveryCharge = 0;
  const totalPayable = subtotal + deliveryCharge;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-2xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-gray-200 text-gray-900 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#ea580c]" />
              <h2 className="text-base font-bold text-gray-900">Your Shopping Cart</h2>
              <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Your cart is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mb-6">
                  Explore our curated electronic catalog and add top-rated products to your cart.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const price =
                  typeof item.product.price === "string"
                    ? parseFloat(item.product.price)
                    : item.product.price;
                const itemTotal = price * item.quantity;

                return (
                  <div key={item.product.id} className="pt-3 flex gap-3">
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden shrink-0">
                      {item.product.imageUrl && (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">
                          {item.product.title}
                        </h4>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            ₹{price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[11px] text-emerald-600 font-semibold">
                            In Stock
                          </span>
                        </div>
                      </div>

                      {/* Quantity Modifier & Remove */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-gray-500 hover:text-gray-900 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-900 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-900">
                            ₹{itemTotal.toLocaleString("en-IN")}
                          </span>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-gray-400 hover:text-red-600 transition p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Price Summary & Checkout Button */}
          {items.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
              {/* Price Details */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-[#ea580c]">₹{totalPayable.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-1 text-[11px] text-gray-600 py-1 bg-white rounded border border-gray-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>100% Safe & Secure Checkout via Razorpay</span>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-gray-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-xs"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#ea580c]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}