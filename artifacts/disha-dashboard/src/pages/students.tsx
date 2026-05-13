import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useListStudents } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Students() {
  const [search, setSearch] = useState("");
  const [riskLevel, setRiskLevel] = useState<string>("all");

  const queryParams: any = {};
  if (search.trim()) queryParams.search = search;
  if (riskLevel !== "all") queryParams.riskLevel = riskLevel;

  const { data: students, isLoading } = useListStudents(queryParams);

  return (
    <Layout>
      <div className="p-10 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--app-font-display)" }}>Students</h1>
            <p className="text-lg text-muted-foreground">Manage and monitor your assigned students.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-3xl border-0 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search by name, college, or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 bg-muted/50 border-0 h-14 rounded-2xl text-base focus-visible:ring-primary/20"
            />
          </div>
          <Select value={riskLevel} onValueChange={setRiskLevel}>
            <SelectTrigger className="w-full sm:w-[220px] bg-muted/50 border-0 h-14 rounded-2xl text-base focus:ring-primary/20">
              <div className="flex items-center gap-3 font-medium">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <SelectValue placeholder="All Risk Levels" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-0 shadow-lg">
              <SelectItem value="all" className="rounded-xl cursor-pointer">All Risk Levels</SelectItem>
              <SelectItem value="critical" className="rounded-xl cursor-pointer">Critical</SelectItem>
              <SelectItem value="high" className="rounded-xl cursor-pointer">High</SelectItem>
              <SelectItem value="medium" className="rounded-xl cursor-pointer">Medium</SelectItem>
              <SelectItem value="low" className="rounded-xl cursor-pointer">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-3xl border-0 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b-border/50 hover:bg-muted/30">
                <TableHead className="h-16 px-6 font-semibold text-muted-foreground">Name</TableHead>
                <TableHead className="h-16 px-6 font-semibold text-muted-foreground">College & Branch</TableHead>
                <TableHead className="h-16 px-6 font-semibold text-muted-foreground">Risk Score</TableHead>
                <TableHead className="h-16 px-6 font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="h-16 px-6 font-semibold text-muted-foreground">Last Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`} className="border-b-border/50">
                      <TableCell className="px-6 py-5"><Skeleton className="h-6 w-40 rounded-lg" /></TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-48 rounded-lg" />
                          <Skeleton className="h-4 w-32 rounded-lg" />
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5"><Skeleton className="h-6 w-16 rounded-lg" /></TableCell>
                      <TableCell className="px-6 py-5"><Skeleton className="h-8 w-24 rounded-full" /></TableCell>
                      <TableCell className="px-6 py-5"><Skeleton className="h-5 w-24 rounded-lg" /></TableCell>
                    </TableRow>
                  ))
                ) : students?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-lg text-muted-foreground font-medium">
                      No students found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  students?.map((student, i) => (
                    <motion.tr 
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b-border/50 hover:bg-muted/50 cursor-pointer group transition-colors"
                    >
                      <TableCell className="px-6 py-5">
                        <Link href={`/students/${student.id}`} className="block">
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-3 text-base">
                            {student.name}
                            {student.flagged && <AlertTriangle className="w-4 h-4 text-orange-500 fill-orange-500/20" />}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="text-sm">
                          <div className="font-semibold text-foreground">{student.college}</div>
                          <div className="text-muted-foreground font-medium mt-1">{student.branch} • Year {student.year}</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <span className="font-mono font-semibold text-base bg-muted px-3 py-1 rounded-lg">{student.riskScore} <span className="text-muted-foreground text-sm">/ 15</span></span>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <RiskBadge level={student.riskLevel} />
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="text-sm font-medium text-muted-foreground bg-background border px-3 py-1 rounded-lg inline-block">
                          {student.daysSilent > 0 ? `${student.daysSilent} days ago` : 'Today'}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}

function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    critical: "bg-red-100 text-red-800 border-transparent uppercase tracking-wider font-bold shadow-sm shadow-red-500/10",
    high: "bg-orange-100 text-orange-800 border-transparent font-bold",
    medium: "bg-amber-100 text-amber-800 border-transparent font-bold",
    low: "bg-emerald-100 text-emerald-800 border-transparent font-bold",
  };
  
  return (
    <Badge variant="outline" className={`px-3 py-1 text-xs rounded-full ${styles[level] || "bg-gray-100"}`}>
      {level}
    </Badge>
  );
}
