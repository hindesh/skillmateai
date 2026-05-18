'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { apiFetch } from '@/lib/api'
import Navbar from '@/components/Navbar'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ChartPoint { date: string; topic: string; score: number; total: number; percentage: number }
interface ProgressData { chart_data: ChartPoint[]; feedback: string | null; total_attempts: number }

const COLORS = ['#5890FE', '#7C5CFF', '#FF5DA2', '#10B981', '#FFB454', '#1FC8C8']

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

  const chartDataByDate = data?.chart_data.reduce<Record<string, Record<string, number | string>>>((acc, p) => {
    if (!acc[p.date]) acc[p.date] = { date: p.date }
    acc[p.date][p.topic] = p.percentage
    return acc
  }, {}) || {}

  const chartPoints = Object.values(chartDataByDate).sort((a, b) => String(a.date).localeCompare(String(b.date)))

  const avgScore = data && data.chart_data.length > 0
    ? Math.round(data.chart_data.reduce((s, d) => s + d.percentage, 0) / data.chart_data.length)
    : 0

  const bestTopic = (() => {
    if (!data || data.chart_data.length === 0) return null
    const byTopic: Record<string, { sum: number; n: number }> = {}
    for (const d of data.chart_data) {
      byTopic[d.topic] = byTopic[d.topic] || { sum: 0, n: 0 }
      byTopic[d.topic].sum += d.percentage
      byTopic[d.topic].n += 1
    }
    let best: { topic: string; avg: number } | null = null
    for (const [t, v] of Object.entries(byTopic)) {
      const avg = v.sum / v.n
      if (!best || avg > best.avg) best = { topic: t, avg: Math.round(avg) }
    }
    return best
  })()

  if (pageLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar profile={profile} />
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Hero header */}
        <section className="relative overflow-hidden rounded-4xl bg-mesh-blue p-8 md:p-10 mb-10 shadow-m3-3 animate-fade-up">
          <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
          <div className="blob top-[-4rem] right-[-3rem] w-72 h-72 bg-pink-400/30" />
          <div className="blob bottom-[-6rem] left-[-3rem] w-80 h-80 bg-violet-400/30" style={{ animationDelay: '5s' }} />

          <div className="relative">
            <span className="chip-dark mb-3">Your learning journey</span>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
              Progress &amp; insights
            </h1>
            <p className="text-white/75 text-sm md:text-base max-w-lg">
              Quiz performance across topics, and personalised feedback from Gemma 4.
            </p>
          </div>
        </section>

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 mb-6 text-red-700 text-sm">{error}</div>
        )}

        {/* Gemma 4 feedback card */}
        {data?.feedback && (
          <div className="relative overflow-hidden surface-dark p-1 mb-10 animate-fade-up">
            <div className="rounded-[1.85rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-7 md:p-8 text-white relative">
              <div className="blob -top-16 -right-16 w-64 h-64 bg-violet-500/30" />
              <div className="relative flex items-start gap-5">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-glow">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-1">Gemma 4 Feedback</p>
                  <p className="text-white/90 leading-relaxed text-base">{data.feedback}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {!data?.feedback && data && data.total_attempts < 2 && (
          <div className="surface-card p-7 mb-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-3">
              <span className="text-xl">✨</span>
            </div>
            <p className="text-slate-700 font-semibold">AI feedback unlocks soon</p>
            <p className="text-sm text-slate-500 mt-1">Complete at least 2 quizzes and Gemma 4 will write personalised feedback here.</p>
          </div>
        )}

        {/* KPI stats */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Total Attempts', value: data.total_attempts, tone: 'from-indigo-500 to-indigo-700' },
              { label: 'Topics Covered', value: topics.length, tone: 'from-violet-500 to-indigo-600' },
              { label: 'Avg Score', value: data.chart_data.length > 0 ? `${avgScore}%` : '—', tone: 'from-pink-500 to-violet-600' },
              { label: 'Strongest', value: bestTopic ? `${bestTopic.avg}%` : '—', sub: bestTopic?.topic, tone: 'from-emerald-500 to-teal-500' },
            ].map((stat) => (
              <div key={stat.label} className="surface-raised p-6 relative overflow-hidden">
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${stat.tone} opacity-10 blur-2xl`} />
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{stat.label}</p>
                <p className={`font-display text-3xl md:text-4xl font-extrabold mt-2 bg-gradient-to-br ${stat.tone} bg-clip-text text-transparent`}>{stat.value}</p>
                {stat.sub && <p className="text-xs text-slate-500 mt-1 truncate">{stat.sub}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        {data && chartPoints.length > 0 ? (
          <div className="surface-raised p-6 md:p-8 mb-8">
            <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
              <h2 className="font-display text-lg md:text-xl font-bold text-slate-900">Score over time</h2>
              <span className="text-xs text-slate-500">Percentage correct per topic</span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  {topics.map((topic, i) => (
                    <linearGradient key={topic} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#5B6280' }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#5B6280' }} unit="%" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                  formatter={(val: number) => [`${val}%`]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                {topics.map((topic, i) => (
                  <Area
                    key={topic}
                    type="monotone"
                    dataKey={topic}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2.5}
                    fill={`url(#grad-${i})`}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
                    connectNulls
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : data && (
          <div className="surface-card p-14 text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-5" />
              </svg>
            </div>
            <p className="font-display text-lg font-bold text-slate-900">No quiz attempts yet</p>
            <p className="text-sm text-slate-500 mt-1">Take a quiz to start tracking your progress.</p>
          </div>
        )}

        {/* Recent attempts table */}
        {data && data.chart_data.length > 0 && (
          <div className="surface-raised overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900">Recent Attempts</h3>
              <span className="text-xs text-slate-500">Last 10</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/60 text-xs text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Date</th>
                    <th className="px-6 py-3 text-left font-semibold">Topic</th>
                    <th className="px-6 py-3 text-right font-semibold">Score</th>
                    <th className="px-6 py-3 text-right font-semibold">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...data.chart_data].reverse().slice(0, 10).map((d, i) => (
                    <tr key={i} className="hover:bg-indigo-50/40 transition">
                      <td className="px-6 py-3 text-slate-600">{d.date}</td>
                      <td className="px-6 py-3 text-slate-900 font-medium">{d.topic}</td>
                      <td className="px-6 py-3 text-right text-slate-600 tabular-nums">{d.score}/{d.total}</td>
                      <td className="px-6 py-3 text-right tabular-nums">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          d.percentage >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : d.percentage >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {d.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
