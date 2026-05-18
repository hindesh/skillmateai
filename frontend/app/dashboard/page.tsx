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
      // Load all public teachers immediately
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

  const statusColor = (s: string) => ({
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-600',
    analysed: 'bg-indigo-100 text-indigo-700',
  }[s] || 'bg-gray-100 text-gray-600')

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)
    return match ? match[1] : null
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  if (!profile) return null

  // ── STUDENT DASHBOARD ─────────────────────────────────────────────────────
  if (profile.role === 'student') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar profile={profile} />
        <main className="max-w-5xl mx-auto px-6 py-10">

          {/* Hero discovery bar */}
          <div className="bg-indigo-600 rounded-2xl p-7 mb-8 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">Find your perfect teacher</h1>
                <p className="text-indigo-200 text-sm">Browse all educators or search by subject</p>
              </div>
              {profile?.grade_level && (
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
                  {profile.grade_level}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                placeholder="Search by subject, topic or teacher name…"
                className="w-full bg-white text-gray-900 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              {query && (
                <button onClick={() => handleQueryChange('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-sm">✕</button>
              )}
            </div>
          </div>

          {/* Teacher results */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {teachersLoading ? 'Loading teachers...' : query
                ? `${teachers.length} result${teachers.length !== 1 ? 's' : ''} for "${query}"`
                : `${teachers.length} teacher${teachers.length !== 1 ? 's' : ''} available`}
            </h2>
            {teachersLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1,2].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-200 h-48 animate-pulse" />)}
              </div>
            )}
            {!teachersLoading && teachers.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p>No teachers match your search. Try a broader term like &quot;Physics&quot; or clear the search to see all.</p>
              </div>
            )}
            {!teachersLoading && teachers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {teachers.map(t => {
                  const alreadyRequested = requestedIds.has(t.id)
                  const firstSample = t.youtube_samples?.[0]
                  const ytId = firstSample ? extractYouTubeId(firstSample.url) : null
                  return (
                    <div key={t.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-indigo-300 transition">
                      {ytId && (
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}`}
                          className="w-full aspect-video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={firstSample?.title || 'Teaching sample'}
                        />
                      )}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900">{t.name}</h3>
                            {t.price_per_hour && <p className="text-sm text-indigo-600 font-semibold">${t.price_per_hour}/hr</p>}
                          </div>
                          <Link href={`/teachers/${t.id}`} className="text-xs text-indigo-600 hover:underline">View profile →</Link>
                        </div>
                        {t.bio && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{t.bio}</p>}
                        {t.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {t.expertise.map(e => (
                              <span key={e} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{e}</span>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => sendRequest(t.id)}
                          disabled={alreadyRequested || requestingId === t.id}
                          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${alreadyRequested ? 'bg-green-50 text-green-700 border border-green-200 cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'}`}
                        >
                          {alreadyRequested ? '✓ Request Sent' : requestingId === t.id ? 'Sending...' : 'Request Session'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* My Teachers */}
          {myEnrollments.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4">My Teachers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {myEnrollments.map(e => e.teacher && (
                  <Link key={e.id} href={`/teachers/${e.teacher.id}`} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 transition">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg mb-3">
                      {e.teacher.name[0]}
                    </div>
                    <p className="font-semibold text-gray-900">{e.teacher.name}</p>
                    {e.teacher.expertise.length > 0 && <p className="text-xs text-gray-500 mt-1">{e.teacher.expertise.slice(0,2).join(', ')}</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* My Sessions */}
          {sessions.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4">My Sessions</h2>
              <div className="space-y-3">
                {sessions.map(s => (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{s.topic}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(s.status)}`}>{s.status}</span>
                      </div>
                      {s.profiles && <p className="text-sm text-gray-500">Teacher: {s.profiles.name}</p>}
                      {s.scheduled_at && <p className="text-xs text-gray-400 mt-0.5">{new Date(s.scheduled_at).toLocaleString()}</p>}
                    </div>
                    {s.status === 'analysed' && (
                      <Link href={`/quiz/${s.id}`} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700">Take Quiz →</Link>
                    )}
                    {s.status !== 'analysed' && (
                      <Link href={`/session/${s.id}`} className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50">View</Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending requests */}
          {myRequests.filter(r => r.status === 'pending').length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Requests</h2>
              <div className="space-y-3">
                {myRequests.filter(r => r.status === 'pending').map(r => (
                  <div key={r.id} className="bg-white rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                    <p className="font-medium text-gray-900">{r.topic}</p>
                    <p className="text-sm text-gray-500">To: {r.teacher?.name} · <span className="text-yellow-600">Awaiting response</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }

  // ── TEACHER DASHBOARD ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {profile?.name}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/setup" className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50">Edit Profile</Link>
            <button onClick={() => setShowNewSession(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">+ Schedule Session</button>
          </div>
        </div>

        {/* Profile setup banner */}
        {teacherIsPublic === false && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-amber-800">Your profile is not visible to students yet</p>
              <p className="text-sm text-amber-600 mt-0.5">Complete your teacher profile and enable it so students can discover and request sessions with you.</p>
            </div>
            <Link href="/setup" className="ml-4 shrink-0 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600">
              Set Up Profile →
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Students', value: enrollments.length },
            { label: 'Pending Requests', value: incomingRequests.filter(r => r.status === 'pending').length },
            { label: 'Sessions', value: sessions.length },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Incoming requests */}
        {incomingRequests.filter(r => r.status === 'pending').length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Student Requests</h2>
            <div className="space-y-3">
              {incomingRequests.filter(r => r.status === 'pending').map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{r.student?.name}</p>
                    <p className="text-sm text-gray-500">{r.student?.email}</p>
                    <p className="text-sm text-indigo-700 mt-1">Topic: {r.topic}</p>
                    {r.message && <p className="text-xs text-gray-400 mt-0.5 italic">"{r.message}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondRequest(r.id, 'rejected')}
                      disabled={respondingId === r.id}
                      className="border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50"
                    >Decline</button>
                    <button
                      onClick={() => respondRequest(r.id, 'accepted')}
                      disabled={respondingId === r.id}
                      className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                    >{respondingId === r.id ? '...' : 'Accept'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enrolled students */}
        {enrollments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Enrolled Students</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {enrollments.map(e => e.student && (
                <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mb-2">
                    {e.student.name[0]}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{e.student.name}</p>
                  <p className="text-xs text-gray-500">{e.student.email}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sessions */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sessions</h2>
          {sessions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
              <p className="text-4xl mb-3">📅</p>
              <p className="font-medium">No sessions yet</p>
              <p className="text-sm mt-1">Schedule a session with an enrolled student.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{s.topic}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(s.status)}`}>{s.status}</span>
                    </div>
                    {s.profiles && <p className="text-sm text-gray-500">Student: {s.profiles.name}</p>}
                    {s.scheduled_at && <p className="text-xs text-gray-400 mt-0.5">{new Date(s.scheduled_at).toLocaleString()}</p>}
                  </div>
                  <Link href={`/session/${s.id}`} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700">
                    {s.status === 'scheduled' ? 'Open Session' : s.status === 'analysed' ? 'View Results' : 'View'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New session modal */}
        {showNewSession && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-7 w-full max-w-md">
              <h2 className="text-lg font-bold mb-5">Schedule a Session</h2>
              <form onSubmit={createSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
                  <input required value={newTopic} onChange={e => setNewTopic(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Newton's Laws of Motion" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <select value={newStudentId} onChange={e => setNewStudentId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">— Select enrolled student —</option>
                    {enrollments.map(e => e.student && (
                      <option key={e.id} value={e.student.id}>{e.student.name} ({e.student.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time</label>
                  <input type="datetime-local" value={newScheduledAt} onChange={e => setNewScheduledAt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowNewSession(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={creating} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                    {creating ? 'Creating...' : 'Schedule'}
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
