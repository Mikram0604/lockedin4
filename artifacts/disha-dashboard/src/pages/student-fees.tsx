import { useState, useEffect } from "react";
import { StudentLayout } from "@/components/student-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Copy, Check, Building2, Phone, Globe, Heart, Calculator, IndianRupee, Landmark, CreditCard, HandCoins } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

/* ───── letter templates ───── */
function feeExtensionLetter(p: any) {
  return `To,\nThe Principal,\n${p.college || "[College Name]"}\n\nDate: ${new Date().toLocaleDateString()}\n\nSubject: Request for Extension of Fee Payment Deadline\n\nRespected Sir/Madam,\n\nI am ${p.name || "[Your Name]"}, studying in ${p.year || "[Year]"} year of ${p.branch || "[Branch]"}. I am writing to humbly request an extension for the payment of my current semester fees.\n\nDue to unforeseen financial constraints in my family, we are currently unable to arrange the full fee amount by the deadline. We are actively arranging the funds and respectfully request a brief extension.\n\nI assure you that I will clear all pending dues as soon as possible. I kindly request you to grant me this extension so I may continue my studies without interruption.\n\nThank you for your understanding and support.\n\nYours sincerely,\n${p.name || "[Your Name]"}\nBranch: ${p.branch || "[Branch]"}\nYear: ${p.year || "[Year]"}`;
}

function feeWaiverLetter(p: any) {
  return `To,\nThe Principal,\n${p.college || "[College Name]"}\n\nDate: ${new Date().toLocaleDateString()}\n\nSubject: Application for Fee Waiver/Concession\n\nRespected Sir/Madam,\n\nI am ${p.name || "[Your Name]"}, a student of ${p.branch || "[Branch]"}, ${p.year || "[Year]"} year. I belong to an economically weaker section and my family's annual income is limited.\n\nI humbly request you to consider granting me a fee waiver or concession for the current academic year. My academic performance has been consistent and I am committed to completing my education.\n\nI have attached the required income certificate and other supporting documents for your kind consideration.\n\nI would be grateful for any financial assistance the institution can provide.\n\nYours sincerely,\n${p.name || "[Your Name]"}\nBranch: ${p.branch || "[Branch]"}\nYear: ${p.year || "[Year]"}`;
}

function hostelFeeLetter(p: any) {
  return `To,\nThe Hostel Warden,\n${p.college || "[College Name]"}\n\nDate: ${new Date().toLocaleDateString()}\n\nSubject: Request for Hostel Fee Reduction\n\nRespected Sir/Madam,\n\nI am ${p.name || "[Your Name]"}, residing in the college hostel and studying ${p.branch || "[Branch]"}, ${p.year || "[Year]"} year. I am writing to request a reduction in my hostel fees for the current semester.\n\nMy family is currently facing financial difficulties and we are unable to bear the full hostel charges. I request you to kindly consider offering a partial waiver or allow me to pay in installments.\n\nI am a disciplined resident and have maintained good academic standing. I assure you that I will fulfill my financial obligations to the best of my ability.\n\nThank you for your consideration.\n\nYours sincerely,\n${p.name || "[Your Name]"}\nBranch: ${p.branch || "[Branch]"}\nYear: ${p.year || "[Year]"}`;
}

function educationLoanLetter(p: any) {
  return `To,\nThe Branch Manager,\n[Bank Name & Branch]\n\nDate: ${new Date().toLocaleDateString()}\n\nSubject: Application for Education Loan\n\nRespected Sir/Madam,\n\nI am ${p.name || "[Your Name]"}, currently pursuing ${p.branch || "[Branch]"} (${p.year || "[Year]"} year) at ${p.college || "[College Name]"}.\n\nI wish to apply for an education loan to finance my remaining academic years. My family's financial situation makes it difficult to fund my education entirely out of pocket.\n\nI am a sincere student with good academic records and I am confident that this investment in my education will enable me to repay the loan after completion of my degree.\n\nI have enclosed the necessary documents including admission letter, fee structure, income proof, and academic records for your review.\n\nI request you to kindly process my application at the earliest.\n\nYours sincerely,\n${p.name || "[Your Name]"}\nCourse: ${p.branch || "[Branch]"}\nCollege: ${p.college || "[College Name]"}`;
}

