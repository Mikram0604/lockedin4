import { Layout } from "@/components/layout";
import { useListRiskFlags, useResolveRiskFlag, getListRiskFlagsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, CheckCircle2, ChevronRight, SearchX } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function Alerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: flags, isLoading } = useListRiskFlags(
    { resolved: "false" },
    { query: { refetchInterval: 60000 } as any }
  );

  const resolveFlag = useResolveRiskFlag();

  const handleResolve = (id: number) => {
    resolveFlag.mutate({ id }, {
      onSuccess: () => {
        toast({
          title: "Alert resolved",
          description: "The risk flag has been marked as resolved."
        });
        queryClient.invalidateQueries({ queryKey: getListRiskFlagsQueryKey({ resolved: "false" }) });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      }
    });
  };

  return (
    <Layout>
      <div className="p-10 max-w-5xl mx-auto w-full space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--app-font-display)" }}>Alert Inbox</h1>
          <p className="text-lg text-muted-foreground">Unresolved student risk flags requiring immediate attention.</p>
        </div>

        {isLoading ? (
          <div className="space-y-6 mt-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-3xl" />
            ))}
          </div>
        ) : flags?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="border-0 shadow-sm bg-card mt-10 rounded-3xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
              <CardContent className="flex flex-col items-center justify-center py-32 text-center relative z-10">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </motion.div>
                <h3 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: "var(--app-font-display)" }}>Inbox Zero</h3>
                <p className="text-lg text-muted-foreground max-w-md font-medium">
                  There are no active risk flags. Great job keeping up with student welfare!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6 mt-10">
            <AnimatePresence>
              {flags?.map((flag, i) => (
                <motion.div
                  key={flag.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.1 }}
                  layout
                >
                  <Card 
                    className={`overflow-hidden transition-all rounded-3xl border-0 shadow-sm relative ${
                      flag.severity === 'critical' ? 'bg-red-50/30' : 'bg-card'
                    }`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                      flag.severity === 'critical' ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 
                      flag.severity === 'high' ? 'bg-orange-500' : 'bg-amber-400'
                    }`} />
                    <CardContent className="p-8 pl-10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex gap-6 flex-1">
                          <motion.div 
                            animate={flag.severity === 'critical' ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={`mt-1 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                              flag.severity === 'critical' ? 'bg-red-100 text-red-600' : 
                              flag.severity === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'
                            }`}
                          >
                            <AlertTriangle className="w-7 h-7" />
                          </motion.div>
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--app-font-display)" }}>{flag.studentName}</h3>
                              <Badge variant="outline" className={`px-3 py-1 font-bold text-xs rounded-full uppercase tracking-wider border-transparent ${
                                flag.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                                flag.severity === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {flag.severity} RISK
                              </Badge>
                              <span className="text-sm font-mono font-semibold bg-muted px-2 py-1 rounded-md text-muted-foreground">Score: {flag.riskScore}/15</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground bg-background px-3 py-1 rounded-lg border border-border/50">{flag.studentCollege}</span>
                              <span className="text-xs font-semibold text-muted-foreground">
                                Flagged {formatDistanceToNow(new Date(flag.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-foreground text-base leading-relaxed mt-4 bg-background/50 p-5 rounded-2xl border border-border/50 font-medium">
                              {flag.reason}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col gap-3 shrink-0">
                          <Button 
                            onClick={() => handleResolve(flag.id)}
                            disabled={resolveFlag.isPending}
                            className={`rounded-full h-12 px-6 font-bold w-full md:w-auto ${
                              flag.severity === 'critical' ? 'bg-red-600 hover:bg-red-700 text-white' : ''
                            }`}
                          >
                            {resolveFlag.isPending ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : (
                              <>
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                Resolve Alert
                              </>
                            )}
                          </Button>
                          <Link href={`/students/${flag.studentId}`}>
                            <Button variant="outline" className="rounded-full h-12 px-6 font-bold w-full md:w-auto border-border/50 bg-card hover:bg-muted">
                              View Profile <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
}
