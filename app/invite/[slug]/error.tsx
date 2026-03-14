"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function InviteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[InviteError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="mb-2 text-6xl">💌</div>
      <h1 className="font-display text-3xl font-bold">Invitation Unavailable</h1>
      <p className="max-w-sm text-sm opacity-50">
        This invitation couldn&apos;t be loaded. It may have been removed or the link is incorrect.
      </p>
      <div className="mt-2 flex gap-3">
        <button onClick={reset} className="btn-gold !px-5 !py-2">
          Try Again
        </button>
        <Link href="/" className="btn-outline !px-5 !py-2">
          Go Home
        </Link>
      </div>
    </div>
  );
}
