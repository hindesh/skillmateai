'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { apiFetch } from '@/lib/api'
import Navbar from '@/components/Navbar'

interface SelfStudyItem {
  id: string
  topic: string
  source_text: string
  created_at: string
  questions: { id: string; status: string }[]
}

interface GenerateResult { id: string; topic: string; questions_generated: number }

export default function SelfStudyPage() {
  const { profile, loading } = useUser()
  const router = useRouter()
  const [items, setItems] = useState<SelfStudyItem[]>([])
  const [sourceText, setSourceText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastGenerated, setLastGenerated] = useState<GenerateResult | null>(null)

  useEffect(() => { if (!loading && !profile) router.push('/auth') }, [loading, profile, router])

  useEffect(() => {
    if (!profile) return
    apiFetch<SelfStudyItem[]>('/self-study').then(setItems).catch((e) => setError(e.message)).finally(() => setPageLoading(false))
  }, [profile])

  const generate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceText.trim()) return
    setGenerating(true)
    setError('')
    setLastGenerated(null)
    try {
      const res = await apiFetch<GenerateResult>('/self-study', {
        method: 'POST',
        body: JSON.stringify({ source_text: sourceText }),
      })
      setLastGenerated(res)
      setSourceText('')
      const updated = await apiFetch<SelfStudyItem[]>('/self-study')
      setItems(updated)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate questions')
    } finally {
      setGenerating(false)
    }
  }

  if (pageLoading || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Self-Study</h1>
        <p className="text-gray-500 text-sm mb-8">Paste any notes or textbook excerpt — Gemma 4 generates 5 targeted practice questions instantly.</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <form onSubmit={generate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Paste your notes or text</label>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={6}
                placeholder="Paste a textbook excerpt, your notes, or describe a topic you want to practice..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{sourceText.length} characters</p>
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

            {lastGenerated && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm font-medium">Generated {lastGenerated.questions_generated} questions on &quot;{lastGenerated.topic}&quot;</p>
                <Link href={`/quiz/${lastGenerated.id}?source=self_study`} className="text-green-700 text-sm underline mt-1 inline-block">Practice now →</Link>
              </div>
            )}

            <button
              type="submit"
              disabled={generating || sourceText.trim().length < 20}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Gemma 4 is generating questions...
                </span>
              ) : 'Generate 5 Questions'}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Question Bank ({items.length} item{items.length !== 1 ? 's' : ''})</h2>
          {items.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-3">📖</p>
              <p className="font-medium">Your question bank is empty</p>
              <p className="text-sm mt-1">Generate your first set above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:border-indigo-200 transition">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.topic}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.questions?.length || 0} questions • {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{item.source_text.slice(0, 80)}...</p>
                  </div>
                  <Link href={`/quiz/${item.id}?source=self_study`} className="ml-4 shrink-0 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700">
                    Practice
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
