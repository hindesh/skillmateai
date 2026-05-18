'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { apiFetch } from '@/lib/api'
import Navbar from '@/components/Navbar'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartPoint { date: string; topic: string; score: number; total: number; percentage: number }
interface ProgressData { chart_data: ChartPoint[]; feedback: string | null; total_attempts: number }

export default function ProgressPage() {
  const { profile, loading } = useUser()
  const router = useRouter()
  const [data, setData] = useState<ProgressData | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { if (!loading && !profile) router.push('/auth') }, [loading, profile, router])

  useEffect(() => {
    if (!profile) return
    apiFetch<ProgressData>('/progress').then(setData).catch((e) => setError(e.message)).finally(() => setPageLoading(false))
  }, [profile])

  const topics = data ? [...new Set(data.chart_data.map((d) => d.topic))] : []
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  const chartDataByDate = data?.chart_data.reduce<Record<string, Record<string, number | string>>>((acc, p) => {
    if (!acc[p.date]) acc[p.date] = { date: p.date }
    acc[p.date][p.topic] = p.percentage
    return acc
  }, {}) || {}

  const chartPoints = Object.values(chartDataByDate).sort((a, b) => String(a.date).localeCompare(String(b.date)))

  if (pageLoading || loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Progress</h1>
        <p className="text-gray-500 text-sm mb-8">Quiz performance over time across all topics</p>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-700 text-sm">{error}</div>}

        {data?.feedback && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🤖</span>
              <p className="text-sm font-semibold text-indigo-800">Gemma 4 Feedback</p>
            </div>
            <p className="text-indigo-900 text-sm leading-relaxed">{data.feedback}</p>
          </div>
        )}
        {!data?.feedback && data && data.total_attempts < 2 && (
          <div className="bg-gray-100 rounded-xl p-5 mb-8 text-center text-gray-500 text-sm">Complete at least 2 quizzes to get personalised AI feedback.</div>
        )}

        {data && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Attempts', value: data.total_attempts },
              { label: 'Topics Covered', value: topics.length },
              { label: 'Avg Score', value: data.chart_data.length > 0 ? `${Math.round(data.chart_data.reduce((s, d) => s + d.percentage, 0) / data.chart_data.length)}%` : '0%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {data && chartPoints.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-6">Score Over Time (%)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(val: number) => [`${val}%`]} />
                <Legend />
                {topics.map((topic, i) => (
                  <Line key={topic} type="monotone" dataKey={topic} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            <p className="text-5xl mb-4">📊</p>
            <p className="font-medium">No quiz attempts yet</p>
            <p className="text-sm mt-1">Take a quiz to see your progress here.</p>
          </div>
        )}

        {data && data.chart_data.length > 0 && (
          <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100"><h3 className="text-sm font-semibold text-gray-800">Recent Attempts</h3></div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-5 py-2 text-left">Date</th>
                  <th className="px-5 py-2 text-left">Topic</th>
                  <th className="px-5 py-2 text-right">Score</th>
                  <th className="px-5 py-2 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...data.chart_data].reverse().slice(0, 10).map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-2.5 text-gray-600">{d.date}</td>
                    <td className="px-5 py-2.5 text-gray-800">{d.topic}</td>
                    <td className="px-5 py-2.5 text-right text-gray-600">{d.score}/{d.total}</td>
                    <td className={`px-5 py-2.5 text-right font-semibold ${d.percentage >= 70 ? 'text-green-600' : 'text-orange-500'}`}>{d.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
