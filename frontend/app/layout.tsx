import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SkillMateAI — Gemma 4 as your silent teaching partner',
  description:
    'AI-powered tutoring platform. Gemma 4 analyses live teaching sessions, scores understanding, and generates targeted quizzes — automatically.',
  icons: { icon: '/icon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased bg-surface text-slate-900 min-h-screen selection:bg-indigo-200 selection:text-indigo-900">
        {children}
      </body>
    </html>
  )
}
