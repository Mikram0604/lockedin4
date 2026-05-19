import { useState, useEffect } from "react";
import { StudentLayout } from "@/components/student-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookOpen, ExternalLink, GraduationCap, Briefcase, MapPin, Phone, Building2, Clock, BookMarked, Code, Cpu, Wrench, FlaskConical, Landmark, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ───── Year-wise resources ───── */
const YEAR_RESOURCES: Record<string, { title: string; items: { icon: any; heading: string; points: string[] }[] }> = {
  "1": {
    title: "First Year Survival Guide",
    items: [
      { icon: BookOpen, heading: "Academics", points: [
        "Attend all classes — 75% attendance is mandatory in most colleges",
        "Get NPTEL access immediately: nptel.ac.in (free courses by IIT professors)",
        "Join your college library and get a card in Week 1",
        "Form a study group of 3-4 students — group learning is 40% more effective",
        "Don't ignore labs — practicals often carry 50% of internal marks",
      ]},
      { icon: GraduationCap, heading: "College Life", points: [
        "Register for NSS or NCC in the first month — looks great on your resume",
        "Anti-ragging helpline: 1800-180-5522 (free, 24x7)",
        "Know your college welfare officer's name and office location",
        "Join at least one technical club and one cultural club",
        "Save your semester timetable and exam schedule on your phone",
      ]},
      { icon: Briefcase, heading: "Documents to Keep Ready", points: [
        "Aadhar card (original + 5 photocopies)",
        "Income & caste certificates (if applicable)",
        "Bank passbook (preferably Jan Dhan or student account)",
        "10th & 12th marksheets + migration certificate",
        "Passport-size photographs (keep at least 10 copies)",
      ]},
      { icon: Clock, heading: "Important Deadlines", points: [
        "Scholarship applications typically open July–August",
        "Fee concession requests: submit before semester end",
        "NSP Portal opens: usually August each year",
        "Internal assessment submissions: track your college calendar",
      ]},
    ],
  },
  "2": {
    title: "Second Year Growth Guide",
    items: [
      { icon: Code, heading: "Skill Building", points: [
        "Start building a portfolio — even small projects count",
        "Learn Git & GitHub — every tech company expects this",
        "Pick one programming language and go deep (Python, Java, or JavaScript)",
        "Contribute to open-source projects on GitHub — great for your resume",
        "Take Google/Microsoft/AWS free certifications (many are free for students)",
      ]},
      { icon: GraduationCap, heading: "Competitive Exam Awareness", points: [
        "GATE registration opens in September — even if you take it in 4th year, start understanding the syllabus now",
        "GRE/TOEFL for abroad plans — start vocab building early",
        "Look into ISRO, DRDO, and PSU exam eligibility criteria",
        "CAT/MAT for MBA aspirants — coaching usually starts in 2nd year",
      ]},
      { icon: Briefcase, heading: "Internship Prep", points: [
        "Create a LinkedIn profile and connect with seniors/alumni",
        "Register on Internshala and start applying for summer internships",
        "Build a one-page resume — focus on skills and projects, not just marks",
        "Attend workshops and hackathons — they're networking gold",
      ]},
      { icon: BookMarked, heading: "Academic Strategy", points: [
        "Identify your core subjects vs. electives — focus accordingly",
        "Maintain a CGPA above 7.0 to be eligible for most placements",
        "Start reading research papers in your area of interest",
        "Ask professors about research assistant opportunities",
      ]},
    ],
  },
  "3": {
    title: "Third Year — Placement & Career Prep",
    items: [
      { icon: Briefcase, heading: "Placement Preparation", points: [
        "Start practicing aptitude questions daily (IndiaBix, PrepInsta)",
        "Solve at least 2 coding problems daily on LeetCode or HackerRank",
        "Prepare for Group Discussions — read newspapers daily for 15 minutes",
        "Mock interviews with friends — practice introducing yourself in 60 seconds",
        "Research companies that visit your campus — prepare company-specific",
      ]},
      { icon: Code, heading: "Technical Readiness", points: [
        "Build 2-3 solid projects and host them on GitHub with READMEs",
        "Learn system design basics — even a surface-level understanding helps",
        "Get comfortable with at least one framework (React, Spring, Django, etc.)",
        "AWS/Azure student credits — build and deploy something real",
      ]},
      { icon: GraduationCap, heading: "Higher Studies Pathway", points: [
        "GATE exam is usually in February — register by September",
        "For MS abroad: start GRE prep, research universities, check deadlines",
        "Build relationships with professors for recommendation letters",
        "Look into IIT/NIT M.Tech admission cutoffs for your branch",
      ]},
      { icon: BookMarked, heading: "Resume & Portfolio", points: [
        "Get your resume reviewed by placement cell or seniors",
        "Create a personal portfolio website (even a simple one helps)",
        "List certifications, projects, internships, and extracurriculars",
        "Prepare a 2-minute 'tell me about yourself' pitch",
      ]},
    ],
  },
  "4": {
    title: "Final Year — Finish Strong",
    items: [
      { icon: GraduationCap, heading: "Final Project & Thesis", points: [
        "Choose a project topic that genuinely interests you — you'll spend months on it",
        "Meet your project guide regularly — don't wait for the last month",
        "Document everything as you go — the report is easier to write in real-time",
        "If possible, make your project solve a real problem — it stands out in interviews",
      ]},
      { icon: Briefcase, heading: "Placement Season", points: [
        "Keep all documents ready: resume, marksheets, certificates, ID proof",
        "Apply to off-campus drives too — don't rely only on campus placements",
        "Negotiate salary politely — research market rates for your role",
        "Keep applying until you have an offer letter in hand — don't stop early",
      ]},
      { icon: Landmark, heading: "Higher Studies Applications", points: [
        "GATE results come in March — apply to IIT/NIT/IISC immediately after",
        "For MS abroad: applications are typically due between Oct–Jan",
        "Prepare a strong Statement of Purpose (SOP) — get it reviewed by mentors",
        "Apply for university scholarships and teaching assistantships",
      ]},
      { icon: Clock, heading: "Before You Graduate", points: [
        "Collect all original certificates from the college office",
        "Get a provisional degree certificate",
        "Obtain character/conduct certificate",
        "Maintain contact with 5-10 classmates — your network is your net worth",
        "Update LinkedIn with 'Open to Work' if job searching",
      ]},
    ],
  },
};

