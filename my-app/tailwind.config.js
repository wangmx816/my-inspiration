/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          400: "#f472b6", // pink-400
        },
        secondary: {
          400: "#38bdf8", // sky-400
        },
        background: "#ffffff",
        foreground: "#111111",
      },
    },
  },
  plugins: [],
}
