/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0f1419',
        card: '#1a1f26',
        accent: '#32b8c6',
        border: '#2d3748',
        success: '#10b981',
        error: '#ef4444',
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
}

