require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { MessagingResponse } = require('twilio').twiml;
const { generateResponse } = require('./services/llm');
const { ONBOARDING_STEPS, NSP_FLOW } = require('./data/flows');
const scholarshipsData = require('./data/scholarships.json');

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Persistence Layer (Simple JSON file)
const DB_PATH = path.join(__dirname, 'data', 'students_db.json');
let students = {};
if (fs.existsSync(DB_PATH)) {
  try {
    students = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) {
    console.error('Error loading DB:', e);
  }
}

const saveDB = () => {
  fs.writeFileSync(DB_PATH, JSON.stringify(students, null, 2));
};

// --- CORE CHAT LOGIC ---
async function processMessage(phone, message) {
  const msg = message.trim();
  const lowerMsg = msg.toLowerCase();

  // Initialize student if new
  if (!students[phone]) {
    students[phone] = { 
      onboarding_step: 0, 
      onboarding_complete: false, 
      walk_active: false, 
      walk_step: 0, 
      walk_flow: null,
      created_at: new Date().toISOString()
    };
  }

  const student = students[phone];

  // 1. ONBOARDING FLOW
  if (!student.onboarding_complete) {
    const currentStep = student.onboarding_step;

    // Trigger start
    if (currentStep === 0 && (lowerMsg === 'hi' || lowerMsg === 'hello' || lowerMsg === 'start' || lowerMsg === 'join')) {
      saveDB();
      return ONBOARDING_STEPS[0].question;
    }

    const stepDef = ONBOARDING_STEPS[currentStep];
    
    // Save current answer
    if (stepDef.field === 'family_income_bracket') {
      const mapping = { '1': '< 1L', '2': '1L - 2.5L', '3': '2.5L - 8L', '4': '> 8L' };
      student[stepDef.field] = mapping[msg] || msg;
    } else {
      student[stepDef.field] = msg;
    }

    const nextStep = currentStep + 1;
    if (nextStep < ONBOARDING_STEPS.length) {
      student.onboarding_step = nextStep;
      saveDB();
      return ONBOARDING_STEPS[nextStep].question;
    } else {
      student.onboarding_complete = true;
      saveDB();
      return `Thank you, ${student.full_name}! You're all set up. ✅\n\nI found scholarships you may be eligible for:\n\n🎓 *NSP Post-Matric Scholarship* — Up to ₹48,000\n📅 Deadline: October 31, 2026\n\nWant me to help you apply step by step?\n\n(Reply 'Yes' or 'Later')`;
    }
  }

  // 2. WALKER FLOW (Application Walkthrough)
  if (student.walk_active) {
    if (lowerMsg.includes('later') || lowerMsg.includes('pause') || lowerMsg.includes('stop')) {
      student.walk_active = false;
      saveDB();
      return "Got it. I've saved your progress. We can continue whenever you're ready. Just message me 'Continue'. 👍";
    }

    // Bank account pivot
    if (student.walk_step === 2 && lowerMsg === 'no') {
      student.walk_flow = 'jan_dhan';
      saveDB();
      return "No problem! You'll need a bank account to receive the scholarship.\n\nThe easiest way is to open a *Jan Dhan account* at your nearest SBI branch. You just need Aadhaar and 2 photos. Reply 'Done' when you have it!";
    }

    if (student.walk_flow === 'jan_dhan') {
      if (lowerMsg.includes('done') || lowerMsg.includes('yes')) {
        student.walk_flow = 'nsp';
        student.walk_step = 3;
        saveDB();
        return `Awesome! Let's resume NSP.\n\n${NSP_FLOW[2].prompt}`;
      }
      return "Reply 'Done' when you've opened the bank account!";
    }

    const nextStep = student.walk_step + 1;
    if (nextStep > NSP_FLOW.length) {
      student.walk_active = false;
      saveDB();
      return "Congratulations! 🎊 You've completed the NSP application! Keep your Application ID safe. I'll remind you if anything else is needed. 💪";
    } else {
      student.walk_step = nextStep;
      saveDB();
      return NSP_FLOW[nextStep - 1].prompt;
    }
  }

  // 3. START WALKER
  if (lowerMsg.includes('yes') || lowerMsg.includes('apply') || lowerMsg.includes('continue')) {
    student.walk_active = true;
    student.walk_step = 1;
    student.walk_flow = 'nsp';
    saveDB();
    return NSP_FLOW[0].prompt;
  }

  // 4. KNOWLEDGE AGENT (Gemini AI)
  try {
    const systemPrompt = `You are Disha, an AI companion for first-generation college students in India. 
Be warm and use simple language. Student: ${student.full_name || 'Friend'}, College: ${student.college_name || 'Unknown'}.
Available scholarships: ${JSON.stringify(scholarshipsData)}`;
    
    return await generateResponse(systemPrompt, [{ role: 'user', content: msg }]);
  } catch (error) {
    console.error('AI Error:', error);
    return "I'm here to help with scholarships and college guidance! Try asking about NSP deadlines.";
  }
}

