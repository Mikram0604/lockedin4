// Seed script — populates the Neon database with realistic demo data
const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const c = await pool.connect();
  try {
    console.log("🌱 Seeding database...\n");

    // 1. SCHOLARSHIPS
    await c.query(`DELETE FROM scholarships`);
    const scholarships = [
      ["NSP Post-Matric Scholarship", 48000, "Oct 31, 2026", "SC/ST/OBC students with family income < 2.5L", "SC,ST,OBC"],
      ["Karnataka Rajiv Gandhi Scholarship", 20000, "Sep 30, 2026", "SC/ST students in Karnataka colleges", "SC,ST"],
      ["AICTE Pragati Scholarship (Girls)", 50000, "Nov 15, 2026", "Girl students in AICTE-approved colleges", "General,SC,ST,OBC"],
      ["Vidyasiri Scholarship", 15000, "Aug 31, 2026", "Karnataka domicile, income < 2L", "SC,ST,OBC"],
      ["Central Sector Scholarship", 36000, "Dec 31, 2026", "Top 20 percentile in Class XII, income < 8L", "General,SC,ST,OBC"],
    ];
    for (const [name, amount, deadline, summary, category] of scholarships) {
      await c.query(`INSERT INTO scholarships (name, amount, deadline, eligibility_summary, category, is_active) VALUES ($1,$2,$3,$4,$5,true)`, [name, amount, deadline, summary, category]);
    }
    console.log("✅ " + scholarships.length + " scholarships inserted");

    // 2. STUDENTS
    await c.query(`DELETE FROM nudge_history`);
    await c.query(`DELETE FROM risk_flags`);
    await c.query(`DELETE FROM conversations`);
    await c.query(`DELETE FROM students`);

    const students = [
      { name:"Priya Muthukrishnan", phone:"+919876543210", college:"BMS College of Engineering", branch:"Computer Science", year:2, district:"Bidar", income:"< 1L", caste:"SC", fee:"pending", lang:"english", risk:11, level:"critical", silent:12, flagged:true },
      { name:"Rahul Kamath", phone:"+919876543211", college:"RV College of Engineering", branch:"Mechanical", year:1, district:"Bangalore Urban", income:"2.5L - 8L", caste:"OBC", fee:"paid", lang:"english", risk:2, level:"low", silent:1, flagged:false },
      { name:"Anjali Shivakumar", phone:"+919876543212", college:"PES University", branch:"Electronics", year:3, district:"Mysore", income:"1L - 2.5L", caste:"ST", fee:"partial", lang:"kannada", risk:6, level:"medium", silent:5, flagged:false },
      { name:"Deepak Naik", phone:"+919876543213", college:"MSRIT", branch:"Civil", year:2, district:"Raichur", income:"< 1L", caste:"SC", fee:"pending", lang:"hindi", risk:8, level:"high", silent:9, flagged:true },
      { name:"Fatima Begum", phone:"+919876543214", college:"Christ University", branch:"BBA", year:1, district:"Gulbarga", income:"1L - 2.5L", caste:"OBC", fee:"paid", lang:"english", risk:0, level:"low", silent:0, flagged:false },
      { name:"Venkatesh R.", phone:"+919876543215", college:"NIE Mysore", branch:"ISE", year:4, district:"Bellary", income:"< 1L", caste:"ST", fee:"pending", lang:"kannada", risk:13, level:"critical", silent:16, flagged:true },
    ];

    const ids = [];
    for (const s of students) {
      const r = await c.query(
        `INSERT INTO students (name,phone,college,branch,year,district,income_range,caste_category,fee_status,language_preference,onboarding_complete,onboarding_step,risk_score,risk_level,days_silent,last_message_at,flagged) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,8,$11,$12,$13,$14,$15) RETURNING id`,
        [s.name, s.phone, s.college, s.branch, s.year, s.district, s.income, s.caste, s.fee, s.lang, s.risk, s.level, s.silent, new Date(Date.now() - s.silent*86400000), s.flagged]
      );
      ids.push(r.rows[0].id);
    }
    console.log("✅ " + students.length + " students inserted");

    // 3. CONVERSATIONS
    const convos = [
      [0,"inbound","Hi","intake",20], [0,"outbound","Hi! I'm Disha 🙏 Which language do you prefer?","intake",20],
      [0,"inbound","English","intake",20], [0,"outbound","What's your full name?","intake",20],
      [0,"inbound","What scholarships can I get?","knowledge",12],
      [0,"outbound","You're eligible for NSP Post-Matric (₹48,000) and Vidyasiri (₹15,000). Want help applying?","knowledge",12],
      [1,"inbound","Hi","intake",5], [1,"outbound","Hi! I'm Disha 🙏 Which language do you prefer?","intake",5],
      [1,"inbound","fee help","knowledge",1], [1,"outbound","Here's how to request a fee extension from your college...","knowledge",1],
      [2,"inbound","scholarships","knowledge",5], [2,"outbound","You're eligible for Karnataka Rajiv Gandhi Scholarship (₹20,000).","knowledge",5],
      [3,"inbound","resources","knowledge",15], [3,"outbound","Here are first-year resources: NPTEL, NSS enrollment...","knowledge",15],
      [5,"inbound","I need help with fees","knowledge",20], [5,"outbound","I understand. You can request a fee extension...","knowledge",20],
    ];
    for (const [idx,dir,msg,agent,daysAgo] of convos) {
      await c.query(`INSERT INTO conversations (student_id,direction,message,agent_type,created_at) VALUES ($1,$2,$3,$4,$5)`, [ids[idx],dir,msg,agent,new Date(Date.now()-daysAgo*86400000)]);
    }
    console.log("✅ " + convos.length + " conversations inserted");

    // 4. RISK FLAGS
    const flags = [
      [0,"critical","12 days silent + fee pending + ignored nudge",11],
      [3,"high","9 days silent + fee pending",8],
      [5,"critical","16 days silent + fee pending + 3 ignored nudges",13],
    ];
    for (const [idx,sev,reason,score] of flags) {
      await c.query(`INSERT INTO risk_flags (student_id,severity,reason,risk_score,resolved) VALUES ($1,$2,$3,$4,false)`, [ids[idx],sev,reason,score]);
    }
    console.log("✅ " + flags.length + " risk flags inserted");

    // 5. NUDGE HISTORY
    const nudges = [
      [0,"Hi Priya, you haven't been active — is everything okay?","silence_detector",false,5],
      [0,"Hey Priya, need help with your scholarship application?","counselor_manual",false,2],
      [3,"Hi Deepak, we noticed you've been quiet. Let us know if you need support!","silence_detector",false,3],
      [5,"Venkatesh, your fee deadline is approaching. Want help with an extension?","silence_detector",false,10],
      [5,"Venkatesh, please reach out if you need help.","counselor_manual",false,5],
      [5,"Venkatesh, we really want to help. Reply anytime.","silence_detector",false,1],
      [1,"Hi Rahul, welcome to Disha! How's your first year going?","counselor_manual",true,3],
    ];
    for (const [idx,msg,reason,responded,daysAgo] of nudges) {
      await c.query(`INSERT INTO nudge_history (student_id,message,trigger_reason,responded,created_at) VALUES ($1,$2,$3,$4,$5)`, [ids[idx],msg,reason,responded,new Date(Date.now()-daysAgo*86400000)]);
    }
    console.log("✅ " + nudges.length + " nudges inserted");

    console.log("\n🎉 Database seeded!\n   6 students | 5 scholarships | 16 convos | 3 risk flags | 7 nudges\n");
  } finally {
    c.release();
    await pool.end();
  }
}
seed().catch(e => { console.error("Seed failed:", e); process.exit(1); });
