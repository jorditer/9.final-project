/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./frontend/src/components/**/*.{js,ts,jsx,tsx}",  // Add components directory
    // "./src/**/*.{js,ts,jsx,tsx}",
    "./frontend/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ef4444'
      }
    }
  },
  plugins: [],
}