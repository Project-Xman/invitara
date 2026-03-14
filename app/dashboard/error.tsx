"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 pt-[68px] text-center">
      <div className="mb-2 text-5xl">📊</div>
      <h2 className="font-display text-2xl font-bold">Dashboard failed to load</h2>
      <p className="max-w-xs text-sm opacity-50">
        We couldn&apos;t load your dashboard data. Check your connection and try again.
      </p>
      <button onClick={reset} className="btn-gold mt-2 !px-6 !py-2.5">
        Reload Dashboard
      </button>
    </div>
  );
}
