import { useState } from "react";
import { Coins, TrendingUp, TrendingDown, Loader2, Sparkles } from "lucide-react";
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
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-8 text-center text-primary-foreground">
        <p className="mb-2 text-[10px] uppercase tracking-[3px] opacity-60">Your Balance</p>
        <p className="font-display text-6xl font-bold">{user.credits}</p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm opacity-70">
          <Coins className="h-3.5 w-3.5" /> AI Generation Credits
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
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
                    ? "border-primary bg-card shadow-gold"
                    : "border-border bg-card hover:border-primary/40"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[1px] text-primary-foreground">
                    Best Value
                  </span>
                )}
                {isLoading ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">Processing...</p>
                  </div>
                ) : (
                  <>
                    <p className="font-display text-3xl font-bold text-primary">{pkg.credits}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">credits</p>
                    <p className="mt-3 text-sm font-semibold">{'\u20B9'}{pkg.priceInr}</p>
                    <p className="text-[10px] text-muted-foreground/50">
                      {'\u20B9'}{(pkg.priceInr / pkg.credits).toFixed(0)}/credit
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
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {history.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between border-b border-border/50 px-5 py-3.5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tx.amount > 0 ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                    {tx.amount > 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm">{tx.reason}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/50">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${tx.amount > 0 ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </p>
                  <p className="text-[10px] text-muted-foreground/40">bal: {tx.balance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
