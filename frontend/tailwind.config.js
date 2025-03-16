/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'dark-primary': '#000000',
        'dark-secondary': '#111111',
      },
      textColor: {
        'dark-primary': '#ffffff',
        'dark-secondary': '#cccccc',
      },
      borderColor: {
        'dark-border': '#222222',
      },
    },
  },
  plugins: [],
}