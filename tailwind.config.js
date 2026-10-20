/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#EA4300',
          deep: '#B82900',
          yellow: '#FFD026',
          DEFAULT: '#EA4300',
        },
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
        bengali: ['Hind Siliguri', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
