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
        body: ["var(--font-display)", "serif"],
        heading: ["var(--font-display)", "serif"],
        handwritten: ["var(--font-script)", "cursive"],
      },
      colors: {
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(var(--popover) / <alpha-value>)",
          foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "oklch(var(--card) / <alpha-value>)",
          foreground: "oklch(var(--card-foreground) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar) / <alpha-value>)",
          foreground: "oklch(var(--sidebar-foreground) / <alpha-value>)",
          primary: "oklch(var(--sidebar-primary) / <alpha-value>)",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent: "oklch(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "oklch(var(--sidebar-border) / <alpha-value>)",
          ring: "oklch(var(--sidebar-ring) / <alpha-value>)",
        },
        chart: {
          "1": "oklch(var(--chart-1) / <alpha-value>)",
          "2": "oklch(var(--chart-2) / <alpha-value>)",
          "3": "oklch(var(--chart-3) / <alpha-value>)",
          "4": "oklch(var(--chart-4) / <alpha-value>)",
          "5": "oklch(var(--chart-5) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "elevation-1": "0 1px 2px 0 oklch(0 0 0 / 0.20)",
        "elevation-2":
          "0 4px 12px -2px oklch(0 0 0 / 0.30), 0 2px 4px -2px oklch(0 0 0 / 0.20)",
        "elevation-3":
          "0 16px 40px -8px oklch(0 0 0 / 0.40), 0 8px 16px -4px oklch(0 0 0 / 0.25)",
        "elevation-4":
          "0 32px 80px -16px oklch(0 0 0 / 0.55), 0 16px 32px -8px oklch(0 0 0 / 0.35)",
        "glow-champagne":
          "0 0 0 1px oklch(0.84 0.10 88 / 0.35), 0 8px 32px -4px oklch(0.84 0.10 88 / 0.25)",
        "glow-champagne-lg":
          "0 0 0 1px oklch(0.84 0.10 88 / 0.50), 0 12px 48px -8px oklch(0.84 0.10 88 / 0.40)",
        gold: "0 4px 24px oklch(0.84 0.10 88 / 0.15)",
        "gold-lg": "0 12px 48px oklch(0.84 0.10 88 / 0.20)",
        "gold-xl": "0 24px 64px oklch(0.84 0.10 88 / 0.25)",
        card: "0 2px 16px oklch(0 0 0 / 4%)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "in-out-cubic": "cubic-bezier(0.65, 0, 0.35, 1)",
        spotlight: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "float-d": "float 8s ease-in-out infinite 3s",
        "fade-up": "fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        shimmer: "shimmer 3s ease-in-out infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        wave: "wave 6s ease-in-out infinite",
        "blob-morph": "blobMorph 12s ease-in-out infinite",
        "warm-glow": "warmGlow 3s ease-in-out infinite",
        "slow-rotate": "slowRotate 60s linear infinite",
        "slide-left": "slideInLeft 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-right": "slideInRight 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        "scale-in": "scaleIn 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
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
          "0%,100%": { boxShadow: "0 0 20px oklch(0.84 0.10 88 / 0.15)" },
          "50%": { boxShadow: "0 0 40px oklch(0.84 0.10 88 / 0.35)" },
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
