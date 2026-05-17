import { Link } from "wouter";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-4" style={{ fontFamily: "var(--app-font-display)" }}>
          Welcome to <span className="text-primary">Disha</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-md mx-auto">
          AI-powered college guidance and student welfare platform.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        <Link href="/student">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-primary/50 transition-colors"
          >
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
              <GraduationCap size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">I am a Student</h2>
            <p className="text-slate-500">Chat with Disha to find scholarships, get fee help, and access college resources.</p>
          </motion.div>
        </Link>

        <Link href="/admin/login">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-primary/50 transition-colors"
          >
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
              <Briefcase size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">I am a Counselor</h2>
            <p className="text-slate-500">Monitor student welfare, view risk flags, and track scholarship applications.</p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
