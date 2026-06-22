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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Institutional utility strip */}
      <div className="bg-indigo-800 text-white/80">
        <div className="mx-auto max-w-6xl px-6 h-8 flex items-center justify-between text-[11px] tracking-wide">
          <span className="uppercase tracking-[0.18em] text-white/70">SkillMateAI · Teaching &amp; Learning</span>
          <span className="hidden sm:inline capitalize text-white/70">{profile?.role} portal</span>
        </div>
      </div>

      {/* Main header row */}
      <nav className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-6 h-[68px]">
        {/* Brand / crest */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <Crest />
          <span className="leading-none">
            <span className="block font-display text-lg font-bold text-indigo-800 tracking-tight">
              SkillMate<span className="text-pink-700">AI</span>
            </span>
            <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-400 mt-0.5">
              Teaching &amp; Learning
            </span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 h-full">
          {links.map((l) => {
            const active = pathname === l.href || pathname?.startsWith(l.href + '/')
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative flex items-center h-full px-4 text-sm font-medium transition-colors ${
                  active
                    ? 'text-indigo-800'
                    : 'text-slate-600 hover:text-indigo-800'
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-pink-500 rounded-t" aria-hidden />
                )}
              </Link>
            )
          })}
        </div>

        {/* Profile + sign out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-800">{profile?.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Sign out"
          >
            Sign out
          </button>
        </div>
      </nav>
    </header>
  )
}

function Crest() {
  return (
    <span className="relative inline-flex">
      <svg width="34" height="34" viewBox="0 0 32 34" className="drop-shadow-sm">
        {/* Shield */}
        <path
          d="M16 1 L29 5 V16 C29 25 23 30 16 33 C9 30 3 25 3 16 V5 Z"
          fill="#003E74"
          stroke="#147049"
          strokeWidth="1.25"
        />
        {/* Open book motif */}
        <path d="M16 11 C13.5 9.5 10.5 9.5 8.5 10.6 V21 C10.5 19.9 13.5 19.9 16 21.4 Z" fill="#ffffff" opacity="0.92" />
        <path d="M16 11 C18.5 9.5 21.5 9.5 23.5 10.6 V21 C21.5 19.9 18.5 19.9 16 21.4 Z" fill="#147049" />
      </svg>
    </span>
  )
}
