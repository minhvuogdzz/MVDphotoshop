/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': 'transparent',
        'bg-secondary': 'rgba(0, 0, 0, 0.2)',
        'bg-glass': 'rgba(30, 25, 20, 0.65)',
        'text-primary': '#ffffff',
        'text-secondary': '#a3a3a3',
        accent: '#c09b68',
        'accent-hover': '#e0b67e',
      },
      fontFamily: {
        primary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        secondary: ['Playfair Display', 'serif'],
      },
      transitionTimingFunction: {
        'slow': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.05)',
      },
      transitionDuration: {
        '400': '400ms',
      }
    },
  },
  plugins: [],
}
