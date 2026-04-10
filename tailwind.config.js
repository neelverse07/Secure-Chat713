/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neon: { purple: "#a855f7", pink: "#ec4899", dark: "#0d0d1a" }
      }
    }
  },
  plugins: [],
}