import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, studentsTable, conversationsTable } from "@workspace/db";
import { processIncomingMessage } from "../lib/botCore";
import { matchScholarships, firstYearResources } from "../lib/intake";

const router: IRouter = Router();

// Endpoint for the web chat to send a message
router.post("/web-chat/message", async (req, res): Promise<void> => {
  const phone = req.body?.phone;
  const message = req.body?.message;

  if (!phone || !message) {
    res.status(400).json({ error: "Phone and message are required" });
    return;
  }

  try {
    const reply = await processIncomingMessage(phone, message);
    res.json({ reply });
  } catch (err) {
    req.log.error({ err }, "Error processing web chat message");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint for the web chat to fetch history
router.get("/web-chat/history", async (req, res): Promise<void> => {
  const phone = req.query.phone as string;
  
  if (!phone) {
    res.status(400).json({ error: "Phone is required" });
    return;
  }

  let normalizedPhone = phone.replace(/^whatsapp:/i, "").replace(/^\+/, "").trim();
  if (normalizedPhone.length === 10) {
    normalizedPhone = "91" + normalizedPhone;
  }
  const phoneE164 = `+${normalizedPhone}`;

  try {
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.phone, phoneE164));
    
    if (!student) {
      res.json({ history: [] }); // No student = no history
      return;
    }

    const messages = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.studentId, student.id))
      .orderBy(desc(conversationsTable.createdAt))
      .limit(50); // Get last 50 messages

    res.json({ history: messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })) });
  } catch (err) {
    req.log.error({ err }, "Error fetching web chat history");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint for the web chat to fetch profile details (scholarships, resources)
router.get("/web-chat/profile", async (req, res): Promise<void> => {
  const phone = req.query.phone as string;
  
  if (!phone) {
    res.status(400).json({ error: "Phone is required" });
    return;
  }

  let normalizedPhone = phone.replace(/^whatsapp:/i, "").replace(/^\+/, "").trim();
  if (normalizedPhone.length === 10) {
    normalizedPhone = "91" + normalizedPhone;
  }
  const phoneE164 = `+${normalizedPhone}`;

  try {
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.phone, phoneE164));
    
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const scholarshipsText = matchScholarships(student as any);
    const resourcesText = firstYearResources();

    res.json({
      student: {
        name: student.name,
        college: student.college,
        branch: student.branch,
        year: student.year,
        feeStatus: student.feeStatus,
      },
      scholarshipsText,
      resourcesText
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching student profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
