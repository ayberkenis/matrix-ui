/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        matrix: {
          dark: '#0a0a0a',
          darker: '#050505',
          green: '#00ff41',
          'green-dim': '#00cc33',
          'green-bright': '#00ff88',
          'green-glow': '#00ff41',
        },
      },
      boxShadow: {
        'matrix-glow': '0 0 10px rgba(0, 255, 65, 0.5), 0 0 20px rgba(0, 255, 65, 0.3)',
        'matrix-glow-sm': '0 0 5px rgba(0, 255, 65, 0.4)',
      },
      textShadow: {
        'matrix': '0 0 5px rgba(0, 255, 65, 0.8), 0 0 10px rgba(0, 255, 65, 0.5)',
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.98 },
        },
      },
    },
  },
  plugins: [],
}
