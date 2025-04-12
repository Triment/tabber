/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Include all JS/TS/JSX/TSX files in src
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // You can extend the theme here (e.g., add custom colors, fonts)
    },
  },
  plugins: [
    // Add any Tailwind plugins here (e.g., @tailwindcss/forms)
  ],
}
