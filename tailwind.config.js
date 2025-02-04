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
        primary: '#F1EEDC',
        accent: '#E5DDC5',
        secondary: '#BED7DC',
        tertiary: '#B3C8CF',
      }
    }
  },
  plugins: [],
}