import { eq, and, desc } from "drizzle-orm";
import { db, studentsTable, conversationsTable, nudgeHistoryTable } from "@workspace/db";
import { handleIntake, getWelcomeMessage, matchScholarships, firstYearResources } from "./intake";
import { recalculateRiskScore } from "./risk";
import { t, LANG_MAP } from "./translations";

// Track if a student is in "language change" mode
const pendingLangChange = new Set<number>();

export async function processIncomingMessage(phone: string, body: string): Promise<string> {
  const normalizedPhone = phone.replace(/^whatsapp:/i, "").replace(/^\+/, "").trim();
  const phoneE164 = `+${normalizedPhone}`;

  let student = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.phone, phoneE164))
    .then(rows => rows[0] ?? null);

  let isNewStudent = false;

  if (!student) {
    const [newStudent] = await db.insert(studentsTable).values({
      name: "",
      phone: phoneE164,
      college: "",
      branch: "",
      year: 1,
      lastMessageAt: new Date(),
      daysSilent: 0,
    }).returning();
    student = newStudent;
    isNewStudent = true;
  } else {
    await db.update(studentsTable)
      .set({ lastMessageAt: new Date(), daysSilent: 0 })
      .where(eq(studentsTable.id, student.id));
  }

  await db.insert(conversationsTable).values({
    studentId: student.id,
    direction: "inbound",
    message: body,
    agentType: null,
  });

  // Mark the most recent unanswered nudge as responded
  if (!isNewStudent) {
    const [pendingNudge] = await db
      .select()
      .from(nudgeHistoryTable)
      .where(and(eq(nudgeHistoryTable.studentId, student.id), eq(nudgeHistoryTable.responded, false)))
      .orderBy(desc(nudgeHistoryTable.createdAt))
      .limit(1);

    if (pendingNudge) {
      await db
        .update(nudgeHistoryTable)
        .set({ responded: true })
        .where(eq(nudgeHistoryTable.id, pendingNudge.id));
    }
  }

  let responseText: string;

  if (!student.onboardingComplete) {
    // Brand-new student: show welcome + language question without consuming their message
    if (isNewStudent) {
      responseText = getWelcomeMessage();
    } else {
      responseText = await handleIntake(student, body);
    }
  } else {
    responseText = await handleGeneralMessage(student, body);
  }

  await db.insert(conversationsTable).values({
    studentId: student.id,
    direction: "outbound",
    message: responseText,
    agentType: student.onboardingComplete ? "knowledge" : "intake",
  });

  await recalculateRiskScore(student.id);

  return responseText;
}

async function handleGeneralMessage(student: { name: string; id: number; year: number; casteCategory: string | null; incomeRange: string | null; district: string | null; feeStatus: string; languagePreference: string | null }, body: string): Promise<string> {
  const lower = body.toLowerCase().trim();
  const lang = student.languagePreference || "english";

  // Handle language change confirmation (user sent a number 1-5 after "change language")
  if (pendingLangChange.has(student.id)) {
    pendingLangChange.delete(student.id);
    const newLang = LANG_MAP[lower];
    if (newLang) {
      await db.update(studentsTable)
        .set({ languagePreference: newLang })
        .where(eq(studentsTable.id, student.id));
      return t(newLang, "langChanged");
    }
    // Invalid number — show the prompt again
    return t(lang, "langPrompt");
  }

  // "change language" command
  if (lower === "change language" || lower === "language" || lower === "lang" || lower === "भाषा बदलें" || lower === "ಭಾಷೆ ಬದಲಿಸಿ" || lower === "భాష మార్చండి" || lower === "மொழி மாற்று") {
    pendingLangChange.add(student.id);
    return t(lang, "langPrompt");
  }

  if (lower.includes("scholarship") || lower.includes("apply") || lower.includes("help me")) {
    return matchScholarships(student as Parameters<typeof matchScholarships>[0]);
  }

  if (lower === "fee help" || lower.includes("fee extension") || lower.includes("fee help")) {
    return `Here's how to request a *fee extension* from your college:

1️⃣ Visit the college accounts / welfare office
2️⃣ Ask for a *"Fee Extension Application Form"*
3️⃣ Fill in: name, roll number, reason for delay
4️⃣ Attach proof (income certificate, bank statement)
5️⃣ Submit to the welfare officer and get a receipt

Most colleges allow 30–60 day extensions for genuine hardship. Would you like me to help you draft a fee extension letter? Reply *"yes"* and I'll generate one for you.`;
  }

  if (lower.includes("resource") || lower.includes("first year") || lower.includes("fresher") || lower.includes("guide")) {
    return firstYearResources();
  }

  if (lower === "yes" && student.feeStatus !== "paid") {
    return `Here is a sample *Fee Extension Request Letter*:

---
To,
The Principal / Accounts Officer,
[Your College Name]

Subject: Request for Fee Payment Extension

Respected Sir/Madam,

I, [${student.name}], a student of [Branch], [Year] year, humbly request an extension for the payment of my college fees for this semester due to financial difficulties in my family.

My family's annual income is approximately [income], and we are going through a temporary financial hardship. I assure you that I will clear the dues by [date 45 days from now].

I kindly request you to grant me an extension of 45 days.

Yours sincerely,
${student.name}
Roll No: [Your Roll Number]
Phone: [Your Phone]
---

Replace the bracketed fields, print it, and submit with your income certificate.`;
  }

  // Default help menu — now in the student's language with "change language" option
  return t(lang, "helpMenu", { name: student.name });
}
