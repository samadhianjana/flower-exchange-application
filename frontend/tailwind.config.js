/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: "#f3f6fb",
          panel: "#ffffff",
          line: "#d7deea",
          text: "#172033",
          muted: "#5f6c83",
          brand: "#0e3a8a",
          brandSoft: "#dce7ff",
          success: "#0f766e",
          warning: "#a16207",
          danger: "#b91c1c"
        }
      },
      boxShadow: {
        panel: "0 14px 36px -24px rgba(7, 16, 35, 0.45)"
      }
    }
  },
  plugins: []
};
