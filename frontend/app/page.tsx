import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Header */}
      <header className="px-8 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-2xl font-bold text-indigo-600">SkillMateAI</span>
        <Link
          href="/auth"
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          Get Started
        </Link>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          Powered by Gemma 4
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Every student deserves a teacher<br />
          <span className="text-indigo-600">who never forgets what they struggled with</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          SkillMateAI sits silently in every teaching session — analysing conversations,
          scoring understanding, and generating targeted quiz questions automatically.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth?role=teacher"
            className="bg-indigo-600 text-white px-7 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-lg"
          >
            I&apos;m a Teacher
          </Link>
          <Link
            href="/auth?role=student"
            className="border-2 border-indigo-600 text-indigo-600 px-7 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition text-lg"
          >
            I&apos;m a Student
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 pb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: '🎓',
            title: 'Live Session Analysis',
            desc: 'Gemma 4 reads the full chat transcript and scores student understanding (0–10) with targeted weak-area detection.',
          },
          {
            icon: '📝',
            title: 'Smart Quiz Generation',
            desc: '5 MCQs generated automatically from each session, targeting exactly what the student struggled with.',
          },
          {
            icon: '📚',
            title: 'Self-Study Mode',
            desc: 'Paste any notes or textbook excerpt — Gemma 4 generates a personalised practice set instantly.',
          },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        Built for the Gemma 4 Good Hackathon — Google DeepMind / Kaggle
      </footer>
    </div>
  )
}
