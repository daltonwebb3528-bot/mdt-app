import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        mdt: {
          bg: "#1a1f2e",
          panel: "#242938",
          border: "#2d3548",
          text: "#e2e8f0",
          muted: "#64748b",
          critical: "#ef4444",
          high: "#f97316",
          medium: "#eab308",
          low: "#22c55e",
          info: "#22d3ee",
        },
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "0.85rem" }],
      },
    },
  },
  plugins: [],
};
export default config;
