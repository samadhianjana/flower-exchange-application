/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: "#f6f8fc",
          panel: "#ffffff",
          line: "#d8e0ec",
          text: "#172033",
          muted: "#5c6b82",
          brand: "#0e3a8a",
          brandSoft: "#eaf1ff",
          header: "#e9eef7",
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
