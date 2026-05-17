import { useState, useEffect } from "react";
import { StudentLayout } from "@/components/student-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, Download, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function StudentFees() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

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

  const generateLetter = () => {
    if (!profile) return "";
    return `To,
The Principal,
${profile.college || "[College Name]"}

Date: ${new Date().toLocaleDateString()}

Subject: Request for Extension of Fee Payment Deadline

Respected Sir/Madam,

I am ${profile.name || "[Your Name]"}, studying in ${profile.year || "[Year]"} year of ${profile.branch || "[Branch]"}. I am writing to humbly request an extension for the payment of my current semester fees.

Due to unforeseen financial constraints in my family, we are currently unable to arrange the full fee amount by the deadline. We are actively arranging the funds and respectfully request a brief extension.

I assure you that I will clear all pending dues as soon as possible. I kindly request you to grant me this extension so I may continue my studies without interruption.

Thank you for your understanding and support.

Yours sincerely,
${profile.name || "[Your Name]"}
Branch: ${profile.branch || "[Branch]"}
Year: ${profile.year || "[Year]"}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateLetter());
    setCopied(true);
    toast({ title: "Copied to clipboard", description: "You can now paste this letter into a document or email." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <StudentLayout>
      <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--app-font-display)" }}>
              Fee Assistance
            </h1>
            <p className="text-slate-500">Generate a formal fee extension request letter for your college.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : profile ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Generated Letter</h3>
                <p className="text-sm text-slate-500">Personalized using your profile details.</p>
              </div>
              <Button onClick={handleCopy} className="bg-amber-500 hover:bg-amber-600 text-white gap-2 rounded-xl">
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? "Copied!" : "Copy Letter"}
              </Button>
            </div>

            <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden">
              <div className="h-2 w-full bg-amber-500" />
              <CardContent className="p-8 bg-slate-50/50">
                <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed text-[15px]">
                  {generateLetter()}
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-slate-700">Profile incomplete</h3>
            <p className="text-slate-500">Please complete your profile using the AI Assistant to generate letters.</p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
