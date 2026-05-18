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
      colors: {
        indigo: {
          50:  '#EEF4FB',
          100: '#D9E8F8',
          200: '#B3D1F1',
          300: '#8BBAEB',
          400: '#6B9FE4',
          500: '#5490DC',
          600: '#4A82D4',
          700: '#3A6DB8',
          800: '#2D559A',
          900: '#1E3E7B',
        },
      },
    },
  },
  plugins: [],
}

export default config
