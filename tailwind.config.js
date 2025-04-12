// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,tsx,html}'],
  // Disable preflight since we're using Shadow DOM
  corePlugins: {
    preflight: false,
  },
  // Shadow DOM compatibility
  important: true,
  plugins: [],
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        slideIn: 'slideIn 0.3s ease-out',
      },
      boxShadow: {
        gh: '0 4px 8px rgba(0, 0, 0, 0.2)',
      },
      // GitHub-inspired theme extensions
      colors: {
        'gh-bg': '#f6f8fa',
        'gh-blue': '#0366d6',
        'gh-border': '#e1e4e8',
        'gh-dark': '#24292e',
        'gh-green': '#2ea44f',
        'gh-light': '#6a737d',
        'gh-medium': '#586069',
        'gh-red': '#d73a49',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica',
          'Arial',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
        ],
      },
      // Enhanced animation keyframes for transitions
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
};
