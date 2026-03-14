"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="mb-2 text-6xl">⚠️</div>
      <h1 className="font-display text-3xl font-bold">Something went wrong</h1>
      <p className="max-w-sm text-sm opacity-50">
        An unexpected error occurred. Please try again or return home.
      </p>
      {error.digest && (
        <p className="font-mono text-[10px] opacity-30">Error ID: {error.digest}</p>
      )}
      <div className="mt-2 flex gap-3">
        <button onClick={reset} className="btn-gold !px-5 !py-2">
          Try Again
        </button>
        <Link href="/dashboard" className="btn-outline !px-5 !py-2">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
