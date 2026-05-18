'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { clearToken } from '@/lib/auth'
import type { Profile } from '@/hooks/useUser'

interface NavbarProps {
  profile: Profile | null
}

export default function Navbar({ profile }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const signOut = () => {
    clearToken()
    router.push('/')
  }

  const links =
    profile?.role === 'teacher'
      ? [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/setup', label: 'My Profile' },
        ]
      : profile?.role === 'student'
      ? [
          { href: '/dashboard', label: 'Discover' },
          { href: '/progress', label: 'Progress' },
          { href: '/self-study', label: 'Self-Study' },
        ]
      : []

  const initial = (profile?.name?.[0] || '?').toUpperCase()

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <nav className="mx-auto max-w-6xl flex items-center justify-between gap-4 rounded-full border border-slate-200/70 bg-white/80 px-3 py-2 shadow-m3-1 backdrop-blur-xl">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 pl-2 group">
          <span className="relative inline-flex">
            <span className="absolute inset-0 rounded-full bg-indigo-400/40 blur-md group-hover:bg-indigo-400/60 transition" aria-hidden />
            <svg width="30" height="30" viewBox="0 0 32 32" className="relative">
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5890FE" />
                  <stop offset="100%" stopColor="#7C5CFF" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="16" fill="url(#logo-grad)" />
              <polyline
                points="8,17 13,22 24,10"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </span>
          <span className="font-display text-lg font-bold text-slate-900 tracking-tight">
            SkillMate<span className="text-gradient">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href || pathname?.startsWith(l.href + '/')
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-m3-1'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </div>

        {/* Profile + sign out */}
        <div className="flex items-center gap-2 pr-1">
          <div className="hidden sm:flex items-center gap-2.5 rounded-full bg-slate-50 border border-slate-200/60 pl-1 pr-3 py-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-800">{profile?.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="rounded-full px-3 py-2 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Sign out"
          >
            Sign out
          </button>
        </div>
      </nav>
    </header>
  )
}
