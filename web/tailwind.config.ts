import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cream: "#F7F3F0",
        ink: "#2B2430",
        lavender: "#E6D9F7",
        "lavender-full": "#A283E0",
        "lavender-deep": "#8B6AD4",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Palatino Linotype", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 50px rgba(43, 36, 48, 0.07)",
        soft: "0 10px 24px rgba(162, 131, 224, 0.28)",
      },
    },
  },
  plugins: [],
} satisfies Config;
