"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Lock, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { useCart } from "../context/cart-context";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [customer, setCustomer] = useState({
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    address: "Flat 402, Lotus Residency, Indiranagar, Bengaluru, KA 560038",
  });

  const [simulationMode, setSimulationMode] = useState<
    | "normal"
    | "insufficient_funds"
    | "bank_technical_error"
    | "network_timeout"
    | "user_dropped"
    | "authentication_failed"
  >("normal");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || items.length === 0) return null;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Create internal & Razorpay order
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          },
        }),
      });

      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const { orderId, razorpayOrderId, amount, currency, keyId } = orderData;

      // 2. Handle Simulation Mode if selected
      if (simulationMode !== "normal") {
        const verifyRes = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            razorpayOrderId,
            isSimulatedFailure: true,
            failureCategory: simulationMode,
            errorCode: `SIMULATED_${simulationMode.toUpperCase()}`,
            errorDescription: `Simulated transaction decline: ${simulationMode.replace(/_/g, " ")}`,
          }),
        });

        const verifyData = await verifyRes.json();
        clearCart();
        onClose();
        router.push(`/store/order-status/${orderId}?status=failed&reason=${encodeURIComponent(verifyData.message || simulationMode)}`);
        return;
      }

      // 3. Genuine Razorpay Test Mode Checkout
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Check your internet connection.");
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: "NovaCart Store",
        description: `Order #${orderId.slice(-6)}`,
        image: "/favicon.svg",
        order_id: razorpayOrderId,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        theme: {
          color: "#ea580c",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            clearCart();
            onClose();

            if (verifyData.success) {
              router.push(`/store/order-status/${orderId}?status=success`);
            } else {
              router.push(`/store/order-status/${orderId}?status=failed&reason=${encodeURIComponent(verifyData.error || "Payment verification failed")}`);
            }
          } catch (err) {
            console.error("Verification callback error:", err);
            router.push(`/store/order-status/${orderId}?status=failed&reason=Verification%20Error`);
          }
        },
        modal: {
          ondismiss: async function () {
            setIsLoading(false);
            await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                isSimulatedFailure: true,
                failureCategory: "user_dropped",
                errorCode: "USER_DROPPED_CHECKOUT",
                errorDescription: "Customer dismissed checkout modal before payment authorization",
              }),
            });
            clearCart();
            onClose();
            router.push(`/store/order-status/${orderId}?status=failed&reason=Checkout%20Dismissed`);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      console.error("Checkout submission failed:", err);
      setErrorMessage(err instanceof Error ? err.message : "Checkout failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl text-gray-900 shadow-2xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#ea580c]" />
            <h2 className="text-base font-bold text-gray-900">Secure Express Checkout</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePay} className="p-4 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              1. Delivery & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Shipping Address
              </label>
              <input
                type="text"
                required
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Diagnostic Failure Simulation Selector */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ea580c]" />
                Payment Mode & Recovery Test Scenarios
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Test Mode</span>
            </div>

            <p className="text-[11px] text-gray-600">
              Select standard checkout or simulate specific payment declines to test RecoverAI revenue protection:
            </p>

            <select
              value={simulationMode}
              onChange={(e) => setSimulationMode(e.target.value as typeof simulationMode)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
            >
              <option value="normal">✅ Real Razorpay Test Mode Checkout (UPI / Cards / Netbanking)</option>
              <option value="insufficient_funds">❌ Simulate: Insufficient Funds (Auto-Recoverable)</option>
              <option value="bank_technical_error">❌ Simulate: Bank Technical Server Error (Timeout Retry)</option>
              <option value="network_timeout">❌ Simulate: Network Timeout</option>
              <option value="user_dropped">⚠️ Simulate: Customer Abandoned Checkout Modal</option>
              <option value="authentication_failed">❌ Simulate: 3D Secure / OTP Authentication Failed</option>
            </select>
          </div>

          {/* Price Summary */}
          <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-sm">
            <span className="text-xs text-gray-600">Total Payable Amount:</span>
            <span className="text-lg font-extrabold text-gray-900">
              ₹{subtotal.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white font-bold text-sm transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Processing Order...</span>
            ) : simulationMode === "normal" ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#ea580c]" />
                <span>Pay ₹{subtotal.toLocaleString("en-IN")} via Razorpay</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-[#ea580c]" />
                <span>Simulate Failure & Trigger Recovery Pipeline</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}