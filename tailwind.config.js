/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0B2D5C",
        accent: "#1E88E5",
        appbg: "#F5F7FA"
      },
      boxShadow: {
        sheet: "0 -18px 40px rgba(11, 45, 92, 0.18)",
        panel: "0 14px 34px rgba(11, 45, 92, 0.1)"
      }
    }
  },
  plugins: []
};