/* ───── free courses by branch ───── */
const COURSES: Record<string, { name: string; platform: string; link: string; free: boolean }[]> = {
  "Computer Science": [
    { name: "CS50: Introduction to Computer Science", platform: "Harvard (edX)", link: "https://cs50.harvard.edu/", free: true },
    { name: "Data Structures & Algorithms", platform: "NPTEL (IIT)", link: "https://nptel.ac.in/courses/106102064", free: true },
    { name: "Machine Learning", platform: "Coursera (Stanford)", link: "https://www.coursera.org/learn/machine-learning", free: true },
    { name: "Web Development Bootcamp", platform: "freeCodeCamp", link: "https://www.freecodecamp.org/", free: true },
    { name: "Google IT Support Certificate", platform: "Google (Coursera)", link: "https://www.coursera.org/professional-certificates/google-it-support", free: true },
    { name: "Python for Everybody", platform: "Coursera (Michigan)", link: "https://www.coursera.org/specializations/python", free: true },
  ],
  "Electronics": [
    { name: "Circuits & Electronics", platform: "MIT OCW", link: "https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/", free: true },
    { name: "Digital Circuits", platform: "NPTEL (IIT)", link: "https://nptel.ac.in/courses/117106086", free: true },
    { name: "Embedded Systems", platform: "NPTEL (IIT Kharagpur)", link: "https://nptel.ac.in/courses/108105057", free: true },
    { name: "IoT (Internet of Things)", platform: "Coursera", link: "https://www.coursera.org/learn/iot", free: true },
    { name: "VLSI Design", platform: "NPTEL", link: "https://nptel.ac.in/courses/117106092", free: true },
  ],
  "Mechanical": [
    { name: "Engineering Mechanics", platform: "NPTEL (IIT Madras)", link: "https://nptel.ac.in/courses/112106286", free: true },
    { name: "Thermodynamics", platform: "MIT OCW", link: "https://ocw.mit.edu/courses/2-005-thermal-fluids-engineering-i-fall-2006/", free: true },
    { name: "CAD/CAM", platform: "NPTEL", link: "https://nptel.ac.in/courses/112104028", free: true },
    { name: "Introduction to Manufacturing", platform: "MIT OCW", link: "https://ocw.mit.edu/courses/2-008-design-and-manufacturing-ii-spring-2004/", free: true },
    { name: "AutoCAD Essentials", platform: "Autodesk (Free for students)", link: "https://www.autodesk.com/education/free-software/autocad", free: true },
  ],
  "Civil": [
    { name: "Structural Analysis", platform: "NPTEL (IIT Kharagpur)", link: "https://nptel.ac.in/courses/105105109", free: true },
    { name: "Geotechnical Engineering", platform: "NPTEL", link: "https://nptel.ac.in/courses/105101011", free: true },
    { name: "Introduction to Building Technology", platform: "MIT OCW", link: "https://ocw.mit.edu/courses/4-401-introduction-to-building-technology-fall-2006/", free: true },
    { name: "AutoCAD Civil 3D", platform: "Autodesk (Free)", link: "https://www.autodesk.com/education/free-software/autocad", free: true },
    { name: "Environmental Engineering", platform: "NPTEL", link: "https://nptel.ac.in/courses/105104019", free: true },
  ],
  "All Branches": [
    { name: "Soft Skills for Professionals", platform: "NPTEL", link: "https://nptel.ac.in/courses/109104031", free: true },
    { name: "Technical Writing", platform: "Coursera (Moscow)", link: "https://www.coursera.org/learn/technical-writing", free: true },
    { name: "Critical Thinking", platform: "Coursera (Duke)", link: "https://www.coursera.org/learn/critical-thinking", free: true },
    { name: "Financial Literacy", platform: "Khan Academy", link: "https://www.khanacademy.org/economics-finance-domain/core-finance", free: true },
    { name: "English Communication Skills", platform: "NPTEL (IIT Madras)", link: "https://nptel.ac.in/courses/109106122", free: true },
  ],
};

