import cron from "node-cron";
import { eq } from "drizzle-orm";
import { db, studentsTable } from "@workspace/db";
import { recalculateRiskScore } from "./risk";
import { logger } from "./logger";

function daysSince(date: Date): number {
  const ms = Date.now() - date.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Scans every student, recomputes daysSilent from lastMessageAt (or createdAt
 * for students who never replied), then re-runs the risk engine for each one.
 */
export async function runSilenceDetector(): Promise<{
  scanned: number;
  riskRecalculated: number;
}> {
  const students = await db.select().from(studentsTable);

  await Promise.all(
    students.map(async (student) => {
      const anchor = student.lastMessageAt ?? student.createdAt;
      const days = daysSince(anchor);

      await db
        .update(studentsTable)
        .set({ daysSilent: days })
        .where(eq(studentsTable.id, student.id));

      await recalculateRiskScore(student.id);
    }),
  );

  logger.info(
    { scanned: students.length },
    "Silence detector run complete",
  );

  return { scanned: students.length, riskRecalculated: students.length };
}

/**
 * Schedules the silence detector to run every day at 06:00 UTC.
 * Call once at server startup.
 */
export function scheduleSilenceDetector(): void {
  cron.schedule("0 6 * * *", async () => {
    logger.info("Silence detector cron fired");
    try {
      await runSilenceDetector();
    } catch (err) {
      logger.error({ err }, "Silence detector cron failed");
    }
  });

  logger.info("Silence detector scheduled (daily 06:00 UTC)");
}
