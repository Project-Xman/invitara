import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "./components/Navigation";
import {
  Inter,
  Playfair_Display,
  Cormorant_Garamond,
  Great_Vibes,
  Cinzel,
  Dancing_Script,
} from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["400"],
});
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-handwritten",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Invitara — Golden Wedding Invitations",
  description:
    "Beautiful, AI-powered wedding invitation websites. Pick a style, add your story, share in minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        "font-sans",
        inter.variable,
        playfair.variable,
        cormorant.variable,
        greatVibes.variable,
        cinzel.variable,
        dancingScript.variable
      )}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-cream-100 font-sans text-cream-900 antialiased">
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
