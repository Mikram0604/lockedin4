import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Bell, GraduationCap, Building, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/scholarships", label: "Scholarships", icon: GraduationCap },
];

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (localStorage.getItem("adminAuth") !== "true") {
      setLocation("/admin/login");
    }
  }, [location, setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setLocation("/");
  };

  return (
    <div className="flex min-h-screen w-full bg-background/50 text-foreground font-sans">
      <aside className="w-[280px] border-r border-border/50 bg-card/50 backdrop-blur-xl flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="h-20 flex items-center px-8 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-3 text-primary font-bold text-2xl tracking-tight hover:opacity-90 transition-opacity">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl">
              <Building className="w-6 h-6" />
            </div>
            <span style={{ fontFamily: "var(--app-font-display)" }}>Disha</span>
          </Link>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "relative flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium transition-colors cursor-pointer overflow-hidden",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary/10 rounded-2xl"
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
        <div className="p-6 border-t border-border/50 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm" style={{ fontFamily: "var(--app-font-display)" }}>
                CO
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">Counselor</span>
                <span className="text-xs text-muted-foreground font-medium">Welfare Office</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-red-500 hover:bg-red-50">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 ml-[280px] min-w-0 flex flex-col bg-counselor">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
