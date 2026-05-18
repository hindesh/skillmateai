'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

export default function TeacherProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { profile, loading } = useUser()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState(false)
  const [topic, setTopic] = useState('')
  const [showRequest, setShowRequest] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !profile) router.push('/auth')
  }, [loading, profile, router])

  useEffect(() => {
    apiFetch<Teacher>(`/teachers/${id}`)
      .then(setTeacher)
      .catch(() => setError('Teacher not found'))
      .finally(() => setPageLoading(false))
  }, [id])

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setRequesting(true)
    setError('')
    try {
      await apiFetch('/requests', {
        method: 'POST',
        body: JSON.stringify({ teacher_id: id, topic, message: `I need help with: ${topic}` }),
      })
      setRequested(true)
      setShowRequest(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send request')
    } finally { setRequesting(false) }
  }

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)
    return match ? match[1] : null
  }

  if (pageLoading || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  if (!teacher) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Teacher not found</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} />
      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold">
                {teacher.name[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  {teacher.price_per_hour && (
                    <span className="text-indigo-600 font-semibold text-sm">${teacher.price_per_hour}/hr</span>
                  )}
                  {teacher.max_students && (
                    <span className="text-gray-500 text-sm">Up to {teacher.max_students} students</span>
                  )}
                </div>
              </div>
            </div>
            {profile?.role === 'student' && (
              <div>
                {requested ? (
                  <span className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-xl text-sm font-semibold">✓ Request Sent</span>
                ) : (
                  <button onClick={() => setShowRequest(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700">
                    Request Session
                  </button>
                )}
              </div>
            )}
          </div>

          {teacher.bio && (
            <p className="text-gray-600 mt-5 leading-relaxed">{teacher.bio}</p>
          )}

          {teacher.expertise.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {teacher.expertise.map(e => (
                <span key={e} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">{e}</span>
              ))}
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-700 text-sm">{error}</div>}

        {/* Teaching samples */}
        {teacher.youtube_samples.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Teaching Samples</h2>
            <div className="space-y-5">
              {teacher.youtube_samples.map((sample, i) => {
                const ytId = extractYouTubeId(sample.url)
                return ytId ? (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={sample.title || `Sample ${i + 1}`}
                    />
                    {sample.title && (
                      <div className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-700">{sample.title}</p>
                      </div>
                    )}
                  </div>
                ) : null
              })}
            </div>
          </div>
        )}

        {teacher.youtube_samples.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            <p className="text-4xl mb-3">🎥</p>
            <p>No teaching samples uploaded yet</p>
          </div>
        )}
      </main>

      {/* Request modal */}
      {showRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-7 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Request a Session</h2>
            <p className="text-sm text-gray-500 mb-5">Tell {teacher.name} what you need help with</p>
            <form onSubmit={sendRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Subject *</label>
                <input
                  required
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Newton's Laws of Motion"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowRequest(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={requesting} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {requesting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
