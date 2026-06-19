/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#dde7ff',
          600: '#1e3a8a',
          700: '#1e2f6e',
          800: '#172554',
        },
      },
    },
  },
  plugins: [],
}
