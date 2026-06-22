import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Inter is the primary typeface across the whole UI
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // Available for the occasional serif accent only
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'serif'],
      },
      colors: {
        // ── Primary: Imperial Blue (kept "indigo"-named so existing usage adopts it) ──
        indigo: {
          50:  '#E8F0F7',
          100: '#C6DBED',
          200: '#92B8D7',
          300: '#5A92BC',
          400: '#2A6FA0',
          500: '#0C568A',
          600: '#054B7E',
          700: '#024372',
          800: '#003E74', // Imperial Blue
          900: '#002B52',
        },
        // Cooler steel-blue — keeps two-tone gradients cohesive and restrained
        violet: {
          50:  '#EBF1F6',
          100: '#D2E0EC',
          200: '#A9C4DC',
          300: '#7AA1C6',
          400: '#4E7DAB',
          500: '#2E608F',
          600: '#1F4D77',
          700: '#173E62',
          800: '#123250',
          900: '#0D2540',
        },
        // Deep institutional green — restrained secondary accent
        pink: {
          50:  '#EAF3EE',
          100: '#CBE3D5',
          200: '#9DCBB1',
          300: '#66AC86',
          400: '#318A60',
          500: '#147049',
          600: '#0E5C3C',
          700: '#0B4A31', // text on white
          800: '#083626',
          900: '#05231A',
        },
        accent: {
          green:     '#147049',
          imperial:  '#003E74',
          steel:     '#2E608F',
          sky:       '#5A92BC',
          ink:       '#0D2540',
        },
        // Tonal surfaces
        surface: {
          DEFAULT: '#FFFFFF',
          dim:     '#F7F9FB',
          bright:  '#FFFFFF',
          tint:    '#E8F0F7',
          parchment: '#F7F9FB',
          deep:    '#002344',
        },
      },
      borderRadius: {
        '4xl': '1rem',
        '5xl': '1.25rem',
      },
      boxShadow: {
        // Restrained, neutral elevations — crisp institutional cards
        'm3-1': '0 1px 2px 0 rgba(15, 23, 42, 0.06)',
        'm3-2': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'm3-3': '0 4px 12px -2px rgba(15, 23, 42, 0.10)',
        'm3-4': '0 12px 32px -8px rgba(0, 24, 51, 0.22)',
        'glow':  '0 0 0 1px rgba(0, 33, 71, 0.08)',
      },
      backgroundImage: {
        'brand-gradient':  'linear-gradient(135deg, #002147 0%, #0A2D52 100%)',
        'brand-radial':    'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,33,71,0.06), transparent 60%)',
        'mesh-blue':       'linear-gradient(135deg, #002147 0%, #06335c 60%, #0A2D52 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer': 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
