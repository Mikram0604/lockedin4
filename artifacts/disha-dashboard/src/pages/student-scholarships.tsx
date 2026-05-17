import { useState, useEffect } from "react";
import { StudentLayout } from "@/components/student-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, GraduationCap, AlertCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function StudentScholarships() {
  const [scholarshipsText, setScholarshipsText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const phone = localStorage.getItem("studentPhone");
    if (phone) {
      fetch(`/api/web-chat/profile?phone=${encodeURIComponent(phone)}`)
        .then(res => res.json())
        .then(data => {
          if (data.scholarshipsText) setScholarshipsText(data.scholarshipsText);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, []);

  return (
    <StudentLayout>
      <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--app-font-display)" }}>
              Matched Scholarships
            </h1>
            <p className="text-slate-500">Based on your profile, here are the scholarships you qualify for.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : scholarshipsText ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden">
              <div className="h-2 w-full bg-emerald-500" />
              <CardContent className="p-8">
                <div className="prose prose-slate max-w-none whitespace-pre-wrap font-medium leading-relaxed">
                  {scholarshipsText.split('\n').map((line, i) => {
                    if (line.startsWith('*')) {
                      return <h3 key={i} className="text-lg font-bold text-slate-900 mt-4 mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>{line.replace(/\*/g, '')}</h3>;
                    }
                    if (line.includes('₹') || line.includes('Rs')) {
                      return <p key={i} className="text-emerald-700 font-semibold">{line}</p>;
                    }
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-bold text-amber-900 mb-1">Important Note</h4>
                <p className="text-amber-800 text-sm">Please ensure you have your Income Certificate, Caste Certificate (if applicable), and previous year mark sheets ready before applying to any of these scholarships.</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-slate-700">No matches found</h3>
            <p className="text-slate-500">Please complete your profile using the AI Assistant to see your matches.</p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
