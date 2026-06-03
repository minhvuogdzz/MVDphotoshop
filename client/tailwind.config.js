/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-main': 'var(--bg-main)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-glass': 'var(--bg-glass)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
      },
      fontFamily: {
        primary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        secondary: ['Playfair Display', 'serif'],
      },
      transitionTimingFunction: {
        'slow': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        'glass': 'var(--glass-shadow)',
      },
      borderColor: {
        'glass': 'var(--glass-border)',
      },
      transitionDuration: {
        '400': '400ms',
      }
    },
  },
  plugins: [],
}
