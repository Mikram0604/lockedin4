import { Link, useLocation } from "wouter";
import { LayoutDashboard, MessageSquare, GraduationCap, FileText, BookOpen, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface StudentLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/chat", label: "AI Assistant", icon: MessageSquare },
  { href: "/student/scholarships", label: "Scholarships", icon: GraduationCap },
  { href: "/student/fees", label: "Fee Assistance", icon: FileText },
  { href: "/student/resources", label: "Academic Resources", icon: BookOpen },
];

export function StudentLayout({ children }: StudentLayoutProps) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!localStorage.getItem("studentPhone")) {
      setLocation("/student");
    }
  }, [location, setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("studentPhone");
    setLocation("/");
  };

  return (
    <div className="flex min-h-screen w-full bg-transparent text-slate-900 font-sans">
      <aside className="w-[280px] border-r border-slate-200 bg-white/60 backdrop-blur-xl flex flex-col fixed inset-y-0 left-0 z-10 shadow-sm">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <Link href="/student/dashboard" className="flex items-center gap-3 text-blue-600 font-bold text-2xl tracking-tight hover:opacity-90 transition-opacity">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span style={{ fontFamily: "var(--app-font-display)" }}>Disha Student</span>
          </Link>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "relative flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium transition-colors cursor-pointer overflow-hidden",
                    isActive
                      ? "text-blue-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="student-nav-active"
                      className="absolute inset-0 bg-blue-50 rounded-2xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="p-6 border-t border-slate-100 mt-auto">
          <div className="flex items-center justify-between">
            <Link href="/student/dashboard" className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 -ml-2 rounded-xl transition-colors flex-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-slate-900 truncate">Student Profile</span>
                <span className="text-xs text-slate-500 font-medium truncate">+91 {localStorage.getItem("studentPhone")}</span>
              </div>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500 hover:bg-red-50">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 ml-[280px] min-w-0 flex flex-col bg-dashboard relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col h-screen overflow-hidden"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
