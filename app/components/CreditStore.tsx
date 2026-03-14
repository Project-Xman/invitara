import { useState } from "react";
import type { SafeUser } from "~/lib/auth";
import { useCreateOrder, useBuyCredits } from "~/lib/queries";
import { openRazorpayCheckout } from "~/lib/razorpay";

interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  priceInr: number;
  popular: boolean;
}

interface CreditTx {
  id: number;
  amount: number;
  balance: number;
  reason: string;
  createdAt: Date;
}

export function CreditStore({
  user,
  packages,
  history,
}: {
  user: SafeUser;
  packages: CreditPackage[];
  history: CreditTx[];
}) {
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const createOrder = useCreateOrder();
  const buyCredits = useBuyCredits();

  const handleBuy = async (pkg: CreditPackage) => {
    setError(null);
    setBuyingId(pkg.id);
    try {
      const order = await createOrder.mutateAsync({
        type: "credits",
        packageId: pkg.id,
      });

      const result = await openRazorpayCheckout({
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        description: `${pkg.credits} AI Credits`,
        keyId: order.keyId,
        prefill: { name: user.name, email: user.email },
      });

      await buyCredits.mutateAsync({
        packageId: pkg.id,
        razorpayPaymentId: result.razorpay_payment_id,
        razorpayOrderId: result.razorpay_order_id,
        razorpaySignature: result.razorpay_signature,
      });
    } catch (err: any) {
      if (err?.message !== "Payment cancelled") {
        setError(err?.message ?? "Payment failed. Please try again.");
      }
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Balance */}
      <div className="rounded-2xl bg-gradient-to-br from-gold-700 to-gold-900 p-8 text-center text-white">
        <p className="mb-2 text-[10px] uppercase tracking-[3px] opacity-50">Your Balance</p>
        <p className="font-display text-6xl font-bold">{user.credits}</p>
        <p className="mt-1 text-sm opacity-60">AI Generation Credits</p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200/40 bg-red-50 p-4 text-sm text-red-600">
          {error}
          <button onClick={() => setError(null)} className="ml-3 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Packages */}
      <div>
        <h3 className="mb-4 font-display text-xl font-bold">Buy Credits</h3>
        <div className="grid grid-cols-2 gap-3">
          {packages.map((pkg) => {
            const isLoading = buyingId === pkg.id;
            return (
              <button
                key={pkg.id}
                onClick={() => handleBuy(pkg)}
                disabled={isLoading || buyingId !== null}
                className={`relative rounded-2xl border p-5 text-center transition-all ${
                  pkg.popular
                    ? "border-gold-500 bg-white shadow-gold"
                    : "border-gold-200/15 bg-cream-50/60 hover:border-gold-400/40"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gold-700 px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[1px] text-white">
                    Best Value
                  </span>
                )}
                {isLoading ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
                    <p className="text-xs opacity-50">Processing…</p>
                  </div>
                ) : (
                  <>
                    <p className="font-display text-3xl font-bold text-gold-700">{pkg.credits}</p>
                    <p className="mt-0.5 text-xs opacity-40">credits</p>
                    <p className="mt-3 text-sm font-semibold">₹{pkg.priceInr}</p>
                    <p className="text-[10px] opacity-30">
                      ₹{(pkg.priceInr / pkg.credits).toFixed(0)}/credit
                    </p>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Credit History */}
      {history.length > 0 && (
        <div>
          <h3 className="mb-4 font-display text-xl font-bold">Transaction History</h3>
          <div className="overflow-hidden rounded-2xl border border-gold-200/15 bg-white">
            {history.map((tx) => (
              <div
                key={tx.id}
                className="border-gold-200/8 flex items-center justify-between border-b px-5 py-3.5 last:border-0"
              >
                <div>
                  <p className="text-sm">{tx.reason}</p>
                  <p className="mt-0.5 text-[11px] opacity-30">
                    {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${tx.amount > 0 ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </p>
                  <p className="text-[10px] opacity-25">bal: {tx.balance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
