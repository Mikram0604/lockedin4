import { Router, type IRouter } from "express";
import { eq, count, avg, sql } from "drizzle-orm";
import { db, studentsTable, riskFlagsTable, nudgeHistoryTable, conversationsTable } from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalRow] = await db.select({ count: count() }).from(studentsTable);
  const totalStudents = Number(totalRow?.count ?? 0);

  const [atRiskRow] = await db
    .select({ count: count() })
    .from(studentsTable)
    .where(
      sql`${studentsTable.riskLevel} IN ('medium', 'high', 'critical')`
    );
  const atRiskToday = Number(atRiskRow?.count ?? 0);

  const [criticalRow] = await db
    .select({ count: count() })
    .from(studentsTable)
    .where(eq(studentsTable.riskLevel, "critical"));
  const criticalCount = Number(criticalRow?.count ?? 0);

  const [nudgesRow] = await db
    .select({ count: count() })
    .from(nudgeHistoryTable)
    .where(sql`${nudgeHistoryTable.createdAt} >= ${today}`);
  const nudgesSentToday = Number(nudgesRow?.count ?? 0);

  const [scholarshipsRow] = await db
    .select({ count: count() })
    .from(conversationsTable)
    .where(
      sql`${conversationsTable.agentType} = 'walker' AND ${conversationsTable.direction} = 'outbound'`
    );
  const scholarshipsAssisted = Number(scholarshipsRow?.count ?? 0);

  const [onboardingRow] = await db
    .select({ count: count() })
    .from(studentsTable)
    .where(eq(studentsTable.onboardingComplete, true));
  const onboardingComplete = Number(onboardingRow?.count ?? 0);

  const [avgRiskRow] = await db
    .select({ avg: avg(studentsTable.riskScore) })
    .from(studentsTable);
  const averageRiskScore = parseFloat(String(avgRiskRow?.avg ?? "0")) || 0;

  const riskRows = await db
    .select({ riskLevel: studentsTable.riskLevel, count: count() })
    .from(studentsTable)
    .groupBy(studentsTable.riskLevel);

  const riskBreakdown = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const row of riskRows) {
    const lvl = row.riskLevel as keyof typeof riskBreakdown;
    if (lvl in riskBreakdown) riskBreakdown[lvl] = Number(row.count);
  }

  res.json(GetDashboardSummaryResponse.parse({
    totalStudents,
    atRiskToday,
    criticalCount,
    nudgesSentToday,
    scholarshipsAssisted,
    onboardingComplete,
    averageRiskScore,
    riskBreakdown,
  }));
});

export default router;