function installmentLetter(p: any) {
  return `To,\nThe Principal / Accounts Section,\n${p.college || "[College Name]"}\n\nDate: ${new Date().toLocaleDateString()}\n\nSubject: Request for Fee Payment in Installments\n\nRespected Sir/Madam,\n\nI am ${p.name || "[Your Name]"}, a student of ${p.branch || "[Branch]"}, ${p.year || "[Year]"} year. I am writing to request permission to pay my semester fees in installments.\n\nDue to my family's current financial situation, paying the entire fee amount at once is not feasible. I propose to pay the fees in 2-3 monthly installments and will adhere strictly to the agreed schedule.\n\nI have always been regular with my payments and I assure you of my commitment to clearing the full amount within the proposed timeline.\n\nI kindly request you to approve this arrangement so that my academic activities are not disrupted.\n\nThank you for your understanding.\n\nYours sincerely,\n${p.name || "[Your Name]"}\nBranch: ${p.branch || "[Branch]"}\nYear: ${p.year || "[Year]"}`;
}

const TEMPLATES = [
  { id: "extension", label: "Fee Extension", icon: FileText, gen: feeExtensionLetter, color: "amber" },
  { id: "waiver", label: "Fee Waiver", icon: HandCoins, gen: feeWaiverLetter, color: "emerald" },
  { id: "hostel", label: "Hostel Fee", icon: Building2, gen: hostelFeeLetter, color: "blue" },
  { id: "loan", label: "Education Loan", icon: Landmark, gen: educationLoanLetter, color: "violet" },
  { id: "installment", label: "Installments", icon: CreditCard, gen: installmentLetter, color: "rose" },
];

/* ───── education loan data ───── */
const LOAN_DATA = [
  { bank: "State Bank of India (SBI)", rate: "8.15 – 10.50%", maxAmt: "₹20 lakh (domestic)", link: "https://sbi.co.in/web/personal-banking/loans/education-loans" },
  { bank: "Canara Bank", rate: "8.40 – 9.95%", maxAmt: "₹20 lakh", link: "https://canarabank.com/english/loans/education-loan/" },
  { bank: "Bank of Baroda", rate: "8.40 – 10.50%", maxAmt: "₹20 lakh", link: "https://www.bankofbaroda.in/personal-banking/loans/education-loan" },
  { bank: "Punjab National Bank", rate: "8.45 – 10.65%", maxAmt: "₹15 lakh", link: "https://www.pnbindia.in/education-loan.html" },
  { bank: "Indian Bank", rate: "8.40 – 10.30%", maxAmt: "₹20 lakh", link: "https://www.indianbank.in/departments/education-loan/" },
  { bank: "Vidyalakshmi Portal (Govt.)", rate: "Varies", maxAmt: "Multi-bank", link: "https://www.vidyalakshmi.co.in/" },
];

/* ───── emergency directory ───── */
const EMERGENCY_AID = [
  { name: "Vidyasaarathi (NSDL)", desc: "Scholarship aggregator connecting students with corporate & govt scholarships.", link: "https://www.vidyasaarathi.co.in/", icon: Heart },
  { name: "Buddy4Study", desc: "India's largest scholarship platform — search & apply for 1000+ scholarships.", link: "https://www.buddy4study.com/", icon: Globe },
  { name: "National Scholarship Portal (NSP)", desc: "Central Government portal for all major govt scholarship schemes.", link: "https://scholarships.gov.in/", icon: Landmark },
  { name: "Prime Minister's Relief Fund", desc: "For students in extreme financial distress — request PM assistance.", link: "https://pmnrf.gov.in/", icon: IndianRupee },
  { name: "Ketto / Milaap", desc: "Crowdfunding platforms to raise education funds from the community.", link: "https://www.ketto.org/", icon: HandCoins },
  { name: "Anti-Ragging & Student Distress", desc: "24x7 helpline for any form of student distress — 1800-180-5522.", link: "tel:18001805522", icon: Phone },
];


