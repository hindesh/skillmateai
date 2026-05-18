'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { clearToken } from '@/lib/auth'
import type { Profile } from '@/hooks/useUser'

interface NavbarProps {
  profile: Profile | null
}

export default function Navbar({ profile }: NavbarProps) {
  const router = useRouter()

  const signOut = () => {
    clearToken()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#6B9FE4"/>
          <polyline points="8,17 13,22 24,10" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-xl font-bold text-gray-900">SkillMate<span className="text-[#6B9FE4]">AI</span></span>
      </Link>

      <div className="flex items-center gap-6">
        {profile?.role === 'student' && (
          <>
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-indigo-600">Discover</Link>
            <Link href="/progress" className="text-sm text-gray-600 hover:text-indigo-600">Progress</Link>
          </>
        )}
        {profile?.role === 'teacher' && (
          <>
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-indigo-600">Dashboard</Link>
            <Link href="/setup" className="text-sm text-gray-600 hover:text-indigo-600">My Profile</Link>
          </>
        )}
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{profile?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-red-600 border border-gray-200 rounded px-3 py-1"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
