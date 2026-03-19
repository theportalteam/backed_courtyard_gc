import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0B0F1A",
          surface: "#131929",
          elevated: "#1A2035",
          border: "#242C42",
        },
        primary: {
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
          muted: "rgba(59,130,246,0.12)",
        },
        accent: {
          DEFAULT: "#06B6D4",
          muted: "rgba(6,182,212,0.12)",
        },
        success: {
          DEFAULT: "#10B981",
          hover: "#059669",
          muted: "rgba(16,185,129,0.12)",
        },
        warning: {
          DEFAULT: "#F59E0B",
          muted: "rgba(245,158,11,0.12)",
        },
        danger: {
          DEFAULT: "#EF4444",
          muted: "rgba(239,68,68,0.12)",
        },
        rarity: {
          common: "#6B7280",
          uncommon: "#10B981",
          rare: "#3B82F6",
          epic: "#8B5CF6",
          legendary: "#F59E0B",
        },
        text: {
          primary: "#F1F5F9",
          secondary: "#94A3B8",
          tertiary: "#64748B",
          inverse: "#0B0F1A",
        },
        brand: {
          xbox: "#107C10",
          steam: "#1B2838",
          nintendo: "#E60012",
          playstation: "#003791",
          google: "#4285F4",
          amazon: "#FF9900",
          apple: "#A2AAAD",
          roblox: "#E2231A",
          spotify: "#1DB954",
          netflix: "#E50914",
        },
        // Backward compat aliases used by existing components
        background: "#0B0F1A",
        surface: "#131929",
        "surface-light": "#1A2035",
        epic: "#8B5CF6",
        "text-primary": "#F1F5F9",
        "text-secondary": "#94A3B8",
        "border-subtle": "rgba(36,44,66,0.8)",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        card: "14px",
        button: "10px",
        badge: "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.4)",
        "glow-blue": "0 0 20px rgba(59,130,246,0.25)",
        "glow-purple": "0 0 20px rgba(139,92,246,0.3)",
        "glow-gold": "0 0 20px rgba(245,158,11,0.3)",
        "glow-green": "0 0 20px rgba(16,185,129,0.25)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "legendary-border": {
          "0%": { borderColor: "#F59E0B" },
          "33%": { borderColor: "#EF4444" },
          "66%": { borderColor: "#F59E0B" },
          "100%": { borderColor: "#FBBF24" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(59, 130, 246, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "legendary-border": "legendary-border 2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
