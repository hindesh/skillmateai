'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { apiFetch } from '@/lib/api'
import Navbar from '@/components/Navbar'

interface Session {
  id: string
  teacher_id: string
  student_id: string | null
  topic: string
  status: string
  scheduled_at: string | null
  recording_link: string | null
  transcript: string | null
  session_notes: string | null
  understanding_score: number | null
  profiles?: { name: string; email: string } | null
}

export default function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { profile, loading } = useUser()

  const [session, setSession] = useState<Session | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')

  // Teacher edit state
  const [recordingLink, setRecordingLink] = useState('')
  const [transcript, setTranscript] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<{ questions_generated: number } | null>(null)

  useEffect(() => {
    if (!loading && !profile) router.push('/auth')
  }, [loading, profile, router])

  const load = useCallback(async () => {
    try {
      const s = await apiFetch<Session>(`/sessions/${id}`)
      setSession(s)
      setRecordingLink(s.recording_link || '')
      setTranscript(s.transcript || '')
      setNotes(s.session_notes || '')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load session')
    } finally { setPageLoading(false) }
  }, [id])

  useEffect(() => { if (profile) load() }, [profile, load])

  const saveSession = async () => {
    setSaving(true)
    setError('')
    try {
      const updated = await apiFetch<Session>(`/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          recording_link: recordingLink || null,
          transcript: transcript || null,
          session_notes: notes || null,
        }),
      })
      setSession(updated)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to save') }
    finally { setSaving(false) }
  }

  const generateQuestions = async () => {
    setGenerating(true)
    setError('')
    try {
      await apiFetch(`/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ transcript: transcript || null }),
      })
      const result = await apiFetch<{ questions_generated: number; topic: string }>(`/sessions/${id}/generate`, { method: 'POST' })
      setGenerated(result)
      setSession(prev => prev ? { ...prev, status: 'analysed' } : prev)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to generate questions') }
    finally { setGenerating(false) }
  }

  const generateFromTranscript = async () => {
    if (!transcript.trim()) {
      setError('Paste a transcript in the box above before generating.')
      return
    }
    setGenerating(true)
    setError('')
    try {
      // Save transcript to backend first
      await apiFetch(`/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ transcript }),
      })
      const result = await apiFetch<{ questions_generated: number; topic: string; source: string }>(
        `/sessions/${id}/generate-from-transcript`,
        { method: 'POST', body: JSON.stringify({ transcript }) }
      )
      setGenerated(result)
      setSession(prev => prev ? { ...prev, status: 'analysed' } : prev)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Local AI generation failed') }
    finally { setGenerating(false) }
  }

  const isTeacher = profile?.id === session?.teacher_id

  const statusColor = (s: string) => ({
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-600',
    analysed: 'bg-indigo-100 text-indigo-700',
  }[s] || 'bg-gray-100 text-gray-600')

  if (pageLoading || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading session...</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline mb-6 block">← Dashboard</Link>

        {/* Session header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{session?.topic}</h1>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor(session?.status || '')}`}>{session?.status}</span>
              </div>
              {session?.profiles && (
                <p className="text-sm text-gray-500">
                  {isTeacher ? `Student: ${session.profiles.name}` : `Teacher: ${session.profiles.name}`}
                </p>
              )}
              {session?.scheduled_at && (
                <p className="text-sm text-gray-500 mt-0.5">
                  📅 {new Date(session.scheduled_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            {session?.status === 'analysed' && profile?.role === 'student' && (
              <Link href={`/quiz/${id}`} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700">
                Take Quiz →
              </Link>
            )}
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-700 text-sm">{error}</div>}

        {/* Generated success */}
        {generated && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-6">
            <p className="font-semibold text-indigo-800 mb-1">✓ {generated.questions_generated} Questions Generated</p>
            <p className="text-sm text-indigo-700">Questions have been assigned to the student. They can now take the quiz.</p>
            {session?.student_id && (
              <p className="text-xs text-indigo-600 mt-2">The student will see a "Take Quiz" button on their dashboard.</p>
            )}
          </div>
        )}

        {/* Video call placeholder */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-6 text-center text-white">
          <div className="text-5xl mb-4">🎥</div>
          <h2 className="text-lg font-semibold mb-2">Video Call</h2>
          <p className="text-gray-400 text-sm">Live video & real-time transcription — coming soon</p>
          <p className="text-gray-500 text-xs mt-2">Use Zoom, Google Meet, or any video platform for now</p>
        </div>

        {/* Recording link */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Session Recording</h2>
          <div className="flex gap-3">
            <input
              value={recordingLink}
              onChange={e => setRecordingLink(e.target.value)}
              disabled={!isTeacher}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              placeholder="Paste Zoom / Google Meet recording link here"
            />
            {isTeacher && (
              <button onClick={saveSession} disabled={saving} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
                {saving ? '...' : 'Save'}
              </button>
            )}
          </div>
          {session?.recording_link && (
            <a href={session.recording_link} target="_blank" rel="noopener noreferrer"
              className="inline-block mt-3 text-sm text-indigo-600 hover:underline">
              ▶ Watch Recording →
            </a>
          )}
        </div>

        {/* Transcript */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Session Transcript</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isTeacher ? 'Paste the call transcript — Gemma 4 will analyse it to generate questions' : 'Transcript uploaded by your teacher'}
              </p>
            </div>
            {isTeacher && (
              <button onClick={saveSession} disabled={saving} className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            disabled={!isTeacher}
            rows={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 resize-none font-mono"
            placeholder={isTeacher ? "Paste transcript here…\n\nTeacher: Today we'll cover Newton's Laws of Motion...\nStudent: What is the first law?" : 'No transcript uploaded yet'}
          />
        </div>

        {/* Teacher notes */}
        {isTeacher && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-1">Session Notes</h2>
            <p className="text-xs text-gray-500 mb-4">Private notes visible to the student after the session</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Key takeaways, areas to review, homework..."
            />
            <button onClick={saveSession} disabled={saving} className="mt-3 text-sm border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        )}

        {/* Student: see notes */}
        {!isTeacher && session?.session_notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">📝 Teacher Notes</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{session.session_notes}</p>
          </div>
        )}

        {/* Generate questions — teacher only */}
        {isTeacher && session?.status !== 'analysed' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">✨</div>
              <div className="flex-1">
                <h2 className="font-semibold text-indigo-900 mb-1">Generate Quiz Questions</h2>
                <p className="text-sm text-indigo-700 mb-3">
                  Paste the session transcript above and choose how to generate questions:
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={generateFromTranscript}
                    disabled={generating || !transcript.trim()}
                    className="flex-1 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <><span className="animate-spin">⟳</span> Gemma is thinking...</>
                    ) : (
                      <>🤖 Generate with Local Gemma AI</>
                    )}
                  </button>
                  <button
                    onClick={generateQuestions}
                    disabled={generating}
                    className="flex-1 border border-indigo-300 text-indigo-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-100 disabled:opacity-50"
                  >
                    📋 Use Sample Questions
                  </button>
                </div>
                <p className="text-xs text-indigo-500 mt-2">Local AI uses Gemma 3 1B running on your machine via Ollama — no internet needed.</p>
              </div>
            </div>
          </div>
        )}

        {/* Already analysed */}
        {session?.status === 'analysed' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <h2 className="font-semibold text-green-800 mb-1">✓ Questions Generated</h2>
            <p className="text-sm text-green-700">Quiz questions have been generated for this session.</p>
            {isTeacher && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={generateFromTranscript}
                  disabled={generating || !transcript.trim()}
                  className="text-sm border border-green-400 text-green-700 px-4 py-1.5 rounded-lg hover:bg-green-100 disabled:opacity-50"
                >
                  {generating ? '⟳ Thinking...' : '🤖 Regenerate with Gemma'}
                </button>
                <button
                  onClick={generateQuestions}
                  disabled={generating}
                  className="text-sm border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  📋 Use Sample Questions
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
