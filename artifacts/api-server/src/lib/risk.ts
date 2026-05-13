import { eq, desc } from "drizzle-orm";
import { db, studentsTable, riskFlagsTable, nudgeHistoryTable } from "@workspace/db";
import { logger } from "./logger";

export async function recalculateRiskScore(studentId: number): Promise<void> {
  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
  if (!student) return;

  let score = 0;

  const daysSilent = student.daysSilent ?? 0;
  if (daysSilent >= 14) score += 5;
  else if (daysSilent >= 7) score += 3;

  if (student.feeStatus === "pending") score += 3;
  else if (student.feeStatus === "partial") score += 1;

  const recentNudges = await db
    .select()
    .from(nudgeHistoryTable)
    .where(eq(nudgeHistoryTable.studentId, studentId))
    .orderBy(desc(nudgeHistoryTable.createdAt))
    .limit(5);

  const ignoredNudges = recentNudges.filter(n => !n.responded).length;
  if (ignoredNudges >= 3) score += 2;

  let riskLevel: "low" | "medium" | "high" | "critical";
  if (score >= 10) riskLevel = "critical";
  else if (score >= 7) riskLevel = "high";
  else if (score >= 4) riskLevel = "medium";
  else riskLevel = "low";

  await db.update(studentsTable)
    .set({ riskScore: score, riskLevel, flagged: score >= 7 })
    .where(eq(studentsTable.id, studentId));

  if (score >= 7) {
    const existingFlag = await db
      .select()
      .from(riskFlagsTable)
      .where(eq(riskFlagsTable.studentId, studentId))
      .then(rows => rows.find(r => !r.resolved));

    if (!existingFlag) {
      const reasons: string[] = [];
      if (daysSilent >= 7) reasons.push(`${daysSilent} days silent`);
      if (student.feeStatus === "pending") reasons.push("Fee unpaid");
      if (ignoredNudges >= 3) reasons.push(`${ignoredNudges} nudges ignored`);

      await db.insert(riskFlagsTable).values({
        studentId,
        severity: riskLevel as "medium" | "high" | "critical",
        reason: reasons.join(". ") || "High risk score detected",
        riskScore: score,
      });

      logger.info({ studentId, score, riskLevel }, "Risk flag created");
    }
  }
}
