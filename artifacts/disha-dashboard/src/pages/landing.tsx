import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase } from "lucide-react";

export default function Landing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.parentElement!.clientWidth; canvas.height = canvas.parentElement!.clientHeight; };
    resize();
    const particles: { x: number; y: number; s: number; sx: number; sy: number; o: number }[] = [];
    for (let i = 0; i < 70; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, s: Math.random() * 3 + 1, sx: Math.random() * 2 - 1, sy: Math.random() * 2 - 1, o: Math.random() * 0.5 + 0.3 });
    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.x += p.sx; p.y += p.sy; if (p.x > canvas.width || p.x < 0) p.sx *= -1; if (p.y > canvas.height || p.y < 0) p.sy *= -1; ctx.fillStyle = `rgba(255,255,255,${p.o})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill(); });
      particles.forEach((a, i) => { particles.slice(i + 1).forEach(b => { const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 120) { ctx.strokeStyle = `rgba(255,255,255,${0.15 * (1 - d / 120)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }); });
      id = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-hero">
      <canvas ref={canvasRef} className="particles-canvas" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4" style={{ fontFamily: "var(--app-font-display)", textShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          Welcome to <span className="text-white/90">Disha</span>
        </h1>
        <p className="text-xl text-white/80 max-w-md mx-auto">
          AI-powered college guidance and student welfare platform.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        <Link href="/student">
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer glass-card rounded-3xl p-8 flex flex-col items-center text-center group transition-all"
          >
            <div className="w-20 h-20 bg-white/25 text-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <GraduationCap size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">I am a Student</h2>
            <p className="text-white/80">Chat with Disha to find scholarships, get fee help, and access college resources.</p>
          </motion.div>
        </Link>

        <Link href="/admin/login">
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer glass-card rounded-3xl p-8 flex flex-col items-center text-center group transition-all"
          >
            <div className="w-20 h-20 bg-white/25 text-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Briefcase size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">I am a Counselor</h2>
            <p className="text-white/80">Monitor student welfare, view risk flags, and track scholarship applications.</p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