// --- ENDPOINTS ---

// 1. Twilio Webhook
app.post('/webhook', async (req, res) => {
  const { Body, From } = req.body;
  if (!Body || !From) return res.send('<Response></Response>');

  const phone = From.replace('whatsapp:', '');
  const message = Body.trim();
  
  console.log(`[Twilio] Inbound: ${phone} -> ${message}`);

  try {
    const reply = await processMessage(phone, message);
    const twiml = new MessagingResponse();
    twiml.message(reply);
    
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (err) {
    console.error('Webhook Error:', err);
    res.send('<Response><Message>Technical glitch, please try in a minute!</Message></Response>');
  }
});

// 2. Dashboard API
app.get('/api/students', (req, res) => {
  const formatted = Object.entries(students).map(([phone, s], i) => ({
    id: 100 + i,
    full_name: s.full_name || 'New Student',
    college_name: s.college_name || 'N/A',
    branch: s.branch || 'N/A',
    fee_payment_status: s.fee_payment_status || 'Unknown',
    status: s.onboarding_complete ? 'LOW' : 'MEDIUM',
    risk_score: s.onboarding_complete ? 0 : 5,
    silent_days: 0
  }));
  
  // Add demo data
  const demoData = [
    { id: 1, full_name: 'Priya M.', college_name: 'BMS College', branch: 'CSE 2nd Year', fee_payment_status: 'Pending', risk_score: 11, status: 'CRITICAL', silent_days: 9 }
  ];
  
  res.json([...demoData, ...formatted]);
});

// 3. Manual Chat API (for dashboard chat tab)
app.post('/api/chat', async (req, res) => {
  const { message, phone } = req.body;
  const reply = await processMessage(phone, message);
  res.json({ reply });
});

// 4. Send check-in (Real Twilio)
app.post('/api/checkin', async (req, res) => {
  const { studentName } = req.body;
  
  // Find student by name in our persistence
  const studentEntry = Object.entries(students).find(([_, s]) => s.full_name === studentName);
  
  const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID || 'ACxxx', 
    process.env.TWILIO_AUTH_TOKEN || 'xxx'
  );

  try {
    // If we found the student's real phone number, use it. Otherwise use a demo number.
    const targetPhone = studentEntry ? studentEntry[0] : '+919999999999'; 
    
    await client.messages.create({
      from: 'whatsapp:+14155238886', // Twilio Sandbox Number
      to: `whatsapp:${targetPhone}`,
      body: `Hi ${studentName}, this is a counselor from Disha. I noticed you haven't been active lately. Is everything okay with your college/scholarship process?`
    });
    res.json({ success: true, message: `Real WhatsApp nudge sent to ${studentName}!` });
  } catch (err) {
    console.error('Twilio Outbound Error:', err);
    res.status(500).json({ success: false, message: "Twilio error. Make sure SID/Token are in .env" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 DISHA BACKEND IS RUNNING ON PORT ${PORT}`);
  console.log(`Twilio Webhook URL: [Your Domain]/webhook`);
  console.log('--------------------------------------------');
});
