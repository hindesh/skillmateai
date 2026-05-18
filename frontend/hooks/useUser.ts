'use client'

import { useEffect, useState } from 'react'
import { getProfile, type TokenPayload } from '@/lib/auth'

export type Profile = TokenPayload

export function useUser() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setProfile(getProfile())
    setLoading(false)
  }, [])

  return { profile, loading }
}
