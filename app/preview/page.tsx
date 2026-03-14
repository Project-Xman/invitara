import type { Metadata } from "next";
import { Suspense } from "react";
import { PreviewInner } from "./PreviewInner";

export const metadata: Metadata = {
  title: "Preview Invitation — Invitara",
  description: "Preview your wedding invitation before sharing it with guests.",
};

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center pt-[68px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
        </div>
      }
    >
      <PreviewInner />
    </Suspense>
  );
}
