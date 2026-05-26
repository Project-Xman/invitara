import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { GrainOverlay } from "./components/marketing/GrainOverlay";
import { Inter, Fraunces, Great_Vibes } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Invitara — Love, in motion.",
  description:
    "Cinematic wedding invitation websites. AI-powered, beautifully crafted, instantly shareable.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        "dark font-sans",
        inter.variable,
        fraunces.variable,
        greatVibes.variable
      )}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-background font-sans text-foreground antialiased min-h-screen selection:bg-primary/20">
        <Providers>
          <GrainOverlay />
          <Navigation />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
