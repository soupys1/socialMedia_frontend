/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in': 'fade-in 1s ease-out',
        'fade-in-delay': 'fade-in 1s ease-out 0.2s both',
        'fade-in-delay-2': 'fade-in 1s ease-out 0.4s both',
        'fade-in-delay-3': 'fade-in 1s ease-out 0.6s both',
        'fade-in-delay-4': 'fade-in 1s ease-out 0.8s both',
        'fade-in-delay-5': 'fade-in 1s ease-out 1s both',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
