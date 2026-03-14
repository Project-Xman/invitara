import type { Metadata } from "next";
import { Suspense } from "react";
import { EditorInner } from "./EditorInner";

export const metadata: Metadata = {
  title: "Invitation Editor — Invitara",
  description:
    "Create and customise your wedding invitation with AI-powered design tools.",
};

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center pt-[68px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
        </div>
      }
    >
      <EditorInner />
    </Suspense>
  );
}
