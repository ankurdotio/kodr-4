/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F3EE',
        surface: '#FDFBF8',
        ink: {
          DEFAULT: '#1C1917',
          muted: '#6B625B',
        },
        hairline: '#E4DCD2',
        sand: '#C9B79C',
        accent: '#A8442A',
        positive: '#3F5D45',
        critical: '#8C2F2A',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', '"Libre Caslon Text"', '"Playfair Display"', 'serif'],
        sans: ['"Inter Tight"', '"Inter"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '2px',
        lg: '2px',
      },
      letterSpacing: {
        eyebrow: '0.14em',
      },
      spacing: {
        '120': '120px',
      },
    },
  },
  plugins: [],
}
