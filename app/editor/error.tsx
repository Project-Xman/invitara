"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function EditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[EditorError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 pt-[68px] text-center">
      <div className="mb-2 text-5xl">✏️</div>
      <h2 className="font-display text-2xl font-bold">Editor crashed</h2>
      <p className="max-w-xs text-sm opacity-50">
        The editor encountered an error. Your saved work is safe — try reloading.
      </p>
      <div className="mt-2 flex gap-3">
        <button onClick={reset} className="btn-gold !px-5 !py-2">
          Reload Editor
        </button>
        <Link href="/dashboard" className="btn-outline !px-5 !py-2">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
