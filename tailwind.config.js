/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Added to ensure all src files are scanned
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF0000', // Red
        secondary: '#FFFFFF', // White
        accent: '#FF4500', // A slightly different red for accents
        background: '#F8F8F8', // Off-white background
        text: '#333333', // Dark grey for text
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
module.exports = config;
