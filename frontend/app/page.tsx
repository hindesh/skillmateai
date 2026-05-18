import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ───────── Top Nav (transparent on landing) ───────── */}
      <header className="sticky top-0 z-40 px-4 pt-4">
        <nav className="mx-auto max-w-6xl flex items-center justify-between gap-4 rounded-full border border-slate-200/70 bg-white/70 px-3 py-2 shadow-m3-1 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2.5 pl-2 group">
            <span className="relative inline-flex">
              <span className="absolute inset-0 rounded-full bg-indigo-400/40 blur-md group-hover:bg-indigo-400/60 transition" aria-hidden />
              <svg width="30" height="30" viewBox="0 0 32 32" className="relative">
                <defs>
                  <linearGradient id="logo-grad-land" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#5890FE" />
                    <stop offset="100%" stopColor="#7C5CFF" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="16" fill="url(#logo-grad-land)" />
                <polyline
                  points="8,17 13,22 24,10"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
            <span className="font-display text-lg font-bold text-slate-900 tracking-tight">
              SkillMate<span className="text-gradient">AI</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <a href="#how" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">How it works</a>
            <a href="#features" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">Features</a>
            <a href="#gemma" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">Gemma 4</a>
          </div>
          <div className="flex items-center gap-2 pr-1">
            <Link href="/auth" className="btn-ghost">Sign in</Link>
            <Link href="/auth" className="btn-filled btn-sm">Get started</Link>
          </div>
        </nav>
      </header>

      {/* ───────── Hero ───────── */}
      <section className="relative pt-20 pb-32">
        {/* Mesh + grid background */}
        <div className="absolute inset-0 -z-10 bg-grid" />
        <div className="absolute inset-0 -z-10 bg-brand-radial" />
        <div className="blob -z-10 -top-20 -left-20 w-[28rem] h-[28rem] bg-indigo-300/40" />
        <div className="blob -z-10 top-40 -right-32 w-[32rem] h-[32rem] bg-violet-300/30" style={{ animationDelay: '4s' }} />

        <div className="mx-auto max-w-6xl px-6 text-center animate-fade-up">
          <div className="chip-gradient mx-auto mb-7">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
            </span>
            Powered by Gemma 4 · Built for Gemma 4 Good Hackathon
          </div>

          <h1 className="display-xl text-slate-900 mb-7">
            Every student deserves a teacher
            <br />
            <span className="text-gradient">who never forgets</span> what they struggled with.
          </h1>

          <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-600 leading-relaxed mb-10">
            SkillMateAI sits silently inside every teaching session — analysing the conversation,
            scoring understanding, and generating personalised quizzes from <em>what was actually taught</em>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link href="/auth?role=teacher" className="btn-filled !px-7 !py-3.5 text-base">
              I&apos;m a Teacher
              <span aria-hidden>→</span>
            </Link>
            <Link href="/auth?role=student" className="btn-tonal !px-7 !py-3.5 text-base">
              I&apos;m a Student
            </Link>
          </div>

          <p className="text-xs text-slate-500 mb-16">
            Free during the hackathon · No credit card · Open source on GitHub
          </p>

          {/* Hero device mockup */}
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-brand-gradient opacity-40 blur-2xl" />
            <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 backdrop-blur-sm shadow-m3-4 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/60">
                <span className="w-3 h-3 rounded-full bg-red-400/70" />
                <span className="w-3 h-3 rounded-full bg-amber-400/70" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
                <span className="ml-3 text-xs text-slate-400">skillmateai.com / session / newton-laws</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6">
                {/* Score card */}
                <div className="surface-tonal p-5">
                  <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">Understanding</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-5xl font-extrabold text-indigo-700">7.4</span>
                    <span className="text-slate-500 text-sm">/ 10</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-indigo-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: '74%' }} />
                  </div>
                </div>
                {/* Weak topics */}
                <div className="rounded-3xl border border-slate-200/70 bg-white p-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Weak topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="chip">Free-body diagrams</span>
                    <span className="chip">Action-reaction pairs</span>
                  </div>
                </div>
                {/* MCQs */}
                <div className="rounded-3xl border border-slate-200/70 bg-white p-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Generated</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl font-extrabold text-slate-900">5</span>
                    <span className="text-sm text-slate-500">targeted MCQs</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">in ~3 seconds, on-device-class compute</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Stats strip ───────── */}
      <section className="px-6 -mt-12 relative z-10">
        <div className="mx-auto max-w-6xl surface-dark bg-brand-gradient p-1 rounded-4xl">
          <div className="rounded-[1.85rem] bg-surface-deep px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 text-center text-white">
            {[
              { v: '3', l: 'distinct Gemma 4 calls' },
              { v: '~3s', l: 'transcript → quiz' },
              { v: '5', l: 'MCQs per session' },
              { v: '0', l: 'data leaves your model' },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-white via-indigo-200 to-pink-200 bg-clip-text text-transparent">
                    {s.v}
                  </span>
                </p>
                <p className="text-xs uppercase tracking-wider text-white/60 mt-2">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section id="how" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="chip mb-4">How it works</span>
            <h2 className="display-lg text-slate-900 mb-4">A teaching partner that never sleeps.</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three steps. Zero friction. Powered end-to-end by Gemma 4 running on Google AI infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-pink-200" aria-hidden />

            {[
              {
                step: '01',
                title: 'Teach naturally',
                desc: 'Run your usual Zoom or Meet session. Upload the chat transcript when you\'re done — no plugins, no recording.',
                accent: 'from-indigo-500 to-indigo-700',
              },
              {
                step: '02',
                title: 'Gemma 4 analyses',
                desc: 'The model scores understanding 0–10, surfaces weak topics, and writes a session summary in plain English.',
                accent: 'from-violet-500 to-indigo-600',
              },
              {
                step: '03',
                title: 'Student practises',
                desc: '5 MCQs are generated from the actual lesson content — not generic questions. Progress is tracked over time.',
                accent: 'from-pink-500 to-violet-600',
              },
            ].map((s) => (
              <div key={s.step} className="surface-raised p-7 relative hover:-translate-y-1 transition-transform">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.accent} flex items-center justify-center text-white font-display font-extrabold text-lg shadow-glow mb-5`}>
                  {s.step}
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Features ───────── */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <span className="chip mb-4">Built for the Future of Education</span>
            <h2 className="display-lg text-slate-900">
              The pieces that make <span className="text-gradient">learning stick</span>.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="surface-card p-7 hover:shadow-m3-3 transition-shadow group">
                <div className={`w-12 h-12 rounded-2xl ${f.tone} flex items-center justify-center mb-5`}>
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Gemma 4 callout ───────── */}
      <section id="gemma" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden surface-dark p-1">
            <div className="rounded-[1.85rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-10 md:p-16 text-white relative">
              <div className="blob -top-24 -right-24 w-96 h-96 bg-indigo-500/30" />
              <div className="blob bottom-0 left-0 w-72 h-72 bg-violet-500/20" style={{ animationDelay: '3s' }} />

              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="chip-dark mb-5">Why Gemma 4</span>
                  <h2 className="display-lg text-white mb-5">
                    Frontier intelligence, <br />
                    <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
                      everywhere it&apos;s needed.
                    </span>
                  </h2>
                  <p className="text-white/70 leading-relaxed text-lg mb-8">
                    Gemma 4&apos;s open weights mean SkillMateAI works in a classroom with spotty internet,
                    a tutoring centre that can&apos;t share student data, or a phone in a student&apos;s pocket.
                    Same model, same quality, no compromise.
                  </p>
                  <ul className="space-y-3 text-white/80">
                    {[
                      'Native function calling for structured quiz output',
                      'Multimodal understanding — voice transcripts to scored insights',
                      'Open weights, deployable on edge hardware',
                      'Grounded outputs from the actual lesson, not the internet',
                    ].map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm">
                        <span className="mt-0.5 inline-flex shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M3 6.5L5 8.5L9 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Decorative model card */}
                <div className="relative">
                  <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur p-7 shadow-m3-4">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/50">Model</p>
                        <p className="font-display text-2xl font-bold">gemma-4-27b-it</p>
                      </div>
                      <span className="chip-dark">MoE · 4B active</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { l: 'analyse_session', d: 'transcript → score, weak topics, summary, 5 MCQs' },
                        { l: 'generate_self_study_questions', d: 'pasted notes → topic + 5 MCQs' },
                        { l: 'generate_progress_feedback', d: 'attempts → personalised paragraph' },
                      ].map((c) => (
                        <div key={c.l} className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
                          <p className="font-mono text-sm text-indigo-200">{c.l}()</p>
                          <p className="text-xs text-white/60 mt-1">{c.d}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Final CTA ───────── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="display-lg text-slate-900 mb-5">
            Ready to give your students <span className="text-gradient">a teacher who remembers?</span>
          </h2>
          <p className="text-lg text-slate-600 mb-10">
            Sign up in 30 seconds. Run your first AI-analysed session today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth?role=teacher" className="btn-filled !px-8 !py-4 text-base">
              Start as a Teacher
            </Link>
            <Link href="/auth?role=student" className="btn-outline !px-8 !py-4 text-base">
              Join as a Student
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="border-t border-slate-200/60 mt-10">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 32 32">
              <defs>
                <linearGradient id="logo-grad-footer" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5890FE" />
                  <stop offset="100%" stopColor="#7C5CFF" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="16" fill="url(#logo-grad-footer)" />
              <polyline points="8,17 13,22 24,10" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span className="font-display font-semibold text-slate-700">SkillMateAI</span>
          </div>
          <p>Built for the Gemma 4 Good Hackathon · Google DeepMind / Kaggle</p>
          <p>© {new Date().getFullYear()} SkillMateAI</p>
        </div>
      </footer>
    </div>
  )
}

const FEATURES = [
  {
    title: 'Live session analysis',
    desc: 'Gemma 4 reads the full chat transcript, scores understanding 0–10, and surfaces exactly which sub-topics need reinforcement.',
    tone: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E61E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l3 3 6-6 6 6 3-3" />
      </svg>
    ),
  },
  {
    title: 'Smart quiz generation',
    desc: '5 MCQs auto-generated from each session, hitting the exact concepts the student tripped on — not a generic textbook quiz.',
    tone: 'bg-gradient-to-br from-violet-100 to-violet-200',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: 'Self-study mode',
    desc: 'Paste any notes, slide content, or textbook excerpt — Gemma 4 generates a personalised practice set instantly.',
    tone: 'bg-gradient-to-br from-pink-100 to-pink-200',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF5DA2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    title: 'Progress over time',
    desc: 'Visualise quiz performance across every topic. Gemma 4 writes personalised feedback once enough data is in.',
    tone: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-5" />
      </svg>
    ),
  },
  {
    title: 'Teacher discovery',
    desc: 'Students find teachers by subject, watch teaching samples, and request sessions — all without leaving the app.',
    tone: 'bg-gradient-to-br from-amber-100 to-amber-200',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFB454" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    title: 'Grounded outputs',
    desc: 'Every quiz question is grounded in the actual transcript. No hallucinated facts, no off-topic drift — the model cites what was taught.',
    tone: 'bg-gradient-to-br from-teal-100 to-teal-200',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1FC8C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
]
