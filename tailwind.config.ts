import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        mdt: {
          // Main dark background (map area, main content)
          bg: "#1a1f2e",
          // Sidebar/panel background
          panel: "#38494c",
          // Card/elevated surfaces
          card: "#414f64",
          // Borders
          border: "#2d3548",
          // Text colors
          text: "#e2e8f0",
          muted: "#64748b",
          // Brand accent (headers, buttons, highlights)
          accent: "#337f6c",
          // Selected/active states
          selected: "#414f64",
          // Status colors
          critical: "#ef4444",
          high: "#f97316",
          medium: "#eab308",
          low: "#22c55e",
          // Info color (same as accent for consistency)
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
