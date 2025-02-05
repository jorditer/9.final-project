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
        accent: "#E2BFB3", //#FFF4F2
        secondary: "#FFF4F2",
        tertiary: "#FFBE98",
        dark: "#F99B66",
        cancel: "#DC2626",
        hoverDelete: "#FECACA",
        accept: "#69B088",
        deny: "#D85F5F",
        // hoverSubmit: 
      },
    },
  },
  plugins: [],
};
