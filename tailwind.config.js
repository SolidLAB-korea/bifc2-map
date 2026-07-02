/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        appbg: "rgb(var(--color-appbg) / <alpha-value>)"
      },
      boxShadow: {
        sheet: "0 -18px 40px rgb(var(--color-primary) / 0.18)",
        panel: "0 14px 34px rgb(var(--color-primary) / 0.1)"
      }
    }
  },
  plugins: []
};
