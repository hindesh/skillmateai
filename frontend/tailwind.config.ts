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
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand blue (kept indigo-named so existing usage keeps working)
        indigo: {
          50:  '#F0F5FF',
          100: '#DDEAFF',
          200: '#BBCFFF',
          300: '#90B5FE',
          400: '#70A1FE',
          500: '#5890FE',
          600: '#4278F5',
          700: '#2E61E8',
          800: '#1E4CCC',
          900: '#1238A8',
        },
        // Material 3 expressive accent ring
        accent: {
          violet: '#7C5CFF',
          pink:   '#FF5DA2',
          amber:  '#FFB454',
          teal:   '#1FC8C8',
          mint:   '#34D399',
        },
        // Tonal surfaces (M3 surface containers)
        surface: {
          DEFAULT: '#FBFBFF',
          dim:     '#F2F4FB',
          bright:  '#FFFFFF',
          tint:    '#EEF2FE',
          deep:    '#0B1024',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        // M3-inspired elevations — soft, layered, tinted with brand blue
        'm3-1': '0 1px 2px 0 rgba(15, 23, 42, 0.05), 0 1px 3px 0 rgba(88, 144, 254, 0.06)',
        'm3-2': '0 2px 6px -1px rgba(15, 23, 42, 0.06), 0 4px 16px -4px rgba(88, 144, 254, 0.10)',
        'm3-3': '0 6px 18px -6px rgba(15, 23, 42, 0.10), 0 12px 32px -8px rgba(88, 144, 254, 0.18)',
        'm3-4': '0 10px 28px -12px rgba(15, 23, 42, 0.18), 0 24px 60px -16px rgba(88, 144, 254, 0.28)',
        'glow':  '0 0 0 1px rgba(88, 144, 254, 0.30), 0 8px 32px -6px rgba(88, 144, 254, 0.45)',
      },
      backgroundImage: {
        'brand-gradient':  'linear-gradient(135deg, #5890FE 0%, #7C5CFF 60%, #FF5DA2 100%)',
        'brand-radial':    'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,92,255,0.20), transparent 60%), radial-gradient(ellipse 70% 50% at 90% 10%, rgba(88,144,254,0.20), transparent 60%), radial-gradient(ellipse 60% 50% at 10% 30%, rgba(255,93,162,0.10), transparent 60%)',
        'mesh-blue':       'linear-gradient(135deg, rgba(88,144,254,1) 0%, rgba(46,97,232,1) 50%, rgba(30,76,204,1) 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'blob': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'blob': 'blob 14s ease-in-out infinite',
        'shimmer': 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
