import { Layout } from "@/components/layout";
import { useListScholarships } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { GraduationCap, Calendar, Coins, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Scholarships() {
  const { data: scholarships, isLoading } = useListScholarships();

  return (
    <Layout>
      <div className="p-10 max-w-7xl mx-auto w-full space-y-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--app-font-display)" }}>Scholarships</h1>
          <p className="text-lg text-muted-foreground">Active schemes and eligibility criteria for students.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-3xl" />
            ))}
          </div>
        ) : scholarships?.length === 0 ? (
          <div className="text-center py-32 bg-card rounded-3xl border-0 shadow-sm mt-10">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--app-font-display)" }}>No active scholarships</h3>
            <p className="text-lg text-muted-foreground font-medium">There are currently no active schemes in the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            {scholarships?.map((scholarship, i) => {
              const deadlineDate = new Date(scholarship.deadline);
              const isClosingSoon = deadlineDate.getTime() - new Date().getTime() < 14 * 24 * 60 * 60 * 1000; // 14 days

              return (
                <motion.div
                  key={scholarship.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="h-full"
                >
                  <Card className={`h-full flex flex-col rounded-3xl border-0 shadow-sm overflow-hidden ${
                    isClosingSoon && scholarship.isActive ? 'bg-orange-50/30' : 'bg-card'
                  }`}>
                    {isClosingSoon && scholarship.isActive && (
                      <div className="h-1.5 w-full bg-orange-500" />
                    )}
                    <CardHeader className="pb-6 px-8 pt-8 border-b border-border/50 bg-muted/10">
                      <div className="flex justify-between items-start gap-6">
                        <div className="space-y-3">
                          <Badge variant="outline" className="bg-background border-border/50 font-bold px-3 py-1 rounded-full text-xs">
                            {scholarship.category}
                          </Badge>
                          <CardTitle className="text-2xl font-bold leading-tight text-foreground" style={{ fontFamily: "var(--app-font-display)" }}>
                            {scholarship.name}
                          </CardTitle>
                        </div>
                        {scholarship.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-transparent hover:bg-emerald-100 font-bold px-3 py-1 rounded-full text-sm shrink-0 shadow-sm">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="font-bold px-3 py-1 rounded-full text-sm shrink-0">Closed</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-8 flex flex-col justify-between space-y-8 bg-background/30">
                      <p className="text-base text-foreground font-medium leading-relaxed">
                        {scholarship.eligibilitySummary}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/50">
                        <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Coins className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Amount</div>
                            <div className="text-lg font-bold text-foreground">₹{scholarship.amount.toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                        
                        <div className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm ${
                          isClosingSoon && scholarship.isActive ? 'bg-orange-50 border-orange-100' : 'bg-card border-border/50'
                        }`}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            isClosingSoon && scholarship.isActive ? 'bg-orange-200/50' : 'bg-muted/50'
                          }`}>
                            <Calendar className={`w-6 h-6 ${
                              isClosingSoon && scholarship.isActive ? 'text-orange-600' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Deadline</div>
                            <div className={`text-lg font-bold ${isClosingSoon && scholarship.isActive ? 'text-orange-700' : 'text-foreground'}`}>
                              {format(deadlineDate, "MMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
