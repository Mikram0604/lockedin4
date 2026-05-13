import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, riskFlagsTable, studentsTable } from "@workspace/db";
import {
  ListRiskFlagsQueryParams,
  ResolveRiskFlagParams,
  ListRiskFlagsResponse,
  ResolveRiskFlagResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/risk-flags", async (req, res): Promise<void> => {
  const parsed = ListRiskFlagsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { resolved, severity } = parsed.data;

  const rows = await db
    .select({
      id: riskFlagsTable.id,
      studentId: riskFlagsTable.studentId,
      studentName: studentsTable.name,
      studentCollege: studentsTable.college,
      severity: riskFlagsTable.severity,
      reason: riskFlagsTable.reason,
      riskScore: riskFlagsTable.riskScore,
      resolved: riskFlagsTable.resolved,
      resolvedAt: riskFlagsTable.resolvedAt,
      createdAt: riskFlagsTable.createdAt,
    })
    .from(riskFlagsTable)
    .innerJoin(studentsTable, eq(riskFlagsTable.studentId, studentsTable.id))
    .orderBy(desc(riskFlagsTable.createdAt));

  let filtered = rows;
  if (resolved !== undefined) {
    const resolvedBool = resolved === "true";
    filtered = filtered.filter(r => r.resolved === resolvedBool);
  }
  if (severity) {
    filtered = filtered.filter(r => r.severity === severity);
  }

  res.json(ListRiskFlagsResponse.parse(filtered.map(r => ({
    ...r,
    resolvedAt: r.resolvedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }))));
});

router.patch("/risk-flags/:id/resolve", async (req, res): Promise<void> => {
  const params = ResolveRiskFlagParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [flag] = await db
    .update(riskFlagsTable)
    .set({ resolved: true, resolvedAt: new Date() })
    .where(eq(riskFlagsTable.id, params.data.id))
    .returning();

  if (!flag) {
    res.status(404).json({ error: "Risk flag not found" });
    return;
  }

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, flag.studentId));

  res.json(ResolveRiskFlagResponse.parse({
    ...flag,
    studentName: student?.name ?? "Unknown",
    studentCollege: student?.college ?? null,
    resolvedAt: flag.resolvedAt?.toISOString() ?? null,
    createdAt: flag.createdAt.toISOString(),
  }));
});

export default router;
