import Link from 'next/link'

function Crest({ size = 34 }: { size?: number }) {
  const h = Math.round((size * 34) / 32)
  return (
    <svg width={size} height={h} viewBox="0 0 32 34" aria-hidden>
      <path d="M16 1 L29 5 V16 C29 25 23 30 16 33 C9 30 3 25 3 16 V5 Z" fill="#003E74" stroke="#147049" strokeWidth="1.25" />
      <path d="M16 11 C13.5 9.5 10.5 9.5 8.5 10.6 V21 C10.5 19.9 13.5 19.9 16 21.4 Z" fill="#ffffff" opacity="0.92" />
      <path d="M16 11 C18.5 9.5 21.5 9.5 23.5 10.6 V21 C21.5 19.9 18.5 19.9 16 21.4 Z" fill="#147049" />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* ───────── Utility strip ───────── */}
      <div className="bg-indigo-900 text-white/80">
        <div className="mx-auto max-w-6xl px-6 h-9 flex items-center justify-between text-[11px] tracking-wide">
          <span className="uppercase tracking-[0.18em] text-white/70">SkillMateAI · Teaching &amp; Learning</span>
          <div className="flex items-center gap-5">
            <a href="#technology" className="hidden sm:inline hover:text-white transition-colors">Technology</a>
            <Link href="/auth" className="hover:text-white transition-colors">Sign in</Link>
          </div>
        </div>
      </div>

      {/* ───────── Main header ───────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <nav className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-6 h-[72px]">
          <Link href="/" className="flex items-center gap-3">
            <Crest />
            <span className="leading-none">
              <span className="block font-display text-xl font-bold text-indigo-800 tracking-tight">
                SkillMate<span className="text-pink-700">AI</span>
              </span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-400 mt-1">
                Teaching &amp; Learning
              </span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#how" className="hover:text-indigo-800 transition-colors">How it works</a>
            <a href="#provision" className="hover:text-indigo-800 transition-colors">What we provide</a>
            <a href="#technology" className="hover:text-indigo-800 transition-colors">Technology</a>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/auth" className="hidden sm:inline-flex btn-outline btn-sm">Sign in</Link>
            <Link href="/auth" className="btn-filled btn-sm">Get started</Link>
          </div>
        </nav>
      </header>

      {/* ───────── Hero ───────── */}
      <section className="relative bg-white border-b border-slate-200">
        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20 grid lg:grid-cols-2 gap-14 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded border border-pink-200 bg-pink-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-pink-700 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-600" />
              Intelligent teaching &amp; learning
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-[3.3rem] leading-[1.08] tracking-tight text-slate-900 mb-6">
              A teaching partner that remembers
              <span className="block text-pink-700">what every learner struggled with.</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl mb-9">
              SkillMateAI works alongside every teaching session — analysing the discussion,
              assessing understanding, and producing assessments drawn from what was actually taught.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth?role=teacher" className="btn-filled !px-7 !py-3.5 text-base">
                I&apos;m an Educator <span aria-hidden>→</span>
              </Link>
              <Link href="/auth?role=student" className="btn-outline !px-7 !py-3.5 text-base">
                I&apos;m a Student
              </Link>
            </div>
            <p className="text-xs text-slate-500 mt-7">
              No credit card required · Open platform · Built for educators and learners alike
            </p>
          </div>

          {/* Prospectus-style mock panel */}
          <div className="relative animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="rounded-lg border border-slate-200 bg-white shadow-m3-3 overflow-hidden text-slate-900">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Session report</span>
                <span className="text-xs text-slate-400">Newton&apos;s Laws of Motion</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
                <div className="surface-tonal p-5">
                  <p className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wide mb-2">Understanding</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold text-indigo-800">7.4</span>
                    <span className="text-slate-500 text-sm">/ 10</span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-indigo-100 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-800" style={{ width: '74%' }} />
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Areas to revisit</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="chip">Free-body diagrams</span>
                    <span className="chip">Action–reaction</span>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Generated</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-bold text-slate-900">5</span>
                    <span className="text-sm text-slate-500">questions</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">tailored to the lesson</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Key facts strip ───────── */}
      <section className="bg-surface-parchment border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 text-center">
          {[
            { v: '0–10', l: 'understanding scored per session' },
            { v: '~3s', l: 'from transcript to assessment' },
            { v: '5', l: 'tailored questions generated' },
            { v: '100%', l: 'grounded in the lesson taught' },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-3xl md:text-4xl font-bold text-indigo-800 tracking-tight">{s.v}</p>
              <p className="text-xs uppercase tracking-wider text-slate-500 mt-2 leading-snug">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section id="how" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl mb-14">
            <span className="chip-gradient mb-4">How it works</span>
            <h2 className="display-lg text-slate-900 mb-4">A guided pathway from lesson to mastery.</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Three steps, with no change to how you already teach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Teach as you do',
                desc: 'Run your usual session on any platform. Upload the transcript when you are finished — no plugins or recording required.',
              },
              {
                step: '02',
                title: 'The platform assesses',
                desc: 'Understanding is scored from 0–10, areas needing reinforcement are identified, and a plain-language summary is written.',
              },
              {
                step: '03',
                title: 'Students consolidate',
                desc: 'Five questions are generated from the actual lesson content — not generic items — and progress is tracked over time.',
              },
            ].map((s) => (
              <div key={s.step} className="surface-card p-7 border-t-4 border-t-pink-500">
                <p className="font-display text-2xl font-bold text-pink-700 mb-4">{s.step}</p>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── What we provide ───────── */}
      <section id="provision" className="px-6 py-20 bg-surface-dim border-y border-slate-200">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl mb-12">
            <span className="chip-gradient mb-4">What we provide</span>
            <h2 className="display-lg text-slate-900">Everything required to make learning stick.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="surface-card p-7 hover:shadow-m3-3 transition-shadow">
                <div className="w-11 h-11 rounded-md bg-pink-50 border border-pink-100 flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Technology ───────── */}
      <section id="technology" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="surface-dark overflow-hidden">
            <div className="p-10 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="chip-dark mb-5">The technology</span>
                <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight text-white mb-5">
                  Capable models, deployable
                  <span className="block text-pink-300">wherever they are needed.</span>
                </h2>
                <p className="text-white/70 leading-relaxed text-lg mb-8">
                  Open model weights mean the platform works in a classroom with limited connectivity,
                  a setting where student data must remain private, or on modest hardware — with
                  consistent quality and no compromise.
                </p>
                <ul className="space-y-3 text-white/80">
                  {[
                    'Structured, function-called output for reliable assessments',
                    'Understanding inferred from session transcripts',
                    'Open weights, deployable on local hardware',
                    'Outputs grounded in the lesson, not the open web',
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 inline-flex shrink-0 w-5 h-5 rounded bg-pink-500/90 items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 6.5L5 8.5L9 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-white/15 bg-white/[0.04] p-7">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/50">Model</p>
                    <p className="font-display text-2xl font-bold text-white">Gemma 4</p>
                  </div>
                  <span className="chip-dark">on-device class</span>
                </div>
                <div className="space-y-3">
                  {[
                    { l: 'analyse_session', d: 'transcript → score, areas, summary, questions' },
                    { l: 'generate_self_study', d: 'notes → topic and practice questions' },
                    { l: 'generate_progress_feedback', d: 'attempts → personalised guidance' },
                  ].map((c) => (
                    <div key={c.l} className="rounded-md bg-white/[0.04] border border-white/10 p-4">
                      <p className="font-mono text-sm text-pink-200">{c.l}()</p>
                      <p className="text-xs text-white/60 mt-1">{c.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Final CTA ───────── */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl text-center surface-card p-12 md:p-16 border-t-4 border-t-pink-500">
          <h2 className="display-lg text-slate-900 mb-4">
            Give your students a teacher who remembers.
          </h2>
          <p className="text-lg text-slate-600 mb-9 max-w-xl mx-auto">
            Register in under a minute and run your first analysed session today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth?role=teacher" className="btn-filled !px-8 !py-4 text-base">
              Start as an Educator
            </Link>
            <Link href="/auth?role=student" className="btn-outline !px-8 !py-4 text-base">
              Join as a Student
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="bg-indigo-900 text-white/70">
        <div className="mx-auto max-w-6xl px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Crest size={30} />
              <span className="font-display text-lg font-bold text-white">SkillMateAI</span>
            </div>
            <p className="text-sm leading-relaxed text-white/55">
              An intelligent platform supporting educators and learners through every session.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 mb-4">Platform</p>
            <ul className="space-y-2 text-sm">
              <li><a href="#how" className="hover:text-white transition-colors">How it works</a></li>
              <li><a href="#provision" className="hover:text-white transition-colors">What we provide</a></li>
              <li><a href="#technology" className="hover:text-white transition-colors">Technology</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 mb-4">Get started</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth?role=teacher" className="hover:text-white transition-colors">For educators</Link></li>
              <li><Link href="/auth?role=student" className="hover:text-white transition-colors">For students</Link></li>
              <li><Link href="/auth" className="hover:text-white transition-colors">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 mb-4">About</p>
            <ul className="space-y-2 text-sm">
              <li><a href="#technology" className="hover:text-white transition-colors">Our approach</a></li>
              <li><a href="#provision" className="hover:text-white transition-colors">Privacy by design</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
            <p>© {new Date().getFullYear()} SkillMateAI. All rights reserved.</p>
            <p>An intelligent teaching &amp; learning platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const FEATURES = [
  {
    title: 'Session analysis',
    desc: 'The full transcript is read, understanding is scored from 0–10, and the precise sub-topics needing reinforcement are surfaced.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B4A31" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l3 3 6-6 6 6 3-3" />
      </svg>
    ),
  },
  {
    title: 'Tailored assessment',
    desc: 'Five questions are generated from each session, addressing the exact concepts a student found difficult — never a generic quiz.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B4A31" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: 'Self-directed study',
    desc: 'Paste any notes, slides, or textbook excerpt and the platform produces a tailored practice set in moments.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B4A31" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    title: 'Progress over time',
    desc: 'Performance is visualised across every topic, with personalised written feedback once sufficient data is gathered.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B4A31" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-5" />
      </svg>
    ),
  },
  {
    title: 'Find an educator',
    desc: 'Students discover educators by subject, review teaching samples, and request sessions — all within the platform.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B4A31" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    title: 'Grounded by design',
    desc: 'Every question is grounded in the actual transcript — no fabricated facts and no drift from what was taught.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B4A31" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
]
