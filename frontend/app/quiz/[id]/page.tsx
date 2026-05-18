'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
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
}

interface QuizResult {
  score: number
  total: number
  percentage: number
  results: {
    question_id: string
    content: string
    options: string[]
    selected: string
    correct_answer: string
    is_correct: boolean
    explanation: string
    topic: string
  }[]
}

function QuizContent() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { profile, loading } = useUser()
  const [questions, setQuestions] = useState<Question[]>([])
  const [sessionTopic, setSessionTopic] = useState('Quiz')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !profile) router.push('/auth')
  }, [loading, profile, router])

  const loadQuestions = useCallback(async () => {
    try {
      const qs = await apiFetch<Question[]>(`/questions/session/${id}`)
      setQuestions(qs)
      if (qs.length > 0) setSessionTopic(qs[0].topic)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load quiz')
    } finally { setPageLoading(false) }
  }, [id])

  useEffect(() => { if (profile) loadQuestions() }, [profile, loadQuestions])

  const selectAnswer = (questionId: string, letter: string) => {
    if (result) return
    setAnswers(prev => ({ ...prev, [questionId]: letter }))
  }

  const submitQuiz = async () => {
    if (submitting) return
    const unanswered = questions.filter(q => !answers[q.id])
    if (unanswered.length > 0) { setError(`Please answer all ${unanswered.length} remaining question(s)`); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await apiFetch<QuizResult>('/quizzes/submit', {
        method: 'POST',
        body: JSON.stringify({
          session_id: id,
          topic: sessionTopic,
          question_ids: questions.map(q => q.id),
          answers,
        }),
      })
      setResult(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to submit quiz')
    } finally { setSubmitting(false) }
  }

  if (pageLoading || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading quiz...</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline mb-6 block">← Dashboard</Link>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📝</span>
            <h1 className="text-xl font-bold text-gray-900">{sessionTopic}</h1>
          </div>
          <p className="text-sm text-gray-500">{questions.length} questions · Generated from session transcript</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-700 text-sm">{error}</div>}

        {result && (
          <div className={`rounded-xl p-6 mb-6 text-center border ${result.percentage >= 70 ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}>
            <p className={`text-5xl font-extrabold mb-2 ${result.percentage >= 70 ? 'text-green-600' : 'text-orange-500'}`}>{result.percentage}%</p>
            <p className="text-lg font-semibold text-gray-800">{result.score} / {result.total} correct</p>
            <p className={`text-sm mt-1 ${result.percentage >= 70 ? 'text-green-700' : 'text-orange-700'}`}>
              {result.percentage >= 80 ? 'Excellent work!' : result.percentage >= 60 ? 'Good effort — keep practising!' : 'Review the explanations below.'}
            </p>
            <div className="flex gap-3 justify-center mt-4">
              <Link href="/progress" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">View Progress</Link>
              <button onClick={() => { setResult(null); setAnswers({}) }} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">Retake</button>
            </div>
          </div>
        )}

        {questions.length === 0 && !error && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">No questions yet</p>
            <p className="text-sm mt-1">Your teacher hasn't generated questions for this session yet.</p>
          </div>
        )}

        <div className="space-y-5">
          {questions.map((q, idx) => {
            const selected = answers[q.id]
            const res = result?.results.find(r => r.question_id === q.id)
            return (
              <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-gray-400">Q{idx + 1}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{q.topic}</span>
                  <span className="text-xs text-gray-400">{q.difficulty}</span>
                  {res && <span className={`ml-auto text-xs font-semibold ${res.is_correct ? 'text-green-600' : 'text-red-600'}`}>{res.is_correct ? '✓ Correct' : '✗ Incorrect'}</span>}
                </div>
                <p className="text-gray-900 font-medium mb-4">{q.content}</p>
                <div className="space-y-2">
                  {q.options.map(opt => {
                    const letter = opt.charAt(0)
                    const isSelected = selected === letter
                    const isCorrect = letter === q.correct_answer
                    let cls = 'border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer'
                    if (result) {
                      if (isCorrect) cls = 'border-green-400 bg-green-50 text-green-800 font-medium cursor-default'
                      else if (isSelected) cls = 'border-red-400 bg-red-50 text-red-700 cursor-default'
                      else cls = 'border-gray-200 text-gray-400 cursor-default'
                    } else if (isSelected) {
                      cls = 'border-indigo-500 bg-indigo-50 text-indigo-800 font-medium'
                    }
                    return (
                      <div key={opt} onClick={() => selectAnswer(q.id, letter)} className={`border rounded-lg px-4 py-2.5 text-sm transition ${cls}`}>{opt}</div>
                    )
                  })}
                </div>
                {result && res && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600"><span className="font-semibold">Explanation:</span> {q.explanation}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {!result && questions.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-3 text-center">{Object.keys(answers).length} / {questions.length} answered</p>
            <button onClick={submitQuiz} disabled={submitting || Object.keys(answers).length < questions.length}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <QuizContent />
    </Suspense>
  )
}
