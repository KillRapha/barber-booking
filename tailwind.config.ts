import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",

        primary: "rgb(var(--primary) / <alpha-value>)",
        primaryText: "rgb(var(--primaryText) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",

        success: "rgb(var(--success) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 12px 32px rgba(15, 23, 42, 0.10)",
        card: "0 10px 24px rgba(2, 6, 23, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
}

export default config