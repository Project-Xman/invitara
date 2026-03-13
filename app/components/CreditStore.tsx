import { Link } from "@tanstack/react-router";
import type { SafeUser } from "~/lib/auth";

interface CreditPackage {
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

export function CreditStore({ user, packages, history }: {
  user: SafeUser;
  packages: CreditPackage[];
  history: CreditTx[];
}) {
  return (
    <div className="space-y-8">
      {/* Balance */}
      <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-gold-700 to-gold-900 text-white">
        <p className="text-[10px] tracking-[3px] uppercase opacity-50 mb-2">Your Balance</p>
        <p className="font-display text-6xl font-bold">{user.credits}</p>
        <p className="text-sm opacity-60 mt-1">AI Generation Credits</p>
      </div>

      {/* Packages */}
      <div>
        <h3 className="font-display text-xl font-bold mb-4">Buy Credits</h3>
        <div className="grid grid-cols-2 gap-3">
          {packages.map((pkg) => (
            <button
              key={pkg.name}
              className={`p-5 rounded-2xl text-center transition-all border relative ${
                pkg.popular
                  ? "bg-white border-gold-500 shadow-gold"
                  : "bg-cream-50/60 border-gold-200/15 hover:border-gold-400/40"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gold-700 text-white rounded-full text-[9px] font-semibold tracking-[1px] uppercase">
                  Best Value
                </span>
              )}
              <p className="font-display text-3xl font-bold text-gold-700">{pkg.credits}</p>
              <p className="text-xs opacity-40 mt-0.5">credits</p>
              <p className="font-semibold text-sm mt-3">₹{pkg.priceInr}</p>
              <p className="text-[10px] opacity-30">₹{(pkg.priceInr / pkg.credits).toFixed(0)}/credit</p>
            </button>
          ))}
        </div>
      </div>

      {/* Credit History */}
      {history.length > 0 && (
        <div>
          <h3 className="font-display text-xl font-bold mb-4">Transaction History</h3>
          <div className="bg-white rounded-2xl border border-gold-200/15 overflow-hidden">
            {history.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 border-b border-gold-200/8 last:border-0">
                <div>
                  <p className="text-sm">{tx.reason}</p>
                  <p className="text-[11px] opacity-30 mt-0.5">
                    {new Date(tx.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${tx.amount > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount}
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
