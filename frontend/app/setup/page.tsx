'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { apiFetch } from '@/lib/api'
import Navbar from '@/components/Navbar'

interface Sample { title: string; url: string }

export default function SetupPage() {
  const { profile, loading } = useUser()
  const router = useRouter()

  const [bio, setBio] = useState('')
  const [expertise, setExpertise] = useState('')
  const [pricePerHour, setPricePerHour] = useState('')
  const [maxStudents, setMaxStudents] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [samples, setSamples] = useState<Sample[]>([{ title: '', url: '' }])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !profile) router.push('/auth')
    if (!loading && profile?.role !== 'teacher') router.push('/dashboard')
  }, [loading, profile, router])

  useEffect(() => {
    if (!profile || profile.role !== 'teacher') return
    apiFetch<{
      bio: string | null
      expertise: string[]
      youtube_samples: Sample[]
      price_per_hour: number | null
      max_students: number | null
      is_public: boolean
    }>('/profile/teacher/me').then(data => {
      setBio(data.bio || '')
      setExpertise((data.expertise || []).join(', '))
      setPricePerHour(data.price_per_hour?.toString() || '')
      setMaxStudents(data.max_students?.toString() || '')
      setIsPublic(data.is_public || false)
      setSamples(data.youtube_samples?.length ? data.youtube_samples : [{ title: '', url: '' }])
    }).catch(() => {})
  }, [profile])

  const addSample = () => setSamples(prev => [...prev, { title: '', url: '' }])
  const removeSample = (i: number) => setSamples(prev => prev.filter((_, idx) => idx !== i))
  const updateSample = (i: number, field: keyof Sample, value: string) => {
    setSamples(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const expertiseList = expertise.split(',').map(s => s.trim()).filter(Boolean)
      const validSamples = samples.filter(s => s.url.trim())
      await apiFetch('/profile/teacher', {
        method: 'PUT',
        body: JSON.stringify({
          bio: bio || null,
          expertise: expertiseList,
          youtube_samples: validSamples,
          price_per_hour: pricePerHour ? parseFloat(pricePerHour) : null,
          max_students: maxStudents ? parseInt(maxStudents) : null,
          is_public: isPublic,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Teacher Profile Setup</h1>
          <p className="text-gray-500 text-sm mt-1">Complete your public profile so students can discover and request your sessions</p>
        </div>

        <form onSubmit={save} className="space-y-6">

          {/* Visibility toggle */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Public Profile</p>
                <p className="text-sm text-gray-500 mt-0.5">When enabled, students can find and request sessions with you</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(p => !p)}
                className={`relative inline-flex w-12 h-6 rounded-full transition-colors ${isPublic ? 'bg-indigo-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">About You</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Tell students about your teaching style, background and experience..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subjects / Expertise</label>
              <input
                value={expertise}
                onChange={e => setExpertise(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Physics, Mathematics, Newton's Laws, Calculus (comma-separated)"
              />
              <p className="text-xs text-gray-400 mt-1">Students search by these — be specific</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Availability & Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per hour (USD)</label>
                <input
                  type="number" min="0" step="0.01"
                  value={pricePerHour}
                  onChange={e => setPricePerHour(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max students</label>
                <input
                  type="number" min="1"
                  value={maxStudents}
                  onChange={e => setMaxStudents(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 10"
                />
              </div>
            </div>
          </div>

          {/* YouTube samples */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Teaching Samples</h2>
                <p className="text-sm text-gray-500 mt-0.5">Add YouTube video links — students will see these on your profile</p>
              </div>
              <button type="button" onClick={addSample} className="text-sm text-indigo-600 hover:underline font-medium">+ Add video</button>
            </div>
            {samples.map((s, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Sample {i + 1}</span>
                  {samples.length > 1 && (
                    <button type="button" onClick={() => removeSample(i)} className="text-xs text-red-500 hover:underline">Remove</button>
                  )}
                </div>
                <input
                  value={s.title}
                  onChange={e => updateSample(i, 'title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Title (e.g. Introduction to Newton's Laws)"
                />
                <input
                  value={s.url}
                  onChange={e => updateSample(i, 'url', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="YouTube URL (e.g. https://youtu.be/abc123)"
                />
                {s.url && (() => {
                  const match = s.url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)
                  return match ? (
                    <iframe src={`https://www.youtube.com/embed/${match[1]}`} className="w-full aspect-video rounded-lg" allowFullScreen title="preview" />
                  ) : null
                })()}
              </div>
            ))}
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}

          <div className="flex gap-3">
            <button type="button" onClick={() => router.push('/dashboard')} className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Back to Dashboard
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Profile'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
