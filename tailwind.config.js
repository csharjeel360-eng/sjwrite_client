/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map Tailwind's `blue` palette to black/white/gray shades
        blue: {
          50: '#ffffff',
          100: '#f8f9fa',
          200: '#f1f2f4',
          300: '#e6e7e9',
          400: '#bfc3c7',
          500: '#000000',
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
          DEFAULT: '#000000'
        }
      }
    },
  },
  plugins: [],
};
