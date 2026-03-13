import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "serif"],
        script: ["var(--font-script)", "cursive"],
        body: ["var(--font-body)", "serif"],
        heading: ["var(--font-heading)", "serif"],
        handwritten: ["var(--font-handwritten)", "cursive"],
      },
      colors: {
        gold: {
          50: "#FFFDF5",
          100: "#FFF9E5",
          200: "#FFF0C2",
          300: "#FFE49A",
          400: "#FFD466",
          500: "#D4A853",
          600: "#C49A3D",
          700: "#A67C2E",
          800: "#7A5A1E",
          900: "#4D3812",
        },
        cream: {
          50: "#FFFEFB",
          100: "#FDF8F0",
          200: "#FAF0E0",
          300: "#F5E6CC",
          400: "#EDD9B5",
          500: "#E8D5B0",
          600: "#D4C09A",
          700: "#BFA77A",
          800: "#A08A5C",
          900: "#6B5C3E",
        },
        // shadcn/ui CSS variable mappings
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        gold: "0 4px 24px rgba(212,168,83,0.15)",
        "gold-lg": "0 12px 48px rgba(212,168,83,0.2)",
        "gold-xl": "0 24px 64px rgba(212,168,83,0.25)",
        card: "0 2px 16px rgba(0,0,0,0.04)",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "float-d": "float 8s ease-in-out infinite 3s",
        "fade-up": "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1)",
        shimmer: "shimmer 3s ease-in-out infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        wave: "wave 6s ease-in-out infinite",
        "blob-morph": "blobMorph 12s ease-in-out infinite",
        "warm-glow": "warmGlow 3s ease-in-out infinite",
        "slow-rotate": "slowRotate 60s linear infinite",
        "slide-left": "slideInLeft 0.8s cubic-bezier(0.16,1,0.3,1)",
        "slide-right": "slideInRight 0.8s cubic-bezier(0.16,1,0.3,1)",
        "scale-in": "scaleIn 0.8s cubic-bezier(0.16,1,0.3,1)",
        "float-gentle": "floatGentle 4s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(30px,-30px) scale(1.05)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGold: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
        wave: {
          "0%,100%": { transform: "translateX(0) translateY(0)" },
          "50%": { transform: "translateX(-10px) translateY(-5px)" },
        },
        blobMorph: {
          "0%,100%": { borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" },
          "25%": { borderRadius: "58% 42% 75% 25% / 76% 46% 54% 24%" },
          "50%": { borderRadius: "50% 50% 33% 67% / 55% 27% 73% 45%" },
          "75%": { borderRadius: "33% 67% 58% 42% / 63% 68% 32% 37%" },
        },
        warmGlow: {
          "0%,100%": { boxShadow: "0 0 20px rgba(212,168,83,0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(212,168,83,0.35)" },
        },
        slowRotate: { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-40px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(40px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        floatGentle: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
