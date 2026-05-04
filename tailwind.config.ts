import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#1C1408',
          light:   '#2E2015',
          muted:   '#6B5744',
        },
        parchment: {
          50:  '#FDFCF8',
          100: '#FAF6EC',
          200: '#F4EBD4',
          300: '#EBDAB8',
          400: '#DEC49A',
        },
        marigold: {
          300: '#FBCA4A',
          400: '#F5A820',
          500: '#C46508',
          600: '#9C4C06',
        },
        kumkum: {
          400: '#E85A3C',
          500: '#CC3C1C',
          600: '#A82E12',
        },
        forest: {
          600: '#2D6E4E',
          700: '#1B4D36',
          800: '#133828',
        },
        indigo: {
          700: '#1E2756',
          800: '#161D42',
        },
        terracotta: {
          400: '#C4580E',
          500: '#A84410',
        },
        sage: {
          50:  '#F0F7F4',
          100: '#E0EFE8',
          200: '#C1DFD0',
          400: '#5EA882',
          500: '#3E8B63',
          600: '#2D6E4E',
          700: '#1B4D36',
        },
        warm: {
          50:  '#FAF8F4',
          100: '#F5F1E8',
        },
      },
      animation: {
        'blink':    'blink 1s step-end infinite',
        'fade-up':  'fadeUp 0.5s ease-out forwards',
        'fade-in':  'fadeIn 0.6s ease-out forwards',
        'slide-in': 'slideIn 0.35s ease-out forwards',
        'typing-in':'typingIn 0.25s ease-out forwards',
      },
      keyframes: {
        blink:    { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        fadeUp:   { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn:  { '0%': { opacity: '0', transform: 'translateX(-10px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        typingIn: { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}

export default config
