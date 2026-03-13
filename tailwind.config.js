/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        display: ["Playfair Display", "serif"],
        script: ["Great Vibes", "cursive"],
        body: ["Cormorant Garamond", "serif"],
      },
      colors: {
        gold: { 50: "#FFFDF5", 100: "#FFF9E5", 200: "#FFF0C2", 300: "#FFE49A", 400: "#FFD466", 500: "#D4A853", 600: "#C49A3D", 700: "#A67C2E", 800: "#7A5A1E", 900: "#4D3812" },
        cream: { 50: "#FFFEFB", 100: "#FDF8F0", 200: "#FAF0E0", 300: "#F5E6CC", 400: "#EDD9B5", 500: "#E8D5B0", 600: "#D4C09A", 700: "#BFA77A", 800: "#A08A5C", 900: "#6B5C3E" },
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
      },
      keyframes: {
        float: { "0%,100%": { transform: "translate(0,0) scale(1)" }, "50%": { transform: "translate(30px,-30px) scale(1.05)" } },
        fadeUp: { from: { opacity: "0", transform: "translateY(40px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        pulseGold: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
      },
    },
  },
  plugins: [],
};
