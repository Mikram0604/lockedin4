import { useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { GraduationCap, Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

export default function Landing() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Custom fade-in / fade-out loop logic
  const animateLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId: number;

    const tick = () => {
      if (!video || video.paused) return;

      const { currentTime, duration } = video;
      if (duration && isFinite(duration)) {
        // Fade in during the first 0.5s
        if (currentTime < 0.5) {
          video.style.opacity = String(Math.min(currentTime / 0.5, 1));
        }
        // Fade out during the last 0.5s
        else if (currentTime > duration - 0.5) {
          const remaining = duration - currentTime;
          video.style.opacity = String(Math.max(remaining / 0.5, 0));
        } else {
          video.style.opacity = "1";
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    // On ended: fade to 0, wait 100ms, then restart
    const handleEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
      }, 100);
    };

    video.addEventListener("ended", handleEnded);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const cleanup = animateLoop();
    return cleanup;
  }, [animateLoop]);

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

        <Dialog>
          <DialogTrigger asChild>
            <button className="rounded-full px-6 py-2.5 text-sm bg-[#000000] text-white hover:scale-103 transition-transform cursor-pointer" style={{ fontFamily: 'Inter' }}>
              Begin Journey
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-xl border-white/20">
            <DialogHeader>
              <DialogTitle className="text-center text-4xl mt-4 font-normal text-[#000000]" style={{ fontFamily: 'Instrument Serif' }}>Choose your path</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-6">
              <Link href="/student" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900" style={{ fontFamily: 'Inter' }}>Student Login</span>
                  <span className="text-sm text-slate-500" style={{ fontFamily: 'Inter' }}>Access scholarships, chat, and resources</span>
                </div>
              </Link>
              <Link href="/admin/login" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group">
                <div className="bg-purple-50 text-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900" style={{ fontFamily: 'Inter' }}>Counselor Login</span>
                  <span className="text-sm text-slate-500" style={{ fontFamily: 'Inter' }}>Manage students, alerts, and triage</span>
                </div>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
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

        <Dialog>
          <DialogTrigger asChild>
            <button 
              className="rounded-full px-14 py-5 text-base mt-12 bg-[#000000] text-[#FFFFFF] hover:scale-103 transition-transform animate-fade-rise-delay-2 cursor-pointer"
              style={{ fontFamily: 'Inter' }}
            >
              Begin Journey
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-xl border-white/20">
            <DialogHeader>
              <DialogTitle className="text-center text-4xl mt-4 font-normal text-[#000000]" style={{ fontFamily: 'Instrument Serif' }}>Choose your path</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-6">
              <Link href="/student" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900" style={{ fontFamily: 'Inter' }}>Student Login</span>
                  <span className="text-sm text-slate-500" style={{ fontFamily: 'Inter' }}>Access scholarships, chat, and resources</span>
                </div>
              </Link>
              <Link href="/admin/login" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group">
                <div className="bg-purple-50 text-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900" style={{ fontFamily: 'Inter' }}>Counselor Login</span>
                  <span className="text-sm text-slate-500" style={{ fontFamily: 'Inter' }}>Manage students, alerts, and triage</span>
                </div>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}
