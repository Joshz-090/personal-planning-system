/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Reverting to 'class' as 'selector' might be causing issues in this specific v4 build
  theme: {
    extend: {},
  },
  plugins: [],
}
