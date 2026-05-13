import { Router, type IRouter } from "express";
import { eq, desc, ilike, or } from "drizzle-orm";
import { db, studentsTable, conversationsTable, riskFlagsTable, nudgeHistoryTable } from "@workspace/db";
import {
  ListStudentsQueryParams,
  GetStudentParams,
  UpdateStudentParams,
  UpdateStudentBody,
  GetStudentConversationsParams,
  GetStudentNudgesParams,
  SendCheckInParams,
  SendCheckInBody,
  ListStudentsResponse,
  GetStudentResponse,
  UpdateStudentResponse,
  GetStudentConversationsResponse,
  GetStudentNudgesResponse,
  SendCheckInResponse,
} from "@workspace/api-zod";
import { sendMessage } from "../lib/twilio";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/students", async (req, res): Promise<void> => {
  const parsed = ListStudentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { riskLevel, college, search, flagged } = parsed.data;

  let query = db.select().from(studentsTable).$dynamic();

  if (riskLevel) {
    query = query.where(eq(studentsTable.riskLevel, riskLevel));
  }
  if (college) {
    query = query.where(ilike(studentsTable.college, `%${college}%`));
  }
  if (search) {
    query = query.where(
      or(
        ilike(studentsTable.name, `%${search}%`),
        ilike(studentsTable.phone, `%${search}%`),
        ilike(studentsTable.college, `%${search}%`)
      )
    );
  }
  if (flagged === "true") {
    query = query.where(eq(studentsTable.flagged, true));
  }

  const students = await query.orderBy(desc(studentsTable.riskScore));

  res.json(ListStudentsResponse.parse(students.map(s => ({
    ...s,
    lastMessageAt: s.lastMessageAt?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }))));
});

router.get("/students/:id", async (req, res): Promise<void> => {
  const params = GetStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, params.data.id));
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  res.json(GetStudentResponse.parse({
    ...student,
    lastMessageAt: student.lastMessageAt?.toISOString() ?? null,
    createdAt: student.createdAt.toISOString(),
    updatedAt: student.updatedAt.toISOString(),
  }));
});

router.patch("/students/:id", async (req, res): Promise<void> => {
  const params = UpdateStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(studentsTable)
    .set(parsed.data)
    .where(eq(studentsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  res.json(UpdateStudentResponse.parse({
    ...updated,
    lastMessageAt: updated.lastMessageAt?.toISOString() ?? null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  }));
});

router.get("/students/:id/conversations", async (req, res): Promise<void> => {
  const params = GetStudentConversationsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const messages = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.studentId, params.data.id))
    .orderBy(desc(conversationsTable.createdAt))
    .limit(20);

  res.json(GetStudentConversationsResponse.parse(messages.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }))));
});

router.get("/students/:id/nudges", async (req, res): Promise<void> => {
  const params = GetStudentNudgesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, params.data.id));
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const nudges = await db
    .select()
    .from(nudgeHistoryTable)
    .where(eq(nudgeHistoryTable.studentId, params.data.id))
    .orderBy(desc(nudgeHistoryTable.createdAt))
    .limit(20);

  res.json(GetStudentNudgesResponse.parse(nudges.map(n => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }))));
});

router.post("/students/:id/check-in", async (req, res): Promise<void> => {
  const params = SendCheckInParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const bodyParsed = SendCheckInBody.safeParse(req.body ?? {});
  const customMessage = bodyParsed.success ? bodyParsed.data?.message : undefined;

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, params.data.id));
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const messageText = customMessage ??
    `Hi ${student.name}, this is your college counselor. Just checking in — everything okay? I noticed you haven't been active lately. Please reply anytime, I'm here to help.`;

  let sid: string | null = null;
  try {
    const result = await sendMessage(student.phone, messageText);
    sid = result?.sid ?? null;

    await db.insert(conversationsTable).values({
      studentId: student.id,
      direction: "outbound",
      message: messageText,
      agentType: "counselor",
    });

    await db.insert(nudgeHistoryTable).values({
      studentId: student.id,
      message: messageText,
      triggerReason: "counselor_checkin",
      responded: false,
    });

    req.log.info({ studentId: student.id, sid }, "Counselor check-in sent");
  } catch (err) {
    req.log.error({ err, studentId: student.id }, "Failed to send check-in via Twilio");
    res.json(SendCheckInResponse.parse({
      success: false,
      message: "Message could not be sent via Twilio. Check your Twilio credentials.",
      sid: null,
    }));
    return;
  }

  res.json(SendCheckInResponse.parse({ success: true, message: "Check-in sent successfully.", sid }));
});

export default router;
