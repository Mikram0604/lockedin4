import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetDashboardSummary, useListRiskFlags } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Users, BellRing, Send, GraduationCap, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({
    query: { refetchInterval: 60000 } as any
  });

  const { data: riskFlags, isLoading: loadingFlags } = useListRiskFlags(
    { severity: "critical", resolved: "false" },
    { query: { refetchInterval: 60000 } as any }
  );

  return (
    <Layout>
      <div className="p-10 max-w-7xl mx-auto w-full space-y-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--app-font-display)" }}>Good morning.</h1>
          <p className="text-lg text-muted-foreground">Here is your daily overview of student welfare.</p>
        </div>

        {loadingSummary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="rounded-3xl border-0 shadow-sm bg-card"><CardContent className="p-6"><Skeleton className="h-20 w-full rounded-2xl" /></CardContent></Card>
            ))}
          </div>
        ) : summary ? (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
          >
            <motion.div variants={item}><StatCard title="Total Students" value={summary.totalStudents} icon={Users} href="/students" /></motion.div>
            <motion.div variants={item}><StatCard title="At Risk Today" value={summary.atRiskToday} icon={AlertCircle} alert={summary.atRiskToday > 0} href="/alerts" /></motion.div>
            <motion.div variants={item}><StatCard title="Critical Flags" value={summary.criticalCount} icon={BellRing} alert={summary.criticalCount > 0} href="/alerts" /></motion.div>
            <motion.div variants={item}><StatCard title="Nudges Sent" value={summary.nudgesSentToday} icon={Send} href="/students" /></motion.div>
            <motion.div variants={item}><StatCard title="Scholarships" value={summary.scholarshipsAssisted} icon={GraduationCap} href="/scholarships" /></motion.div>
          </motion.div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-2"
          >
            <Card className="shadow-sm border-0 bg-card rounded-3xl h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-semibold" style={{ fontFamily: "var(--app-font-display)" }}>Critical Alerts</CardTitle>
                  <CardDescription className="text-base">Unresolved high-priority risk flags.</CardDescription>
                </div>
                <Link href="/alerts" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                {loadingFlags ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-20 w-full rounded-2xl" />
                  </div>
                ) : riskFlags && riskFlags.length > 0 ? (
                  <div className="space-y-4">
                    {riskFlags.slice(0, 5).map(flag => (
                      <Link key={flag.id} href={`/students/${flag.studentId}`}>
                        <motion.div 
                          whileHover={{ scale: 1.01, backgroundColor: "var(--red-50)" }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className="flex items-center justify-between p-5 rounded-2xl border border-red-100/50 bg-red-50/30 cursor-pointer group"
                        >
                          <div className="flex items-start gap-4">
                            <motion.div 
                              animate={{ scale: [1, 1.1, 1] }} 
                              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                              className="mt-1"
                            >
                              <AlertCircle className="w-6 h-6 text-red-500" />
                            </motion.div>
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-foreground text-lg">{flag.studentName}</span>
                                <span className="text-sm text-muted-foreground font-medium bg-background/50 px-2 py-0.5 rounded-lg">{flag.studentCollege}</span>
                              </div>
                              <p className="text-sm text-foreground/80 mt-1 font-medium">{flag.reason}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs font-semibold text-muted-foreground bg-background/50 px-2 py-1 rounded-lg">
                              {formatDistanceToNow(new Date(flag.createdAt), { addSuffix: true })}
                            </span>
                            <div className="flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                              Review <ChevronRight className="w-4 h-4 ml-1" />
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-border">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
                      <BellRing className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--app-font-display)" }}>No critical alerts</h3>
                    <p className="text-muted-foreground">All students seem to be doing well today.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-sm border-0 bg-card rounded-3xl h-full">
              <CardHeader className="pb-6 px-8 pt-8">
                <CardTitle className="text-2xl font-semibold" style={{ fontFamily: "var(--app-font-display)" }}>Risk Breakdown</CardTitle>
                <CardDescription className="text-base">Current student risk distribution.</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                {loadingSummary ? (
                  <Skeleton className="h-64 w-full rounded-2xl" />
                ) : summary ? (
                  <div className="space-y-8 mt-2">
                    <RiskRow label="Critical" count={summary.riskBreakdown.critical} total={summary.totalStudents} color="bg-red-500" />
                    <RiskRow label="High" count={summary.riskBreakdown.high} total={summary.totalStudents} color="bg-orange-500" />
                    <RiskRow label="Medium" count={summary.riskBreakdown.medium} total={summary.totalStudents} color="bg-amber-400" />
                    <RiskRow label="Low" count={summary.riskBreakdown.low} total={summary.totalStudents} color="bg-emerald-500" />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, alert, href }: { title: string, value: number, icon: any, alert?: boolean, href?: string }) {
  const cardContent = (
    <Card className={`rounded-3xl border-0 shadow-sm relative overflow-hidden transition-transform ${href ? "hover:scale-[1.02] cursor-pointer" : ""} ${alert ? "bg-red-50/50" : "bg-card"}`}>
      {alert && <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />}
      <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-muted-foreground">{title}</p>
          <div className={`p-2 rounded-xl ${alert ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--app-font-display)" }}>
          {value}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }
  return cardContent;
}

function RiskRow({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="text-muted-foreground font-medium">{count} students</span>
      </div>
      <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
        <motion.div 
          className={`h-full ${color} rounded-full`} 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
