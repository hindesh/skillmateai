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
      },
    },
  },
  plugins: [],
}

export default config
