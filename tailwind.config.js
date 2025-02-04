/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./frontend/src/components/**/*.{js,ts,jsx,tsx}", // Add components directory
    // "./src/**/*.{js,ts,jsx,tsx}",
    "./frontend/index.html",
  ],
  theme: {
    extend: {
      colors: {
        hover: "#F7DED0",
        primary: "#fff",
        accent: "#E2BFB3",
        secondary: "#BED7DC",
        tertiary: "#FFBE98",
        cancel: "#DC2626",
        hoverDelete: "#FECACA",
      },
    },
  },
  plugins: [],
};
