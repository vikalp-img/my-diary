import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cream: "#faf6ee",
        ivory: "#fdfbf5",
        paper: "#f7f1e3",
        leather: "#5d4037",
        "leather-dark": "#3e2723",
        pine: "#1b4332",
        "pine-dark": "#102a1f",
        gold: "#c9a227",
        "gold-light": "#e9d48a",
        ink: "#1a1a1a",
        navyink: "#1e2a6b",
        blueblack: "#101d38",
        maroonink: "#6b1f2a",
      },
      fontFamily: {
        kalam: ["var(--font-kalam)", "cursive"],
        caveat: ["var(--font-caveat)", "cursive"],
        shadows: ["var(--font-shadows)", "cursive"],
      },
      boxShadow: {
        page: "0 1px 2px rgba(62,39,35,.12), 0 12px 32px -8px rgba(62,39,35,.28), 8px 0 0 -4px #fffdf6, 9px 0 0 -4px rgba(0,0,0,.06)",
        book: "0 20px 40px -16px rgba(30,20,12,.55), inset 4px 0 8px rgba(255,255,255,.15)",
      },
    },
  },
  plugins: [],
};
export default config;
