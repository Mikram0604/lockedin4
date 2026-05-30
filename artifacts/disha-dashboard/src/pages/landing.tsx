import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent">
      {/* ── Navigation bar (z-10) ── */}
      <nav className="relative z-10 flex justify-between px-8 py-6 max-w-7xl mx-auto" aria-label="Primary">
        <Link href="/" className="text-3xl tracking-tight text-[#000000]" style={{ fontFamily: 'Instrument Serif' }}>
          Disha<sup>®</sup>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm transition-colors text-[#000000]" style={{ fontFamily: 'Inter' }}>
            Home
          </Link>
          <Link href="/student" className="text-sm transition-colors text-[#6F6F6F] hover:text-[#000000]" style={{ fontFamily: 'Inter' }}>
            Student
          </Link>
          <Link href="/dashboard" className="text-sm transition-colors text-[#6F6F6F] hover:text-[#000000]" style={{ fontFamily: 'Inter' }}>
            Dashboard
          </Link>
          <Link href="/scholarships" className="text-sm transition-colors text-[#6F6F6F] hover:text-[#000000]" style={{ fontFamily: 'Inter' }}>
            Scholarships
          </Link>
          <Link href="/alerts" className="text-sm transition-colors text-[#6F6F6F] hover:text-[#000000]" style={{ fontFamily: 'Inter' }}>
            Alerts
          </Link>
        </div>

        <Link href="/admin/login" className="rounded-full px-6 py-2.5 text-sm bg-[#000000] text-white hover:scale-103 transition-transform" style={{ fontFamily: 'Inter' }}>
          Begin Journey
        </Link>
      </nav>

      {/* ── Hero section (z-10) ── */}
      <section 
        className="relative z-10 flex flex-col items-center justify-center text-center px-6"
        style={{ paddingTop: 'calc(8rem - 75px)', paddingBottom: '10rem' }}
      >
        <h1 
          className="text-5xl sm:text-7xl md:text-8xl max-w-7xl font-normal text-[#000000] animate-fade-rise"
          style={{ fontFamily: 'Instrument Serif', lineHeight: 0.95, letterSpacing: '-2.46px' }}
        >
          Beyond silence, we build <span className="text-[#6F6F6F] italic">the future</span> of <span className="text-[#6F6F6F] italic">student welfare.</span>
        </h1>

        <p 
          className="text-base sm:text-lg max-w-2xl mt-8 leading-relaxed text-[#6F6F6F] animate-fade-rise-delay"
          style={{ fontFamily: 'Inter' }}
        >
          Empowering first-generation college students with AI-driven guidance,
          scholarship matching, and proactive welfare support — through WhatsApp,
          in their own language.
        </p>

        <Link 
          href="/student" 
          className="rounded-full px-14 py-5 text-base mt-12 bg-[#000000] text-[#FFFFFF] hover:scale-103 transition-transform animate-fade-rise-delay-2"
          style={{ fontFamily: 'Inter' }}
        >
          Begin Journey
        </Link>
      </section>
    </div>
  );
}
