import type { Metadata } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

// Loaded but used sparingly — UI is primarily Inter
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SkillMateAI — Intelligent Teaching & Learning',
  description:
    'An academic platform that analyses teaching sessions, assesses understanding, and produces tailored assessments to support every learner.',
  icons: { icon: '/icon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="font-sans antialiased bg-surface text-slate-900 min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  )
}
