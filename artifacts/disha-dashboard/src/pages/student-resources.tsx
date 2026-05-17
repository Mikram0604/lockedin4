import { useState, useEffect } from "react";
import { StudentLayout } from "@/components/student-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, BookOpen, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentResources() {
  const [resourcesText, setResourcesText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const phone = localStorage.getItem("studentPhone");
    if (phone) {
      fetch(`/api/web-chat/profile?phone=${encodeURIComponent(phone)}`)
        .then(res => res.json())
        .then(data => {
          if (data.resourcesText) setResourcesText(data.resourcesText);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, []);

  return (
    <StudentLayout>
      <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--app-font-display)" }}>
              Academic Resources
            </h1>
            <p className="text-slate-500">Curated materials and helpful links for your academic journey.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : resourcesText ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden">
              <div className="h-2 w-full bg-purple-500" />
              <CardContent className="p-8">
                <div className="prose prose-slate max-w-none whitespace-pre-wrap font-medium leading-relaxed">
                  {resourcesText.split('\n').map((line, i) => {
                    if (line.startsWith('*')) {
                      return <h3 key={i} className="text-lg font-bold text-slate-900 mt-4 mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div>{line.replace(/\*/g, '')}</h3>;
                    }
                    if (line.includes('http')) {
                      return (
                        <p key={i} className="flex items-start gap-2">
                          <LinkIcon className="w-4 h-4 mt-1 text-purple-400 shrink-0" />
                          <a href={line.match(/https?:\/\/[^\s]+/)?.[0]} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline break-all">
                            {line}
                          </a>
                        </p>
                      );
                    }
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-slate-700">Resources unavailable</h3>
            <p className="text-slate-500">Could not load academic resources at this time.</p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
