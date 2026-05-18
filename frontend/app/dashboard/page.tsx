'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { apiFetch } from '@/lib/api'
import Navbar from '@/components/Navbar'

interface Teacher {
  id: string
  name: string
  bio: string | null
  expertise: string[]
  youtube_samples: { title: string; url: string }[]
  price_per_hour: number | null
  max_students: number | null
}

interface Request {
  id: string
  topic: string
  message: string | null
  status: string
  student: { id: string; name: string; email: string } | null
  teacher: { id: string; name: string } | null
  created_at: string
}

interface Enrollment {
  id: string
  student?: { id: string; name: string; email: string } | null
  teacher?: Teacher | null
  created_at: string
}

interface Session {
  id: string
  topic: string
  status: string
  scheduled_at: string | null
  understanding_score: number | null
  profiles?: { name: string; email: string } | null
}

export default function DashboardPage() {
  const { profile, loading } = useUser()
  const router = useRouter()

  // Student state
  const [query, setQuery] = useState('')
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [teachersLoading, setTeachersLoading] = useState(true)
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set())
  const [myRequests, setMyRequests] = useState<Request[]>([])
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([])

  // Teacher state
  const [incomingRequests, setIncomingRequests] = useState<Request[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [teacherIsPublic, setTeacherIsPublic] = useState<boolean | null>(null)
  const [showNewSession, setShowNewSession] = useState(false)
  const [newTopic, setNewTopic] = useState('')
  const [newStudentId, setNewStudentId] = useState('')
  const [newScheduledAt, setNewScheduledAt] = useState('')
  const [creating, setCreating] = useState(false)
  const [respondingId, setRespondingId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !profile) router.push('/auth')
  }, [loading, profile, router])

  useEffect(() => {
    if (!profile) return
    if (profile.role === 'teacher') {
      apiFetch<Request[]>('/requests').then(setIncomingRequests).catch(() => {})
      apiFetch<Enrollment[]>('/enrollments').then(setEnrollments).catch(() => {})
      apiFetch<Session[]>('/sessions').then(setSessions).catch(() => {})
      apiFetch<{ is_public: boolean }>('/profile/teacher/me')
        .then(d => setTeacherIsPublic(d.is_public))
        .catch(() => setTeacherIsPublic(false))
    } else {
      apiFetch<Request[]>('/requests').then((reqs) => {
        setMyRequests(reqs)
        setRequestedIds(new Set(reqs.filter(r => r.status === 'pending' || r.status === 'accepted').map(r => r.teacher?.id ?? '')))
      }).catch(() => {})
      apiFetch<Enrollment[]>('/enrollments').then(setMyEnrollments).catch(() => {})
      apiFetch<Session[]>('/sessions').then(setSessions).catch(() => {})
      apiFetch<Teacher[]>('/teachers').then(t => {
        setAllTeachers(t)
        setTeachers(t)
      }).catch(() => {}).finally(() => setTeachersLoading(false))
    }
  }, [profile])

  const filterTeachers = (q: string) => {
    if (!q.trim()) { setTeachers(allTeachers); return }
    const lower = q.toLowerCase()
    setTeachers(allTeachers.filter(t =>
      (t.expertise && t.expertise.some(e => e.toLowerCase().includes(lower))) ||
      t.name.toLowerCase().includes(lower) ||
      (t.bio || '').toLowerCase().includes(lower)
    ))
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    filterTeachers(value)
  }

  const sendRequest = async (teacherId: string) => {
    setRequestingId(teacherId)
    try {
      await apiFetch('/requests', {
        method: 'POST',
        body: JSON.stringify({ teacher_id: teacherId, topic: query, message: `I need help with: ${query}` }),
      })
      setRequestedIds(prev => new Set([...prev, teacherId]))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to send request')
    } finally { setRequestingId(null) }
  }

  const respondRequest = async (reqId: string, status: 'accepted' | 'rejected') => {
    setRespondingId(reqId)
    try {
      const updated = await apiFetch<Request>(`/requests/${reqId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setIncomingRequests(prev => prev.map(r => r.id === reqId ? updated : r))
      if (status === 'accepted') {
        const enr = await apiFetch<Enrollment[]>('/enrollments')
        setEnrollments(enr)
      }
    } catch { } finally { setRespondingId(null) }
  }

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await apiFetch('/sessions', {
        method: 'POST',
        body: JSON.stringify({
          topic: newTopic,
          student_id: newStudentId || undefined,
          scheduled_at: newScheduledAt || undefined,
        }),
      })
      const updated = await apiFetch<Session[]>('/sessions')
      setSessions(updated)
      setShowNewSession(false)
      setNewTopic(''); setNewStudentId(''); setNewScheduledAt('')
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setCreating(false) }
  }

  const statusStyle = (s: string) => ({
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-slate-50 text-slate-600 border-slate-200',
    analysed:  'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border-indigo-200',
  }[s] || 'bg-slate-50 text-slate-600 border-slate-200')

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)
    return match ? match[1] : null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    )
  }
  if (!profile) return null

  // ── STUDENT DASHBOARD ─────────────────────────────────────────────────────
  if (profile.role === 'student') {
    const pendingMyRequests = myRequests.filter(r => r.status === 'pending')
    return (
      <div className="min-h-screen">
        <Navbar profile={profile} />
        <main className="max-w-6xl mx-auto px-6 py-10">

          {/* Hero discovery surface */}
          <section className="relative overflow-hidden rounded-4xl bg-mesh-blue p-8 md:p-10 mb-10 shadow-m3-3 animate-fade-up">
            <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
            <div className="blob top-[-4rem] right-[-3rem] w-72 h-72 bg-pink-400/30" />
            <div className="blob bottom-[-6rem] left-[-3rem] w-80 h-80 bg-violet-400/30" style={{ animationDelay: '5s' }} />

            <div className="relative">
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <span className="chip-dark mb-3">
                    <span className="relative inline-flex h-2 w-2">
                      <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    Powered by Gemma 4
                  </span>
                  <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
                    Find your perfect teacher
                  </h1>
                  <p className="text-white/75 text-sm md:text-base max-w-lg">
                    Browse all educators or search by subject. Every match is curated for your grade level.
                  </p>
                </div>
                {profile?.grade_level && (
                  <span className="chip-dark whitespace-nowrap">
                    🎓 {profile.grade_level}
                  </span>
                )}
              </div>

              <div className="relative">
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  placeholder="Try “Physics”, “Calculus”, or a teacher’s name…"
                  className="w-full bg-white/95 backdrop-blur text-slate-900 rounded-2xl pl-12 pr-12 py-4 text-base shadow-m3-2 focus:outline-none focus:ring-4 focus:ring-white/40 placeholder:text-slate-400"
                />
                {query && (
                  <button onClick={() => handleQueryChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full hover:bg-slate-100 transition">✕</button>
                )}
              </div>
            </div>
          </section>

          {/* Quick links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
            <Link href="/progress" className="surface-raised p-5 hover:-translate-y-0.5 transition flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E61E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-5" /></svg>
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">My Progress</p>
                <p className="text-xs text-slate-500">Charts &amp; AI feedback</p>
              </div>
            </Link>
            <Link href="/self-study" className="surface-raised p-5 hover:-translate-y-0.5 transition flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">Self-Study</p>
                <p className="text-xs text-slate-500">Paste notes → quiz</p>
              </div>
            </Link>
            <div className="surface-raised p-5 flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5DA2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">My Teachers</p>
                <p className="text-xs text-slate-500">{myEnrollments.length} enrolled</p>
              </div>
            </div>
          </div>

          {/* Teacher results */}
          <section className="mb-12">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="font-display text-xl md:text-2xl font-bold text-slate-900">
                {teachersLoading ? 'Loading teachers…' : query
                  ? <>Results for <span className="text-gradient">&ldquo;{query}&rdquo;</span></>
                  : 'Available teachers'}
              </h2>
              {!teachersLoading && <span className="text-sm text-slate-500">{teachers.length} {teachers.length === 1 ? 'result' : 'results'}</span>}
            </div>

            {teachersLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1,2].map(i => <div key={i} className="skeleton h-64" />)}
              </div>
            )}
            {!teachersLoading && teachers.length === 0 && (
              <div className="surface-card p-12 text-center text-slate-400">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                </div>
                <p className="text-slate-600 font-medium">No teachers match your search</p>
                <p className="text-sm mt-1">Try a broader term like &quot;Physics&quot;, or clear the search.</p>
              </div>
            )}
            {!teachersLoading && teachers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {teachers.map(t => {
                  const alreadyRequested = requestedIds.has(t.id)
                  const firstSample = t.youtube_samples?.[0]
                  const ytId = firstSample ? extractYouTubeId(firstSample.url) : null
                  return (
                    <div key={t.id} className="surface-raised overflow-hidden hover:shadow-m3-3 hover:-translate-y-1 transition-all duration-300 group">
                      {ytId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}`}
                          className="w-full aspect-video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={firstSample?.title || 'Teaching sample'}
                        />
                      ) : (
                        <div className="w-full aspect-video bg-gradient-to-br from-indigo-100 via-violet-100 to-pink-100 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-3xl font-display font-extrabold text-gradient">
                            {t.name[0]}
                          </div>
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-display font-bold text-lg text-slate-900">{t.name}</h3>
                            {t.price_per_hour && (
                              <p className="text-sm font-semibold text-indigo-600 mt-0.5">${t.price_per_hour}<span className="text-slate-500 font-normal">/hr</span></p>
                            )}
                          </div>
                          <Link href={`/teachers/${t.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition">View profile →</Link>
                        </div>
                        {t.bio && <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">{t.bio}</p>}
                        {t.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {t.expertise.map(e => <span key={e} className="chip">{e}</span>)}
                          </div>
                        )}
                        <button
                          onClick={() => sendRequest(t.id)}
                          disabled={alreadyRequested || requestingId === t.id}
                          className={alreadyRequested
                            ? 'w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 border border-emerald-200 cursor-default'
                            : 'btn-filled w-full'
                          }
                        >
                          {alreadyRequested ? <>✓ Request Sent</> : requestingId === t.id ? 'Sending…' : 'Request Session'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* My Teachers */}
          {myEnrollments.length > 0 && (
            <section className="mb-12">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-5">My Teachers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {myEnrollments.map(e => e.teacher && (
                  <Link key={e.id} href={`/teachers/${e.teacher.id}`} className="surface-card p-5 hover:shadow-m3-2 hover:-translate-y-0.5 transition flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-display font-extrabold text-lg shadow-glow">
                      {e.teacher.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{e.teacher.name}</p>
                      {e.teacher.expertise.length > 0 && <p className="text-xs text-slate-500 mt-0.5">{e.teacher.expertise.slice(0,2).join(' · ')}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* My Sessions */}
          {sessions.length > 0 && (
            <section className="mb-12">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-5">My Sessions</h2>
              <div className="space-y-3">
                {sessions.map(s => (
                  <div key={s.id} className="surface-card p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-slate-900 truncate">{s.topic}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusStyle(s.status)}`}>{s.status}</span>
                      </div>
                      {s.profiles && <p className="text-sm text-slate-500">Teacher: {s.profiles.name}</p>}
                      {s.scheduled_at && <p className="text-xs text-slate-400 mt-0.5">{new Date(s.scheduled_at).toLocaleString()}</p>}
                    </div>
                    {s.status === 'analysed' ? (
                      <Link href={`/quiz/${s.id}`} className="btn-filled btn-sm shrink-0">Take Quiz →</Link>
                    ) : (
                      <Link href={`/session/${s.id}`} className="btn-outline btn-sm shrink-0">View</Link>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pending requests */}
          {pendingMyRequests.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-bold text-slate-900 mb-5">Pending Requests</h2>
              <div className="space-y-3">
                {pendingMyRequests.map(r => (
                  <div key={r.id} className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 text-lg">⏳</span>
                    <div>
                      <p className="font-semibold text-slate-900">{r.topic}</p>
                      <p className="text-sm text-slate-600">To: <span className="font-medium">{r.teacher?.name}</span> · <span className="text-amber-700">Awaiting response</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    )
  }

  // ── TEACHER DASHBOARD ─────────────────────────────────────────────────────
  const pendingIncoming = incomingRequests.filter(r => r.status === 'pending')

  return (
    <div className="min-h-screen">
      <Navbar profile={profile} />
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Hero greeting */}
        <section className="relative overflow-hidden rounded-4xl bg-mesh-blue p-8 md:p-10 mb-10 shadow-m3-3 animate-fade-up">
          <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
          <div className="blob top-[-4rem] right-[-3rem] w-72 h-72 bg-pink-400/30" />
          <div className="blob bottom-[-6rem] left-[-3rem] w-80 h-80 bg-violet-400/30" style={{ animationDelay: '5s' }} />

          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="chip-dark mb-3">Teacher dashboard</span>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
                Welcome back, {profile?.name?.split(' ')[0]}
              </h1>
              <p className="text-white/75 text-sm md:text-base">
                Your students, sessions, and AI-powered insights — all in one place.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/setup" className="rounded-full bg-white/15 border border-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/25 transition">
                Edit Profile
              </Link>
              <button onClick={() => setShowNewSession(true)} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition shadow-m3-2">
                + Schedule Session
              </button>
            </div>
          </div>
        </section>

        {/* Profile setup banner */}
        {teacherIsPublic === false && (
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <span className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 text-xl shrink-0">⚠️</span>
              <div>
                <p className="font-semibold text-amber-900">Your profile is not visible to students yet</p>
                <p className="text-sm text-amber-700 mt-0.5">Complete your teacher profile so students can discover and request sessions with you.</p>
              </div>
            </div>
            <Link href="/setup" className="shrink-0 rounded-full bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 text-sm font-semibold shadow-m3-1 transition">
              Set Up Profile →
            </Link>
          </div>
        )}

        {/* KPI stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Students', value: enrollments.length, tone: 'from-indigo-500 to-indigo-700' },
            { label: 'Pending Requests', value: pendingIncoming.length, tone: 'from-violet-500 to-indigo-600' },
            { label: 'Sessions', value: sessions.length, tone: 'from-pink-500 to-violet-600' },
          ].map(stat => (
            <div key={stat.label} className="surface-raised p-6 relative overflow-hidden">
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${stat.tone} opacity-10 blur-2xl`} />
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{stat.label}</p>
              <p className={`font-display text-4xl md:text-5xl font-extrabold mt-2 bg-gradient-to-br ${stat.tone} bg-clip-text text-transparent`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Incoming requests */}
        {pendingIncoming.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-5">Student Requests</h2>
            <div className="space-y-3">
              {pendingIncoming.map(r => (
                <div key={r.id} className="surface-card p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-display font-extrabold shadow-glow">
                      {r.student?.name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{r.student?.name}</p>
                      <p className="text-sm text-slate-500">{r.student?.email}</p>
                      <p className="text-sm text-indigo-700 mt-1">Topic: <span className="font-medium">{r.topic}</span></p>
                      {r.message && <p className="text-xs text-slate-400 mt-0.5 italic">&ldquo;{r.message}&rdquo;</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => respondRequest(r.id, 'rejected')}
                      disabled={respondingId === r.id}
                      className="rounded-full border border-red-200 text-red-600 px-4 py-2 text-xs font-semibold hover:bg-red-50 disabled:opacity-50 transition"
                    >Decline</button>
                    <button
                      onClick={() => respondRequest(r.id, 'accepted')}
                      disabled={respondingId === r.id}
                      className="btn-filled btn-sm"
                    >{respondingId === r.id ? '…' : 'Accept'}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Enrolled students */}
        {enrollments.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-5">Enrolled Students</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {enrollments.map(e => e.student && (
                <div key={e.id} className="surface-card p-5 flex items-center gap-3">
                  <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-display font-extrabold shadow-glow">
                    {e.student.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{e.student.name}</p>
                    <p className="text-xs text-slate-500 truncate">{e.student.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sessions */}
        <section>
          <h2 className="font-display text-xl font-bold text-slate-900 mb-5">Sessions</h2>
          {sessions.length === 0 ? (
            <div className="surface-card p-14 text-center">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="3" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <p className="font-display text-lg font-bold text-slate-900">No sessions yet</p>
              <p className="text-sm text-slate-500 mt-1">Schedule your first session with an enrolled student.</p>
              <button onClick={() => setShowNewSession(true)} className="btn-filled mt-5">+ Schedule a session</button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="surface-card p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-slate-900 truncate">{s.topic}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusStyle(s.status)}`}>{s.status}</span>
                    </div>
                    {s.profiles && <p className="text-sm text-slate-500">Student: {s.profiles.name}</p>}
                    {s.scheduled_at && <p className="text-xs text-slate-400 mt-0.5">{new Date(s.scheduled_at).toLocaleString()}</p>}
                  </div>
                  <Link href={`/session/${s.id}`} className="btn-filled btn-sm shrink-0">
                    {s.status === 'scheduled' ? 'Open' : s.status === 'analysed' ? 'View Results' : 'View'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* New session modal */}
        {showNewSession && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-up">
            <div className="surface-raised p-8 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-slate-900">Schedule a Session</h2>
                <button onClick={() => setShowNewSession(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition flex items-center justify-center">✕</button>
              </div>
              <form onSubmit={createSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Topic</label>
                  <input required value={newTopic} onChange={e => setNewTopic(e.target.value)}
                    className="input-base"
                    placeholder="e.g. Newton's Laws of Motion" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Student</label>
                  <select value={newStudentId} onChange={e => setNewStudentId(e.target.value)} className="input-base">
                    <option value="">— Select enrolled student —</option>
                    {enrollments.map(e => e.student && (
                      <option key={e.id} value={e.student.id}>{e.student.name} ({e.student.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Scheduled Date &amp; Time</label>
                  <input type="datetime-local" value={newScheduledAt} onChange={e => setNewScheduledAt(e.target.value)} className="input-base" />
                </div>
                <div className="flex gap-3 pt-3">
                  <button type="button" onClick={() => setShowNewSession(false)} className="btn-outline flex-1">Cancel</button>
                  <button type="submit" disabled={creating} className="btn-filled flex-1">
                    {creating ? 'Creating…' : 'Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
