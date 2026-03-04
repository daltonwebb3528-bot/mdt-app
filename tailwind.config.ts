import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        mdt: {
          bg: "#38494c",
          panel: "#38494c",
          border: "#2d3548",
          text: "#e2e8f0",
          muted: "#64748b",
          accent: "#337f6c",
          selected: "#414f64",
          critical: "#ef4444",
          high: "#f97316",
          medium: "#eab308",
          low: "#22c55e",
          info: "#337f6c",
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
