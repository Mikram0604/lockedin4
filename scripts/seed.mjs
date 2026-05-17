// Seed script — populates the Neon database with realistic demo data
// Run: node scripts/seed.mjs

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log("🌱 Seeding database...\n");

    // ── 1. SCHOLARSHIPS ──────────────────────────────────
    await client.query(`DELETE FROM scholarships`);
    const scholarships = [
      ["NSP Post-Matric Scholarship", 48000, "Oct 31, 2026", "SC/ST/OBC students with family income < ₹2.5L", "SC,ST,OBC"],
      ["Karnataka Rajiv Gandhi Scholarship", 20000, "Sep 30, 2026", "SC/ST students in Karnataka colleges", "SC,ST"],
      ["AICTE Pragati Scholarship (Girls)", 50000, "Nov 15, 2026", "Girl students in AICTE-approved colleges", "General,SC,ST,OBC"],
      ["Vidyasiri Scholarship", 15000, "Aug 31, 2026", "Karnataka domicile, income < ₹2L", "SC,ST,OBC"],
      ["Central Sector Scholarship", 36000, "Dec 31, 2026", "Top 20 percentile in Class XII, income < ₹8L", "General,SC,ST,OBC"],
    ];
    for (const [name, amount, deadline, summary, category] of scholarships) {
      await client.query(
        `INSERT INTO scholarships (name, amount, deadline, eligibility_summary, category, is_active) VALUES ($1,$2,$3,$4,$5,true)`,
        [name, amount, deadline, summary, category]
      );
    }
    console.log(`✅ ${scholarships.length} scholarships inserted`);

    // ── 2. STUDENTS ──────────────────────────────────────
    await client.query(`DELETE FROM nudge_history`);
    await client.query(`DELETE FROM risk_flags`);
    await client.query(`DELETE FROM conversations`);
    await client.query(`DELETE FROM students`);

    const students = [
      {
        name: "Priya Muthukrishnan",
        phone: "+919876543210",
        college: "BMS College of Engineering",
        branch: "Computer Science",
        year: 2,
        district: "Bidar",
        income_range: "< 1L",
        caste_category: "SC",
        fee_status: "pending",
        language_preference: "english",
        onboarding_complete: true,
        onboarding_step: 8,
        risk_score: 11,
        risk_level: "critical",
        days_silent: 12,
        last_message_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        flagged: true,
      },
      {
        name: "Rahul Kamath",
        phone: "+919876543211",
        college: "RV College of Engineering",
        branch: "Mechanical",
        year: 1,
        district: "Bangalore Urban",
        income_range: "2.5L - 8L",
        caste_category: "OBC",
        fee_status: "paid",
        language_preference: "english",
        onboarding_complete: true,
        onboarding_step: 8,
        risk_score: 2,
        risk_level: "low",
        days_silent: 1,
        last_message_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        flagged: false,
      },
      {
        name: "Anjali Shivakumar",
        phone: "+919876543212",
        college: "PES University",
        branch: "Electronics",
        year: 3,
        district: "Mysore",
        income_range: "1L - 2.5L",
        caste_category: "ST",
        fee_status: "partial",
        language_preference: "kannada",
        onboarding_complete: true,
        onboarding_step: 8,
        risk_score: 6,
        risk_level: "medium",
        days_silent: 5,
        last_message_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        flagged: false,
      },
      {
        name: "Deepak Naik",
        phone: "+919876543213",
        college: "MSRIT",
        branch: "Civil",
        year: 2,
        district: "Raichur",
        income_range: "< 1L",
        caste_category: "SC",
        fee_status: "pending",
        language_preference: "hindi",
        onboarding_complete: true,
        onboarding_step: 8,
        risk_score: 8,
        risk_level: "high",
        days_silent: 9,
        last_message_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        flagged: true,
      },
      {
        name: "Fatima Begum",
        phone: "+919876543214",
        college: "Christ University",
        branch: "BBA",
        year: 1,
        district: "Gulbarga",
        income_range: "1L - 2.5L",
        caste_category: "OBC",
        fee_status: "paid",
        language_preference: "english",
        onboarding_complete: true,
        onboarding_step: 8,
        risk_score: 0,
        risk_level: "low",
        days_silent: 0,
        last_message_at: new Date(),
        flagged: false,
      },
      {
        name: "Venkatesh R.",
        phone: "+919876543215",
        college: "NIE Mysore",
        branch: "ISE",
        year: 4,
        district: "Bellary",
        income_range: "< 1L",
        caste_category: "ST",
        fee_status: "pending",
        language_preference: "kannada",
        onboarding_complete: true,
        onboarding_step: 8,
        risk_score: 13,
        risk_level: "critical",
        days_silent: 16,
        last_message_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        flagged: true,
      },
    ];

    const studentIds = [];
    for (const s of students) {
      const res = await client.query(
        `INSERT INTO students (name, phone, college, branch, year, district, income_range, caste_category, fee_status, language_preference, onboarding_complete, onboarding_step, risk_score, risk_level, days_silent, last_message_at, flagged)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING id`,
        [s.name, s.phone, s.college, s.branch, s.year, s.district, s.income_range, s.caste_category, s.fee_status, s.language_preference, s.onboarding_complete, s.onboarding_step, s.risk_score, s.risk_level, s.days_silent, s.last_message_at, s.flagged]
      );
      studentIds.push(res.rows[0].id);
    }
    console.log(`✅ ${students.length} students inserted`);

    // ── 3. CONVERSATIONS (realistic chat history) ────────
    const convos = [
      // Priya — onboarding + scholarship query, then silence
      { idx: 0, dir: "inbound", msg: "Hi", agent: "intake", daysAgo: 20 },
      { idx: 0, dir: "outbound", msg: "Hi! I'm Disha 🙏 Which language do you prefer?", agent: "intake", daysAgo: 20 },
      { idx: 0, dir: "inbound", msg: "English", agent: "intake", daysAgo: 20 },
      { idx: 0, dir: "outbound", msg: "Great! What's your full name?", agent: "intake", daysAgo: 20 },
      { idx: 0, dir: "inbound", msg: "Priya Muthukrishnan", agent: "intake", daysAgo: 20 },
      { idx: 0, dir: "inbound", msg: "What scholarships can I get?", agent: "knowledge", daysAgo: 12 },
      { idx: 0, dir: "outbound", msg: "Based on your SC category and income, you're eligible for NSP Post-Matric (₹48,000) and Vidyasiri (₹15,000). Want me to help you apply?", agent: "knowledge", daysAgo: 12 },
      // Rahul — active user
      { idx: 1, dir: "inbound", msg: "Hi", agent: "intake", daysAgo: 5 },
      { idx: 1, dir: "outbound", msg: "Hi! I'm Disha 🙏 Which language do you prefer?", agent: "intake", daysAgo: 5 },
      { idx: 1, dir: "inbound", msg: "fee help", agent: "knowledge", daysAgo: 1 },
      { idx: 1, dir: "outbound", msg: "Here's how to request a fee extension from your college...", agent: "knowledge", daysAgo: 1 },
      // Anjali
      { idx: 2, dir: "inbound", msg: "scholarships", agent: "knowledge", daysAgo: 5 },
      { idx: 2, dir: "outbound", msg: "You're eligible for Karnataka Rajiv Gandhi Scholarship (₹20,000). Deadline: Sep 30.", agent: "knowledge", daysAgo: 5 },
      // Deepak — went silent after a nudge
      { idx: 3, dir: "inbound", msg: "resources", agent: "knowledge", daysAgo: 15 },
      { idx: 3, dir: "outbound", msg: "Here are some first-year resources: NPTEL courses, NSS enrollment...", agent: "knowledge", daysAgo: 15 },
      // Venkatesh — critical silence
      { idx: 5, dir: "inbound", msg: "I need help with fees", agent: "knowledge", daysAgo: 20 },
      { idx: 5, dir: "outbound", msg: "I understand fee payments can be stressful. You can request a fee extension...", agent: "knowledge", daysAgo: 20 },
    ];

    for (const c of convos) {
      const ts = new Date(Date.now() - c.daysAgo * 24 * 60 * 60 * 1000);
      await client.query(
        `INSERT INTO conversations (student_id, direction, message, agent_type, created_at) VALUES ($1,$2,$3,$4,$5)`,
        [studentIds[c.idx], c.dir, c.msg, c.agent, ts]
      );
    }
    console.log(`✅ ${convos.length} conversation messages inserted`);

    // ── 4. RISK FLAGS ────────────────────────────────────
    const flags = [
      { idx: 0, severity: "critical", reason: "12 days silent + fee pending + ignored nudge", score: 11 },
      { idx: 3, severity: "high", reason: "9 days silent + fee pending", score: 8 },
      { idx: 5, severity: "critical", reason: "16 days silent + fee pending + 3 ignored nudges", score: 13 },
    ];
    for (const f of flags) {
      await client.query(
        `INSERT INTO risk_flags (student_id, severity, reason, risk_score, resolved) VALUES ($1,$2,$3,$4,false)`,
        [studentIds[f.idx], f.severity, f.reason, f.score]
      );
    }
    console.log(`✅ ${flags.length} risk flags inserted`);

    // ── 5. NUDGE HISTORY ─────────────────────────────────
    const nudges = [
      { idx: 0, msg: "Hi Priya, this is Disha. You haven't been active — is everything okay?", reason: "silence_detector", responded: false, daysAgo: 5 },
      { idx: 0, msg: "Hey Priya, just checking in. Need help with your scholarship application?", reason: "counselor_manual", responded: false, daysAgo: 2 },
      { idx: 3, msg: "Hi Deepak, we noticed you've been quiet. Let us know if you need any support!", reason: "silence_detector", responded: false, daysAgo: 3 },
      { idx: 5, msg: "Venkatesh, your fee deadline is approaching. Want me to help with an extension?", reason: "silence_detector", responded: false, daysAgo: 10 },
      { idx: 5, msg: "Hi Venkatesh, this is a counselor from Disha. Please reach out if you need help.", reason: "counselor_manual", responded: false, daysAgo: 5 },
      { idx: 5, msg: "Venkatesh, we really want to help. Reply anytime.", reason: "silence_detector", responded: false, daysAgo: 1 },
      { idx: 1, msg: "Hi Rahul, welcome to Disha! How's your first year going?", reason: "counselor_manual", responded: true, daysAgo: 3 },
    ];
    for (const n of nudges) {
      const ts = new Date(Date.now() - n.daysAgo * 24 * 60 * 60 * 1000);
      await client.query(
        `INSERT INTO nudge_history (student_id, message, trigger_reason, responded, created_at) VALUES ($1,$2,$3,$4,$5)`,
        [studentIds[n.idx], n.msg, n.reason, n.responded, ts]
      );
    }
    console.log(`✅ ${nudges.length} nudge history records inserted`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("   → 6 students (2 critical, 1 high, 1 medium, 2 low)");
    console.log("   → 5 scholarships");
    console.log("   → 17 conversation messages");
    console.log("   → 3 active risk flags");
    console.log("   → 7 nudge history entries\n");

  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
