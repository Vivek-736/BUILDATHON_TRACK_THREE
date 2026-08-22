"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  AlertOctagon, 
  ArrowLeft, 
  RefreshCw, 
  LayoutDashboard, 
  Sparkles 
} from "lucide-react";
import { StorefrontHeader } from "@/features/storefront/components/storefront-header";
import { CartProvider } from "@/features/storefront/context/cart-context";

interface OrderDetail {
  id: string;
  totalAmount: string;
  currency: string;
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    productTitle: string;
    unitPrice: string;
    quantity: number;
    totalPrice: string;
  }>;
  payment?: {
    id: string;
    status: string;
    errorCode?: string;
    errorDescription?: string;
    failureCategory?: string;
    isAtRisk: boolean;
  };
}

export default function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const unwrappedParams = use(params);
  return (
    <CartProvider>
      <OrderStatusContent orderId={unwrappedParams.orderId} />
    </CartProvider>
  );
}

function OrderStatusContent({ orderId }: { orderId: string }) {
  const searchParams = useSearchParams();
  const queryStatus = searchParams.get("status");
  const queryReason = searchParams.get("reason");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Failed to load order details:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  const isSuccess = queryStatus === "success" || order?.status === "completed";

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        {isLoading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-4 animate-pulse">
            <div className="w-14 h-14 bg-gray-100 rounded-full mx-auto" />
            <div className="h-6 w-48 bg-gray-100 rounded mx-auto" />
            <div className="h-4 w-72 bg-gray-100 rounded mx-auto" />
          </div>
        ) : isSuccess ? (
          /* SUCCESS STATE */
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Payment Verified & Captured
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Thank You for Your Order!
              </h1>
              <p className="text-xs text-gray-500">
                Order Reference: <span className="font-mono text-gray-900 font-bold">#{orderId}</span>
              </p>
            </div>

            {/* Order Items Receipt Card */}
            {order?.items && order.items.length > 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-left space-y-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Order Summary
                </h3>
                <div className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex justify-between text-xs">
                      <div>
                        <span className="font-semibold text-gray-900">{item.productTitle}</span>
                        <span className="block text-[11px] text-gray-500">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        ₹{parseFloat(item.totalPrice).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between text-sm font-extrabold text-gray-900">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-600">
                    ₹{parseFloat(order.totalAmount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        ) : (
          /* FAILED / AT-RISK STATE */
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
                <AlertOctagon className="w-10 h-10" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                Transaction Declined • Revenue At Risk
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Payment Was Not Completed
              </h1>

              <p className="text-xs text-gray-600 max-w-md mx-auto">
                {queryReason || order?.payment?.errorDescription || "Your financial institution declined the transaction."}
              </p>
            </div>

            {/* Live RecoverAI Intelligence Alert Banner */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#ea580c] font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>RecoverAI Autonomous Protection Active</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                This transaction has been logged as <strong>Revenue at Risk</strong> (₹{order ? parseFloat(order.totalAmount).toLocaleString("en-IN") : "—"}).
                Failure category: <code className="px-1.5 py-0.5 rounded bg-white border border-orange-200 text-[#ea580c] font-mono text-[11px]">{order?.payment?.failureCategory || "insufficient_funds"}</code>.
                The merchant policy engine is diagnosing and preparing an authorized recovery workflow.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry on Storefront</span>
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#ea580c]" />
                <span>View in Merchant Console</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}