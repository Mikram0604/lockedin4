import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

export default function GlobalVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [location] = useLocation();

  // Custom fade-in / fade-out loop logic
  const animateLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId: number;

    const tick = () => {
      // ALWAYS schedule the next frame to prevent the loop from dying
      // if the video pauses or buffers.
      rafId = requestAnimationFrame(tick);
      
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

  // Optionally, we could change the gradient based on route, 
  // but for now we'll use the cinematic white fade requested.
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-[-1] overflow-hidden bg-[#FFFFFF]">
      <div 
        className="absolute z-0 w-full" 
        style={{ top: '300px', inset: 'auto 0 0 0' }}
      >
        <video
          ref={videoRef}
          src={VIDEO_URL}
          autoPlay
          muted
          loop={false}
          playsInline
          className="w-full h-full object-cover"
          style={{ opacity: 0 }}
        />
        {/* Gradient overlays on video */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFFFF] via-transparent to-[#FFFFFF]" />
      </div>
    </div>
  );
}
