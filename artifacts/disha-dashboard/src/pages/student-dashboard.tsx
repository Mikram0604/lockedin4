import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { StudentLayout } from "@/components/student-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, MessageSquare, GraduationCap, FileText, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const phone = localStorage.getItem("studentPhone");
    if (phone) {
      fetch(`/api/web-chat/profile?phone=${encodeURIComponent(phone)}`)
        .then(res => res.json())
        .then(data => {
          if (data.student) setProfile(data.student);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, []);

  return (
    <StudentLayout>
      <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--app-font-display)" }}>
            Welcome back{profile?.name ? `, ${profile.name}` : ""}!
          </h1>
          <p className="text-lg text-slate-500">Here is your student portal. How can we help you today?</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : profile ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Your Profile</h3>
              <p className="text-xl font-medium text-slate-900">{profile.college || "College not set"}</p>
              <p className="text-slate-500">{profile.branch || "Branch not set"} • {profile.year || "Year not set"}</p>
            </div>
            <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm self-start sm:self-auto">
              Fee Status: <span className="capitalize">{profile.feeStatus?.replace("_", " ") || "Unknown"}</span>
            </div>
          </motion.div>
        ) : (
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-blue-800">
            <h3 className="font-bold text-lg mb-2">Complete your onboarding!</h3>
            <p>It looks like we don't have all your details yet. Hop into the AI Assistant to complete your profile so we can match you with scholarships.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/student/chat">
            <Card className="rounded-3xl border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full hover:scale-[1.02] duration-200">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900">AI Assistant</h3>
                <p className="text-slate-500">Chat with Disha to update your profile, ask questions, or get help with your academics.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/scholarships">
            <Card className="rounded-3xl border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full hover:scale-[1.02] duration-200">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <GraduationCap size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900">Scholarships</h3>
                <p className="text-slate-500">View scholarships perfectly matched to your profile, income, and category.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/fees">
            <Card className="rounded-3xl border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full hover:scale-[1.02] duration-200">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
                  <FileText size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900">Fee Assistance</h3>
                <p className="text-slate-500">Generate an automatic fee extension request letter to submit to your college.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/resources">
            <Card className="rounded-3xl border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full hover:scale-[1.02] duration-200">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900">Academic Resources</h3>
                <p className="text-slate-500">Access study materials, important links, and guides for your current year.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}
