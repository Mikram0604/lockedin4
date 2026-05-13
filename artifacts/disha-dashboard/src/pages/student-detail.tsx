import { useState } from "react";
import { useParams } from "wouter";
import { Layout } from "@/components/layout";
import { 
  useGetStudent, getGetStudentQueryKey,
  useGetStudentConversations, 
  useGetStudentNudges,
  useSendCheckIn,
  useUpdateStudent
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Phone, MapPin, GraduationCap, Coins, Tag, 
  AlertCircle, Send, CheckCircle2, ChevronLeft,
  MessageSquare, CheckCheck, Clock
} from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentDetail() {
  const { id } = useParams();
  const studentId = parseInt(id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"conversation" | "nudges">("conversation");

  const { data: student, isLoading: loadingStudent } = useGetStudent(studentId, {
    query: { enabled: !!studentId } as any
  });

  const { data: conversations, isLoading: loadingConversations } = useGetStudentConversations(studentId, {
    query: { enabled: !!studentId } as any
  });

  const { data: nudges, isLoading: loadingNudges } = useGetStudentNudges(studentId, {
    query: { enabled: !!studentId } as any
  });

  const sendCheckIn = useSendCheckIn();
  const updateStudent = useUpdateStudent();

  const handleSendCheckIn = () => {
    if (!message.trim()) return;
    sendCheckIn.mutate({ id: studentId, data: { message } }, {
      onSuccess: () => {
        setMessage("");
        toast({ title: "Message sent", description: "Check-in message successfully delivered." });
        queryClient.invalidateQueries({ queryKey: getGetStudentQueryKey(studentId) });
        queryClient.invalidateQueries({ queryKey: [`/api/students/${studentId}/conversations`] });
        queryClient.invalidateQueries({ queryKey: [`/api/students/${studentId}/nudges`] });
      },
      onError: () => {
        toast({ title: "Failed to send message", description: "Please try again later.", variant: "destructive" });
      }
    });
  };

  const handleToggleFlag = () => {
    if (!student) return;
    updateStudent.mutate({ id: studentId, data: { flagged: !student.flagged } }, {
      onSuccess: () => {
        toast({
          title: student.flagged ? "Flag removed" : "Student flagged",
          description: student.flagged ? "Student is no longer flagged." : "Student has been flagged for attention."
        });
        queryClient.invalidateQueries({ queryKey: getGetStudentQueryKey(studentId) });
      }
    });
  };

  if (loadingStudent) {
    return (
      <Layout>
        <div className="p-10 max-w-7xl mx-auto w-full space-y-8">
          <Skeleton className="h-10 w-64 mb-8 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <Skeleton className="h-[500px] w-full rounded-3xl" />
            </div>
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-[600px] w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <div className="p-10 max-w-7xl mx-auto text-center py-32 bg-card rounded-3xl mt-10">
          <h2 className="text-3xl font-bold text-muted-foreground" style={{ fontFamily: "var(--app-font-display)" }}>Student not found.</h2>
        </div>
      </Layout>
    );
  }

  const respondedCount = nudges?.filter(n => n.responded).length ?? 0;
  const pendingCount = nudges?.filter(n => !n.responded).length ?? 0;

  return (
    <Layout>
      <div className="p-10 max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-6">
            <Link href="/students">
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-border/50 bg-card hover:bg-muted hover:text-primary transition-colors shrink-0 shadow-sm mt-1">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--app-font-display)" }}>
                  {student.name}
                </h1>
                <RiskBadge level={student.riskLevel} score={student.riskScore} />
                {student.flagged && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-transparent font-bold px-3 py-1 rounded-full text-xs">
                    <AlertCircle className="w-3 h-3 mr-1 inline-block" /> Flagged
                  </Badge>
                )}
              </div>
              <p className="text-lg text-muted-foreground font-medium flex items-center gap-3">
                <GraduationCap className="w-5 h-5" />
                {student.college} • {student.branch} (Year {student.year})
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant={student.flagged ? "default" : "outline"} 
              className={`rounded-full px-6 h-12 font-bold ${student.flagged ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-card border-border/50 shadow-sm"}`}
              onClick={handleToggleFlag}
              disabled={updateStudent.isPending}
            >
              <AlertCircle className={`w-5 h-5 mr-2 ${student.flagged ? "text-white" : "text-orange-500"}`} />
              {student.flagged ? "Unflag Student" : "Flag for Attention"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-8 lg:col-span-1">
            <Card className="rounded-3xl border-0 shadow-sm bg-card overflow-hidden">
              <CardHeader className="pb-4 px-8 pt-8 bg-muted/20 border-b border-border/50">
                <CardTitle className="text-xl font-semibold" style={{ fontFamily: "var(--app-font-display)" }}>Student Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-8 py-6">
                <ProfileItem icon={Phone} label="Phone" value={student.phone} />
                <ProfileItem icon={MapPin} label="District" value={student.district || "Unknown"} />
                <ProfileItem icon={Coins} label="Family Income" value={student.incomeRange || "Unknown"} />
                <ProfileItem icon={Tag} label="Category" value={student.casteCategory || "General"} />
                <ProfileItem 
                  icon={CheckCircle2} 
                  label="Fee Status" 
                  value={<span className="capitalize">{student.feeStatus}</span>} 
                />
              </CardContent>
            </Card>

            <Card className={`rounded-3xl border-0 shadow-sm overflow-hidden ${student.riskLevel === "critical" ? "bg-red-50/50" : "bg-card"}`}>
              {student.riskLevel === "critical" && <div className="h-2 w-full bg-red-500" />}
              <CardHeader className={`pb-4 px-8 ${student.riskLevel === "critical" ? "pt-6" : "pt-8"} border-b border-border/50`}>
                <CardTitle className="text-xl font-semibold" style={{ fontFamily: "var(--app-font-display)" }}>Welfare Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-8 py-6">
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Days Silent</span>
                  <span className={`font-bold text-lg px-3 py-1 rounded-lg ${student.daysSilent >= 7 ? "bg-red-100 text-red-700" : "bg-background text-foreground"}`}>{student.daysSilent}d</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Language</span>
                  <span className="font-bold text-foreground capitalize bg-background px-3 py-1 rounded-lg">{student.languagePreference}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Onboarding</span>
                  <Badge variant={student.onboardingComplete ? "default" : "secondary"} className={`px-3 py-1 rounded-lg font-bold ${student.onboardingComplete ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}`}>
                    {student.onboardingComplete ? "Complete" : `Step ${student.onboardingStep}`}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Nudge Summary Stats */}
            <Card className="rounded-3xl border-0 shadow-sm bg-card overflow-hidden">
              <CardHeader className="pb-4 px-8 pt-8 bg-muted/20 border-b border-border/50">
                <CardTitle className="text-xl font-semibold" style={{ fontFamily: "var(--app-font-display)" }}>Check-in Stats</CardTitle>
              </CardHeader>
              <CardContent className="px-8 py-6 grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center justify-center bg-emerald-50 rounded-2xl p-4 text-center"
                >
                  <CheckCheck className="w-6 h-6 text-emerald-600 mb-2" />
                  <span className="text-3xl font-bold text-emerald-700">{loadingNudges ? "—" : respondedCount}</span>
                  <span className="text-xs font-semibold text-emerald-600 mt-1">Responded</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`flex flex-col items-center justify-center rounded-2xl p-4 text-center ${pendingCount >= 3 ? "bg-red-50" : "bg-muted/50"}`}
                >
                  <Clock className={`w-6 h-6 mb-2 ${pendingCount >= 3 ? "text-red-500" : "text-muted-foreground"}`} />
                  <span className={`text-3xl font-bold ${pendingCount >= 3 ? "text-red-700" : "text-foreground"}`}>{loadingNudges ? "—" : pendingCount}</span>
                  <span className={`text-xs font-semibold mt-1 ${pendingCount >= 3 ? "text-red-600" : "text-muted-foreground"}`}>No Response</span>
                </motion.div>
                {pendingCount >= 3 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-2 text-xs text-red-600 font-semibold text-center bg-red-50 rounded-xl px-3 py-2"
                  >
                    3+ ignored nudges adds +2 to risk score
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel with Tabs */}
          <div className="lg:col-span-2 space-y-0 flex flex-col h-[calc(100vh-14rem)] min-h-[640px]">
            {/* Tab Bar */}
            <div className="flex gap-1 bg-muted/40 p-1 rounded-2xl mb-4 w-fit">
              <button
                onClick={() => setActiveTab("conversation")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "conversation" 
                    ? "bg-card shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Conversations
                {conversations && conversations.length > 0 && (
                  <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">{conversations.length}</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("nudges")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "nudges" 
                    ? "bg-card shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Send className="w-4 h-4" />
                Nudge History
                {nudges && nudges.length > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${pendingCount >= 3 ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"}`}>
                    {nudges.length}
                  </span>
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "conversation" ? (
                <motion.div
                  key="conversation"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <Card className="flex-1 flex flex-col overflow-hidden rounded-3xl border-0 shadow-sm bg-card">
                    <CardHeader className="pb-6 px-8 pt-8 border-b border-border/50 bg-muted/20 shrink-0">
                      <CardTitle className="text-2xl font-semibold" style={{ fontFamily: "var(--app-font-display)" }}>Conversation History</CardTitle>
                      <CardDescription className="text-base font-medium">Recent interactions via WhatsApp/SMS</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-8 space-y-8 bg-background/30">
                      {loadingConversations ? (
                        <div className="space-y-6">
                          <Skeleton className="h-24 w-3/4 rounded-2xl" />
                          <Skeleton className="h-24 w-3/4 ml-auto rounded-2xl" />
                          <Skeleton className="h-24 w-3/4 rounded-2xl" />
                        </div>
                      ) : conversations?.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 opacity-50" />
                          </div>
                          <p className="text-lg font-medium">No conversation history yet.</p>
                          <p className="text-sm">Send a check-in to start the conversation.</p>
                        </div>
                      ) : (
                        <div className="space-y-6 flex flex-col-reverse">
                          {conversations?.map((msg, i) => {
                            const isInbound = msg.direction === "inbound";
                            return (
                              <motion.div 
                                key={msg.id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className={`flex flex-col ${isInbound ? "items-start" : "items-end"}`}
                              >
                                <div className={`max-w-[85%] rounded-3xl p-5 shadow-sm ${
                                  isInbound 
                                    ? "bg-card border border-border/50 text-foreground rounded-bl-sm" 
                                    : "bg-primary text-primary-foreground rounded-br-sm"
                                }`}>
                                  <p className="whitespace-pre-wrap text-base font-medium leading-relaxed">{msg.message}</p>
                                </div>
                                <div className="flex items-center gap-3 mt-2 px-2">
                                  <span className="text-xs font-semibold text-muted-foreground">
                                    {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                                  </span>
                                  {!isInbound && msg.agentType && (
                                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 rounded-full font-bold uppercase tracking-wider bg-muted border-transparent text-muted-foreground">
                                      {msg.agentType}
                                    </Badge>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                    <div className="p-6 bg-muted/20 border-t border-border/50 shrink-0">
                      <div className="flex gap-4 bg-background p-2 rounded-3xl border border-border/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
                        <Textarea 
                          placeholder="Type a check-in message..." 
                          className="min-h-[60px] border-0 bg-transparent resize-none focus-visible:ring-0 text-base font-medium py-4 px-4"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button 
                          className="h-auto aspect-square rounded-2xl w-16 shrink-0 bg-primary hover:bg-primary/90" 
                          onClick={handleSendCheckIn}
                          disabled={!message.trim() || sendCheckIn.isPending}
                        >
                          {sendCheckIn.isPending 
                            ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> 
                            : <Send className="w-6 h-6 ml-1" />
                          }
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="nudges"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <Card className="flex-1 flex flex-col overflow-hidden rounded-3xl border-0 shadow-sm bg-card">
                    <CardHeader className="pb-6 px-8 pt-8 border-b border-border/50 bg-muted/20 shrink-0">
                      <CardTitle className="text-2xl font-semibold" style={{ fontFamily: "var(--app-font-display)" }}>Nudge History</CardTitle>
                      <CardDescription className="text-base font-medium">
                        Check-ins sent by the counselor — tracks whether the student replied
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-8 bg-background/30">
                      {loadingNudges ? (
                        <div className="space-y-4">
                          {[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
                        </div>
                      ) : nudges?.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 opacity-50" />
                          </div>
                          <p className="text-lg font-medium">No check-ins sent yet.</p>
                          <p className="text-sm">Use the Conversations tab to send the first one.</p>
                        </div>
                      ) : (
                        <motion.div
                          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                          initial="hidden"
                          animate="show"
                          className="space-y-4"
                        >
                          {nudges?.map((nudge) => (
                            <motion.div
                              key={nudge.id}
                              variants={{
                                hidden: { opacity: 0, y: 12 },
                                show: { opacity: 1, y: 0 }
                              }}
                              className={`rounded-2xl border p-6 transition-colors ${
                                nudge.responded 
                                  ? "bg-emerald-50/50 border-emerald-200/60" 
                                  : "bg-card border-border/50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground leading-relaxed line-clamp-3">
                                    {nudge.message}
                                  </p>
                                  <div className="flex items-center gap-3 mt-3">
                                    <span className="text-xs text-muted-foreground font-medium">
                                      {formatDistanceToNow(new Date(nudge.createdAt), { addSuffix: true })}
                                    </span>
                                    <span className="text-xs text-muted-foreground">·</span>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                      {nudge.triggerReason.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  {nudge.responded ? (
                                    <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold">
                                      <CheckCheck className="w-3.5 h-3.5" />
                                      Replied
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs font-bold">
                                      <Clock className="w-3.5 h-3.5" />
                                      Awaiting
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ProfileItem({ icon: Icon, label, value }: { icon: any, label: string, value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0 border border-border/50">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
        <div className="text-base font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

function RiskBadge({ level, score }: { level: string, score: number }) {
  const styles: Record<string, string> = {
    critical: "bg-red-100 text-red-800 border-transparent font-bold shadow-sm shadow-red-500/10",
    high: "bg-orange-100 text-orange-800 border-transparent font-bold",
    medium: "bg-amber-100 text-amber-800 border-transparent font-bold",
    low: "bg-emerald-100 text-emerald-800 border-transparent font-bold",
  };
  return (
    <Badge variant="outline" className={`px-4 py-1.5 text-sm rounded-full ${styles[level] || "bg-gray-100"}`}>
      <span className="uppercase tracking-wider mr-2">{level}</span>
      <span className="opacity-70 bg-black/5 px-2 py-0.5 rounded-md font-mono">{score}/15</span>
    </Badge>
  );
}
