/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
  // Set important to true to help with Shadow DOM style application
  important: true,
  // Disable preflight since we're using Shadow DOM
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      // GitHub-inspired theme extensions
      colors: {
        'gh-dark': '#24292e',
        'gh-medium': '#586069',
        'gh-light': '#6a737d',
        'gh-border': '#e1e4e8',
        'gh-bg': '#f6f8fa',
        'gh-green': '#2ea44f',
        'gh-red': '#d73a49',
        'gh-blue': '#0366d6',
      },
      boxShadow: {
        gh: '0 4px 8px rgba(0, 0, 0, 0.2)',
      },
      // Add fallback fonts for better text rendering
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
    },
  },
  plugins: [],
};