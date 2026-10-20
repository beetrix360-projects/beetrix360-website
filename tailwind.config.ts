import type { Config } from "tailwindcss";

// Mirrors the tailwind.config block in beetrix360_homepage_v6.html.
// Font families point at the CSS variables set by next/font in src/app/layout.tsx.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bx-pink": "#DE2056",
        "bx-green": "#2CB383",
        "bx-yellow": "#FAB12F",
        "bx-blue": "#3ABEF9",
        "bx-dark": "#0A0A0A",
        "bx-surface": "#F9FAFB",
        "bx-subtle": "#F3F4F6",
        "bx-border": "#E5E7EB",
      },
      fontFamily: {
        heading: ["var(--font-bricolage)", "var(--font-geist)", "sans-serif"],
        sans: ["var(--font-geist)", "ui-sans-serif", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-instrument-serif)", "serif"],
      },
      boxShadow: {
        ambient: "0 4px 20px -2px rgba(10,10,10,.05)",
        elevated: "0 24px 48px -16px rgba(10,10,10,.14)",
        mega: "0 30px 60px -15px rgba(10,10,10,.18)",
      },
    },
  },
  plugins: [],
};

export default config;