/* ───── internship platforms ───── */
const INTERNSHIPS = [
  { name: "Internshala", desc: "India's #1 internship platform — tech, marketing, design, finance & more.", link: "https://internshala.com/", color: "bg-blue-50 text-blue-600" },
  { name: "LinkedIn Jobs", desc: "Filter by 'Internship' and location. Set alerts for your preferred roles.", link: "https://www.linkedin.com/jobs/", color: "bg-sky-50 text-sky-600" },
  { name: "AngelList (Wellfound)", desc: "Startup internships — often more hands-on experience than big companies.", link: "https://wellfound.com/", color: "bg-orange-50 text-orange-600" },
  { name: "NITI Aayog Internship", desc: "Government internship for policy research. Stipend + certificate.", link: "https://www.niti.gov.in/internship", color: "bg-emerald-50 text-emerald-600" },
  { name: "ISRO Summer Programs", desc: "Seasonal research programs for engineering & science students.", link: "https://www.isro.gov.in/", color: "bg-indigo-50 text-indigo-600" },
  { name: "IAS/DRDO Summer Training", desc: "Defense and government R&D summer training for eligible engineering students.", link: "https://www.drdo.gov.in/", color: "bg-red-50 text-red-600" },
];

/* ───── campus essentials ───── */
const CAMPUS_ESSENTIALS = [
  { icon: Phone, label: "Anti-Ragging Helpline", value: "1800-180-5522 (free, 24x7)" },
  { icon: Phone, label: "Women's Helpline", value: "181 (free, 24x7)" },
  { icon: Phone, label: "Student Distress Helpline", value: "1800-599-0019 (AICTE)" },
  { icon: MapPin, label: "UGC Grievance Portal", value: "ugc.ac.in/grievance" },
  { icon: Building2, label: "National Scholarship Portal", value: "scholarships.gov.in" },
  { icon: GraduationCap, label: "NPTEL Free Courses", value: "nptel.ac.in" },
];

