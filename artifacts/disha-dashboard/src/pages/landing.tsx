import { useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";

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
    <div className="landing-cinematic">
      {/* ── Video background layer ── */}
      <div className="landing-video-wrapper">
        <video
          ref={videoRef}
          src={VIDEO_URL}
          autoPlay
          muted
          playsInline
          style={{ opacity: 0 }}
          className="landing-video"
        />
        {/* Gradient overlays on video */}
        <div className="landing-video-gradient" />
      </div>

      {/* ── Navigation bar ── */}
      <nav className="landing-cinematic-nav" aria-label="Primary">
        <Link href="/" className="cinematic-brand">
          Disha<sup>®</sup>
        </Link>

        <div className="cinematic-nav-links">
          <Link href="/" className="cinematic-nav-link cinematic-nav-link--active">
            Home
          </Link>
          <Link href="/student" className="cinematic-nav-link">
            Student
          </Link>
          <Link href="/dashboard" className="cinematic-nav-link">
            Dashboard
          </Link>
          <Link href="/scholarships" className="cinematic-nav-link">
            Scholarships
          </Link>
          <Link href="/alerts" className="cinematic-nav-link">
            Alerts
          </Link>
        </div>

        <Link href="/admin/login" className="cinematic-cta-btn">
          Begin Journey
        </Link>
      </nav>

      {/* ── Hero section ── */}
      <section className="cinematic-hero">
        <h1 className="cinematic-headline animate-fade-rise">
          Beyond silence, we build{" "}
          <em>the future</em> of{" "}
          <em>student welfare.</em>
        </h1>

        <p className="cinematic-description animate-fade-rise-delay">
          Empowering first-generation college students with AI-driven guidance,
          scholarship matching, and proactive welfare support — through WhatsApp,
          in their own language.
        </p>

        <Link href="/student" className="cinematic-hero-cta animate-fade-rise-delay-2">
          Begin Journey
        </Link>
      </section>
    </div>
  );
}
