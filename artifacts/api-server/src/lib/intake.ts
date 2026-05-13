import { db, studentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Student } from "@workspace/db";
import { logger } from "./logger";

const LANG_MAP: Record<string, string> = {
  "1": "english", "2": "kannada", "3": "hindi", "4": "telugu", "5": "tamil",
};
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

function q(step: number): string {
  switch (step) {
    case 0:
      return `🙏 Welcome to *Disha* — your college guidance assistant!

I'll help you find scholarships, manage fees, and navigate college life.

First, which language do you prefer?
1. English
2. Kannada
3. Hindi
4. Telugu
5. Tamil

Reply with a number (1–5)`;
    case 1:
      return "Great! What is your *full name*?";
    case 2:
      return "What is the *name of your college*?";
    case 3:
      return "What is your *branch* and *year of study*?\n(e.g. CSE, Year 2  or  Mechanical, Year 1)";
    case 4:
      return "Which *city or town* are you from? (your hometown)";
    case 5:
      return `What is your approximate *family income per year*?
1. Below ₹1 lakh
2. ₹1–2.5 lakh
3. ₹2.5–6 lakh
4. Above ₹6 lakh

Reply with a number (1–4)`;
    case 6:
      return `What is your *caste category*?
1. SC
2. ST
3. OBC
4. General / Others

Reply with a number (1–4)`;
    case 7:
      return `What is your current *college fee payment status*?
1. Paid in full ✅
2. Partially paid ⚠️
3. Not yet paid ❌

Reply with a number (1–3)`;
    default:
      return "Thank you! Your profile is saved.";
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
  return q(0);
}

export async function handleIntake(student: Student, message: string): Promise<string> {
  const step = student.onboardingStep;
  const input = message.trim();
  let update: Partial<typeof student> = {};
  const nextStep = step + 1;

  switch (step) {
    case 0:
      update = { languagePreference: (LANG_MAP[input] ?? "english") as Student["languagePreference"] };
      break;
    case 1:
      if (!input) return q(1);
      update = { name: input };
      break;
    case 2:
      if (!input) return q(2);
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
        ? `\n\n⚠️ I see your fees are *not yet paid*. Reply *"fee help"* and I'll explain how to request a fee extension or deadline waiver from your college.`
        : feeStatus === "partial"
        ? `\n\n⚠️ Your fees are partially paid. Reply *"fee help"* for guidance on clearing the balance.`
        : "";

      let response = `✅ *Profile complete! Welcome to Disha, ${name}!*\n\n${scholarships}${feeWarning}`;
      if (isFirstYear) {
        response += `\n\n─────────────────\n${firstYearResources()}`;
      }
      return response;
    }
  }

  await db.update(studentsTable)
    .set({ ...update, onboardingStep: nextStep })
    .where(eq(studentsTable.id, student.id));

  return q(nextStep);
}

export { firstYearResources, matchScholarships };