/* ───── CGPA calculator ───── */
function CGPACalculator() {
  const [subjects, setSubjects] = useState([{ name: "", credits: "", grade: "" }]);
  const [result, setResult] = useState<number | null>(null);

  const gradePoints: Record<string, number> = { "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "P": 4, "F": 0 };

  const addSubject = () => setSubjects([...subjects, { name: "", credits: "", grade: "" }]);
  const removeSubject = (i: number) => setSubjects(subjects.filter((_, idx) => idx !== i));
  const updateSubject = (i: number, field: string, value: string) => {
    const updated = [...subjects];
    (updated[i] as any)[field] = value;
    setSubjects(updated);
  };

  const calculate = () => {
    let totalCredits = 0, totalPoints = 0;
    for (const s of subjects) {
      const c = parseFloat(s.credits);
      const g = gradePoints[s.grade.toUpperCase()];
      if (!isNaN(c) && g !== undefined) {
        totalCredits += c;
        totalPoints += c * g;
      }
    }
    if (totalCredits > 0) setResult(Math.round((totalPoints / totalCredits) * 100) / 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900">SGPA / CGPA Calculator</h3>
        <Button variant="outline" size="sm" onClick={addSubject} className="rounded-xl">+ Add Subject</Button>
      </div>
      <div className="space-y-3">
        {subjects.map((s, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input placeholder="Subject" value={s.name} onChange={e => updateSubject(i, "name", e.target.value)} className="flex-1 rounded-xl" />
            <Input placeholder="Credits" value={s.credits} onChange={e => updateSubject(i, "credits", e.target.value)} className="w-20 rounded-xl" type="number" />
            <select value={s.grade} onChange={e => updateSubject(i, "grade", e.target.value)} className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm">
              <option value="">Grade</option>
              {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {subjects.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeSubject(i)} className="text-red-400 hover:text-red-600 shrink-0">✕</Button>}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={calculate} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Calculate</Button>
        {result !== null && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-2xl font-bold text-blue-600">
            SGPA: {result}
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ───── main component ───── */
export default function StudentResources() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [activeYear, setActiveYear] = useState("1");

  useEffect(() => {
    const phone = localStorage.getItem("studentPhone");
    if (phone) {
      fetch(`/api/web-chat/profile?phone=${encodeURIComponent(phone)}`)
        .then(res => res.json())
        .then(data => {
          if (data.student) {
            setProfile(data.student);
            setActiveYear(String(data.student.year || "1"));
            // auto-select branch if available
            const b = data.student.branch?.toLowerCase() || "";
            if (b.includes("computer") || b.includes("cs") || b.includes("it") || b.includes("software")) setSelectedBranch("Computer Science");
            else if (b.includes("electron") || b.includes("ece") || b.includes("eee")) setSelectedBranch("Electronics");
            else if (b.includes("mechan") || b.includes("mech")) setSelectedBranch("Mechanical");
            else if (b.includes("civil")) setSelectedBranch("Civil");
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, []);

  const yearData = YEAR_RESOURCES[activeYear] || YEAR_RESOURCES["1"];

  if (loading) {
    return <StudentLayout><div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div></StudentLayout>;
  }

  return (
    <StudentLayout>
      <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full overflow-y-auto h-screen pb-32">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6 mb-8">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--app-font-display)" }}>Academic Resources</h1>
            <p className="text-slate-500">Personalized for {profile?.name || "you"} — {yearData.title}</p>
          </div>
        </div>

        <Tabs defaultValue="yearwise" className="space-y-6">
          <TabsList className="bg-slate-100 rounded-2xl p-1 h-auto flex-wrap">
            <TabsTrigger value="yearwise" className="rounded-xl data-[state=active]:bg-white">📘 Year-Wise Guide</TabsTrigger>
            <TabsTrigger value="courses" className="rounded-xl data-[state=active]:bg-white">🎓 Free Courses</TabsTrigger>
            <TabsTrigger value="internships" className="rounded-xl data-[state=active]:bg-white">💼 Internships</TabsTrigger>
            <TabsTrigger value="campus" className="rounded-xl data-[state=active]:bg-white">🏫 Campus Essentials</TabsTrigger>
            <TabsTrigger value="calculator" className="rounded-xl data-[state=active]:bg-white">🧮 CGPA Calculator</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Year-wise Guide ── */}
          <TabsContent value="yearwise" className="space-y-4">
            <div className="flex gap-2">
              {Object.keys(YEAR_RESOURCES).map(y => (
                <button key={y} onClick={() => setActiveYear(y)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeYear === y ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                  Year {y}
                </button>
              ))}
            </div>
            {yearData.items.map((section, i) => (
              <motion.div key={`${activeYear}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                        <section.icon size={18} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{section.heading}</h3>
                    </div>
                    <ul className="space-y-2">
                      {section.points.map((p, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ── Tab 2: Free Courses ── */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              {Object.keys(COURSES).map(branch => (
                <button key={branch} onClick={() => setSelectedBranch(branch)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedBranch === branch ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {branch}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {(COURSES[selectedBranch] || COURSES["All Branches"]).map((course, i) => (
                <motion.a key={i} href={course.link} target="_blank" rel="noreferrer"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="block">
                  <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                          <BookMarked size={18} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{course.name}</h4>
                          <p className="text-sm text-slate-500">{course.platform}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg">FREE</span>
                        <ExternalLink size={16} className="text-slate-400" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.a>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab 3: Internships ── */}
          <TabsContent value="internships" className="space-y-4">
            <p className="text-sm text-slate-500">Top platforms and government programs to find internships relevant to your field.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTERNSHIPS.map((item, i) => (
                <motion.a key={i} href={item.link} target="_blank" rel="noreferrer"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="block">
                  <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer h-full">
                    <CardContent className="p-6 flex gap-4">
                      <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">{item.name}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.a>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab 4: Campus Essentials ── */}
          <TabsContent value="campus" className="space-y-4">
            <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
              <div className="h-2 w-full bg-emerald-500" />
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Important Contacts & Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CAMPUS_ESSENTIALS.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                        <item.icon size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{item.label}</h4>
                        <p className="text-sm text-slate-600 font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm bg-amber-50 overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <h4 className="font-bold text-amber-900 mb-3">💡 Pro Tip for Students</h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Save these helpline numbers on your phone right now. In an emergency, you won't have time to search.
                  Also, visit your college's administrative office in the first week and collect a list of all department heads,
                  hostel wardens, and the student welfare officer — having these contacts early can save you weeks of running around later.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 5: CGPA Calculator ── */}
          <TabsContent value="calculator">
            <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
              <div className="h-2 w-full bg-blue-500" />
              <CardContent className="p-6 sm:p-8">
                <CGPACalculator />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}
