'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { apiFetch } from '@/lib/api'
import Navbar from '@/components/Navbar'

interface Question {
  id: string
  content: string
  options: string[]
  correct_answer: string
  explanation: string
  topic: string
  difficulty: string
  status: 'pending' | 'approved' | 'rejected'
}

interface Session {
  id: string
  topic: string
  understanding_score: number | null
  weak_topics: string[] | null
}

export default function ApprovePage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const router = useRouter()
  const { profile, loading } = useUser()
  const [session, setSession] = useState<Session | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'teacher')) router.push('/dashboard')
  }, [loading, profile, router])

  const loadData = useCallback(async () => {
    try {
      const [sess, qs] = await Promise.all([
        apiFetch<Session>(`/sessions/${sessionId}`),
        apiFetch<Question[]>(`/questions/session/${sessionId}`),
      ])
      setSession(sess)
      setQuestions(qs)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setPageLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (profile?.role === 'teacher') loadData()
  }, [profile, loadData])

  const setStatus = async (questionId: string, status: 'approved' | 'rejected') => {
    setApproving(questionId)
    try {
      await apiFetch(`/questions/${questionId}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setQuestions((prev) => prev.map((q) => q.id === questionId ? { ...q, status } : q))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update question')
    } finally {
      setApproving(null)
    }
  }

  const difficultyColor = (d: string) => ({ easy: 'text-green-600 bg-green-50', medium: 'text-yellow-600 bg-yellow-50', hard: 'text-red-600 bg-red-50' }[d] || 'text-gray-600 bg-gray-50')

  if (pageLoading || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>

  const approvedCount = questions.filter((q) => q.status === 'approved').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline mb-6 block">← Back to Dashboard</Link>

        {session && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Review Questions — {session.topic}</h1>
            {session.understanding_score !== null && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-indigo-600">{session.understanding_score}/10</p>
                  <p className="text-sm text-indigo-700 mt-1">Understanding Score</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-orange-700 mb-1">Weak Areas</p>
                  {session.weak_topics?.length ? (
                    <ul className="text-sm text-orange-800 space-y-0.5">{session.weak_topics.map((t) => <li key={t}>• {t}</li>)}</ul>
                  ) : <p className="text-sm text-orange-600">None identified</p>}
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500">{approvedCount}/{questions.length} questions approved</p>
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-700 text-sm">{error}</div>}

        <div className="space-y-5">
          {questions.map((q, idx) => (
            <div key={q.id} className={`bg-white rounded-xl border p-5 transition ${q.status === 'approved' ? 'border-green-300' : q.status === 'rejected' ? 'border-red-200 opacity-60' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-500">Q{idx + 1}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${difficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                  <span className="text-xs text-gray-400">{q.topic}</span>
                </div>
                <div className="flex gap-2">
                  {q.status === 'pending' && (
                    <>
                      <button onClick={() => setStatus(q.id, 'rejected')} disabled={approving === q.id} className="border border-red-300 text-red-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50">Reject</button>
                      <button onClick={() => setStatus(q.id, 'approved')} disabled={approving === q.id} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50">
                        {approving === q.id ? '...' : 'Approve'}
                      </button>
                    </>
                  )}
                  {q.status === 'approved' && <span className="text-green-600 text-xs font-semibold bg-green-50 px-3 py-1 rounded-lg">Approved</span>}
                  {q.status === 'rejected' && <button onClick={() => setStatus(q.id, 'approved')} className="text-gray-500 text-xs font-medium hover:text-green-600">Undo rejection</button>}
                </div>
              </div>
              <p className="text-gray-900 font-medium mb-3">{q.content}</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {q.options.map((opt) => (
                  <div key={opt} className={`text-sm px-3 py-2 rounded-lg border ${opt.startsWith(q.correct_answer + '.') ? 'border-green-400 bg-green-50 text-green-800 font-medium' : 'border-gray-200 text-gray-700'}`}>
                    {opt}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 italic"><span className="font-semibold not-italic text-gray-600">Explanation:</span> {q.explanation}</p>
            </div>
          ))}
        </div>

        {questions.length === 0 && <p className="text-center text-gray-400 py-12">No questions generated for this session.</p>}
        {approvedCount > 0 && (
          <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
            <p className="text-indigo-800 font-medium text-sm">{approvedCount} question{approvedCount !== 1 ? 's' : ''} approved and sent to the student.</p>
          </div>
        )}
      </main>
    </div>
  )
}