/* ───── main component ───── */
export default function StudentFees() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState("extension");
  const [copiedId, setCopiedId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const phone = localStorage.getItem("studentPhone");
    if (phone) {
      fetch(`/api/web-chat/profile?phone=${encodeURIComponent(phone)}`)
        .then(res => res.json())
        .then(data => { if (data.student) setProfile(data.student); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, []);

  const copyLetter = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied!", description: "Letter copied to clipboard." });
    setTimeout(() => setCopiedId(""), 2000);
  };

  if (loading) {
    return <StudentLayout><div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div></StudentLayout>;
  }

  return (
    <StudentLayout>
      <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full overflow-y-auto h-screen pb-32">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6 mb-8">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--app-font-display)" }}>Financial Toolkit</h1>
            <p className="text-slate-500">Letters, loan info, emergency aid & calculators — all in one place.</p>
          </div>
        </div>

        <Tabs defaultValue="letters" className="space-y-6">
          <TabsList className="bg-slate-100 rounded-2xl p-1 h-auto flex-wrap">
            <TabsTrigger value="letters" className="rounded-xl data-[state=active]:bg-white">📄 Letter Templates</TabsTrigger>
            <TabsTrigger value="loans" className="rounded-xl data-[state=active]:bg-white">🏦 Education Loans</TabsTrigger>
            <TabsTrigger value="emergency" className="rounded-xl data-[state=active]:bg-white">🆘 Emergency Aid</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Letter Templates ── */}
          <TabsContent value="letters" className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              {TEMPLATES.map(t => (
                <Button key={t.id} variant={selectedTemplate === t.id ? "default" : "outline"} onClick={() => setSelectedTemplate(t.id)}
                  className={`rounded-xl gap-2 ${selectedTemplate === t.id ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}>
                  <t.icon size={16} /> {t.label}
                </Button>
              ))}
            </div>

            {profile ? TEMPLATES.filter(t => t.id === selectedTemplate).map(t => {
              const letter = t.gen(profile);
              return (
                <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex justify-between items-end mb-3">
                    <div><h3 className="font-semibold text-slate-900">{t.label} Letter</h3><p className="text-sm text-slate-500">Auto-filled with your profile.</p></div>
                    <Button onClick={() => copyLetter(t.id, letter)} className="bg-amber-500 hover:bg-amber-600 text-white gap-2 rounded-xl">
                      {copiedId === t.id ? <Check size={16} /> : <Copy size={16} />} {copiedId === t.id ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
                    <div className="h-2 w-full bg-amber-500" />
                    <CardContent className="p-6 sm:p-8 bg-slate-50/50">
                      <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed text-[15px]">{letter}</pre>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            }) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-slate-700">Profile incomplete</h3>
                <p className="text-slate-500">Complete your profile via the AI Assistant to auto-fill letters.</p>
              </div>
            )}
          </TabsContent>

          {/* ── Tab 2: Education Loans ── */}
          <TabsContent value="loans" className="space-y-6">
            <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
              <div className="h-2 w-full bg-violet-500" />
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Education Loan Comparison</h3>
                  <p className="text-sm text-slate-500">Major banks offering education loans in India. Rates are indicative and may change.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Bank</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Interest Rate</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Max Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Apply</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LOAN_DATA.map((l, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-900">{l.bank}</td>
                          <td className="py-3 px-4 text-emerald-700 font-semibold">{l.rate}</td>
                          <td className="py-3 px-4 text-slate-600">{l.maxAmt}</td>
                          <td className="py-3 px-4"><a href={l.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">Visit →</a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm bg-blue-50 overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <h4 className="font-bold text-blue-900 mb-3">📋 Documents Needed for Education Loan</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-800">
                  {["Admission letter from college", "Fee structure (full course)", "10th & 12th mark sheets", "Income proof of parent/guardian", "Aadhar card of student & co-borrower", "Bank statements (last 6 months)", "2 passport-size photographs", "College ID card"].map((d, i) => (
                    <div key={i} className="flex items-center gap-2"><Check size={14} className="text-blue-600 shrink-0" /> {d}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 3: Emergency Aid ── */}
          <TabsContent value="emergency" className="space-y-4">
            <p className="text-slate-500 text-sm">If you're in urgent need of financial help, these organizations and platforms can assist you.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EMERGENCY_AID.map((aid, i) => (
                <motion.a key={i} href={aid.link} target="_blank" rel="noreferrer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="block">
                  <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer h-full">
                    <CardContent className="p-6 flex gap-4">
                      <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                        <aid.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">{aid.name}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{aid.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.a>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}
