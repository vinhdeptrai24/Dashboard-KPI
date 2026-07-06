/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1A231F",
          muted: "#5B6B63",
        },
        cream: "#F7F5F0",
        primary: {
          50: "#E4F0EC",
          100: "#C4DED4",
          400: "#1D6B54",
          500: "#0E4D3C",
          600: "#0A3A2D",
          700: "#072A21",
        },
        gold: {
          100: "#F5E9C8",
          300: "#E8C874",
          500: "#C89B3C",
          600: "#A9802E",
        },
        line: "#E0DDD3",
        success: "#2F855A",
        danger: "#C53030",
      },
      fontFamily: {
        display: ["'Be Vietnam Pro'", "system-ui", "sans-serif"],
        body: ["'Be Vietnam Pro'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,77,60,0.06), 0 8px 24px -12px rgba(14,77,60,0.15)",
      },
    },
  },
  plugins: [],
};
