import { db, studentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Student } from "@workspace/db";
import { logger } from "./logger";
import { t, LANG_MAP } from "./translations";

const INCOME_MAP: Record<string, string> = {
  "1": "Below ₹1 lakh",
  "2": "₹1–2.5 lakh",
  "3": "₹2.5–6 lakh",
  "4": "Above ₹6 lakh",
};
const CASTE_MAP: Record<string, string> = {
  "1": "SC", "2": "ST", "3": "OBC", "4": "General",
};
const FEE_MAP: Record<string, string> = {
  "1": "paid", "2": "partial", "3": "pending",
};

function q(step: number, lang: string): string {
  switch (step) {
    case 0:
      return `🙏 Welcome to *Disha* — your college guidance assistant!\n\nI'll help you find scholarships, manage fees, and navigate college life.\n\nFirst, which language do you prefer?\n1. English\n2. ಕನ್ನಡ (Kannada)\n3. हिन्दी (Hindi)\n4. తెలుగు (Telugu)\n5. தமிழ் (Tamil)\n\nReply with a number (1–5)`;
    case 1: return t(lang, "q1");
    case 2: return t(lang, "q2");
    case 3: return t(lang, "q3");
    case 4: return t(lang, "q4");
    case 5: return t(lang, "q5");
    case 6: return t(lang, "q6");
    case 7: return t(lang, "q7");
    default: return "Thank you! Your profile is saved.";
  }
}

function matchScholarships(student: Student): string {
  const caste = student.casteCategory ?? "";
  const income = student.incomeRange ?? "";
  const matches: string[] = [];

  const isLowIncome = income.includes("Below ₹1") || income.includes("₹1–2.5");
  const isMidIncome = income.includes("₹2.5–6");
  const isSC = caste === "SC";
  const isST = caste === "ST";
  const isOBC = caste === "OBC";

  if ((isSC || isST || isOBC) && (isLowIncome || isMidIncome)) {
    matches.push("⭐ *NSP Post-Matric Scholarship* — up to ₹48,000/year\n   Eligibility: SC/ST/OBC, income below ₹2.5L\n   Deadline: 31 October\n   Apply: scholarships.gov.in");
  }
  if ((isOBC || isSC || isST) && (isLowIncome || isMidIncome)) {
    matches.push("⭐ *Karnataka Rajiv Gandhi Scholarship* — ₹20,000/year\n   Eligibility: OBC/SC/ST, Karnataka domicile\n   Deadline: 30 September\n   Apply: karepass.cgg.gov.in");
  }
  if ((isSC || isST) && student.district) {
    matches.push("⭐ *Vidyasiri Scholarship (Karnataka)* — ₹15,000/year\n   Eligibility: SC/ST students in Karnataka\n   Deadline: 31 August\n   Apply: karepass.cgg.gov.in");
  }
  if (isLowIncome || isMidIncome) {
    matches.push("⭐ *AICTE Pragati Scholarship* — ₹50,000/year\n   Eligibility: Girl students in technical colleges\n   Deadline: 30 September\n   Apply: aicte-india.org");
  }

  if (matches.length === 0) {
    return "Based on your profile, I recommend checking the *Prime Minister's Scholarship Scheme* and your college's internal scholarship board for General category students.";
  }

  return `🎓 *Scholarships you likely qualify for:*\n\n${matches.join("\n\n")}\n\nReply *"apply NSP"* or *"apply Rajiv Gandhi"* and I'll walk you through the documents and steps.`;
}

function firstYearResources(): string {
  return `📚 *Resources for First-Year Students*

Here's what every fresher should know:

1️⃣ *Academics*
   - Attend all classes — 75% attendance is mandatory
   - Get NPTEL access: nptel.ac.in (free courses)
   - Join your college library and get a card in Week 1

2️⃣ *College Life*
   - Register for NSS or NCC in the first month
   - Anti-ragging helpline: 1800-180-5522 (free, 24x7)
   - Know your college welfare officer's name

3️⃣ *Documents to Keep Ready*
   - Aadhar card, income & caste certificates
   - Bank passbook (preferably Jan Dhan account)
   - 10th & 12th marksheets

4️⃣ *Important Deadlines*
   - Scholarship applications open in July–August
   - Fee concession requests: submit before semester end

Reply *"scholarships"* anytime to see what you qualify for, or *"fee help"* if you need support with fees.`;
}

export function getWelcomeMessage(): string {
  return q(0, "english");
}

export async function handleIntake(student: Student, message: string): Promise<string> {
  const step = student.onboardingStep;
  const input = message.trim();
  const lang = student.languagePreference || "english";
  let update: Partial<typeof student> = {};
  const nextStep = step + 1;

  switch (step) {
    case 0:
      update = { languagePreference: (LANG_MAP[input] ?? "english") as Student["languagePreference"] };
      break;
    case 1:
      if (!input) return q(1, lang);
      update = { name: input };
      break;
    case 2:
      if (!input) return q(2, lang);
      update = { college: input };
      break;
    case 3: {
      const yearMatch = input.match(/year\s*(\d)/i) ?? input.match(/(\d)\s*(?:st|nd|rd|th)/i) ?? input.match(/(\d)/);
      const year = yearMatch ? parseInt(yearMatch[1] ?? "1", 10) : 1;
      const branch = input.replace(/,?\s*year\s*\d/i, "").replace(/,?\s*\d\s*(?:st|nd|rd|th)/i, "").trim() || input;
      update = { branch, year };
      break;
    }
    case 4:
      update = { district: input };
      break;
    case 5:
      update = { incomeRange: INCOME_MAP[input] ?? input };
      break;
    case 6:
      update = { casteCategory: CASTE_MAP[input] ?? input };
      break;
    case 7: {
      const feeStatus = (FEE_MAP[input] ?? "unknown") as Student["feeStatus"];
      const finalStudent = { ...student, ...update, feeStatus };
      await db.update(studentsTable)
        .set({ ...finalStudent, onboardingStep: nextStep, onboardingComplete: true })
        .where(eq(studentsTable.id, student.id));
      logger.info({ studentId: student.id }, "Onboarding complete");

      const scholarships = matchScholarships(finalStudent);
      const isFirstYear = finalStudent.year === 1;
      const name = finalStudent.name || student.name;
      const feeWarning = feeStatus === "pending"
        ? t(lang, "feePending")
        : feeStatus === "partial"
        ? t(lang, "feePartial")
        : "";

      let response = `${t(lang, "profileDone", { name })}\n\n${scholarships}${feeWarning}`;
      if (isFirstYear) {
        response += `\n\n─────────────────\n${firstYearResources()}`;
      }
      return response;
    }
  }

  // For step 0, we need to use the NEW language for the next question
  const nextLang = step === 0 ? (LANG_MAP[input] ?? "english") : lang;

  await db.update(studentsTable)
    .set({ ...update, onboardingStep: nextStep })
    .where(eq(studentsTable.id, student.id));

  return q(nextStep, nextLang);
}

export { firstYearResources, matchScholarships };
