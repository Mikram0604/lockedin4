require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { generateResponse } = require('./services/llm');

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory store for the demo (no Supabase dependency needed)
const students = {};
const scholarshipsData = require('./data/scholarships.json');

const ONBOARDING_STEPS = [
  { step: 0, field: 'language_preference', question: "Hi! I'm Disha 🙏 I'm here to help you navigate college and find scholarships you deserve. Which language do you prefer?\n\n(Reply with: English, Kannada, Hindi, Telugu, or Tamil)" },
  { step: 1, field: 'full_name', question: "Great! Let's get started. What's your full name?" },
  { step: 2, field: 'college_name', question: "Nice to meet you! Which college are you attending?" },
  { step: 3, field: 'branch', question: "And what is your branch and current year? (e.g., CSE 2nd Year)" },
  { step: 4, field: 'home_district', question: "Got it. Which district is your home town in?" },
  { step: 5, field: 'family_income_bracket', question: "To help find the right scholarships, what is your family's annual income bracket?\n\n1. Less than ₹1 Lakh\n2. ₹1 Lakh - ₹2.5 Lakhs\n3. ₹2.5 Lakhs - ₹8 Lakhs\n4. More than ₹8 Lakhs\n\n(Just reply with the number)" },
  { step: 6, field: 'caste_category', question: "What is your caste category?\n\n(Reply with: SC, ST, OBC, or General)" },
  { step: 7, field: 'fee_payment_status', question: "Almost done! What is your current college fee payment status?\n\n(Reply with: Paid, Partial, or Pending)" }
];

const NSP_FLOW = [
  { step: 1, prompt: "Okay, let's apply for the NSP Scholarship! First, do you have your Aadhaar card and a recent passport-size photo ready?\n\n(Reply 'Yes' or 'No')" },
  { step: 2, prompt: "Great. Next, do you have a bank account in your own name?\n\n(Reply 'Yes' or 'No')" },
  { step: 3, prompt: "Perfect. Now, please visit scholarships.gov.in and click on 'New Registration'. Have you reached the page?" },
  { step: 4, prompt: "Fill in the basic details (Name, DOB, Mobile). When asked for 'Scheme Type', choose 'Post-Matric'. Let me know when you've submitted the first page." },
  { step: 5, prompt: "Awesome! You should have received an Application ID via SMS. Keep that safe! You've completed the first stage. 🎉\n\nLog in with that ID to upload your documents. Let me know when you are done!" }
];

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Disha API' });
});

// Chat API endpoint (replaces Twilio webhook for demo)
app.post('/api/chat', async (req, res) => {
  const { message, phone } = req.body;
  if (!message || !phone) {
    return res.json({ reply: "Please send a message." });
  }

  const msg = message.trim();
  const lowerMsg = msg.toLowerCase();

  try {
    // Initialize student if new
    if (!students[phone]) {
      students[phone] = { onboarding_step: 0, onboarding_complete: false, walk_active: false, walk_step: 0, walk_flow: null };
    }

    const student = students[phone];

    // ONBOARDING FLOW
    if (!student.onboarding_complete) {
      const currentStep = student.onboarding_step;

      // First message - send first question
      if (currentStep === 0 && (lowerMsg === 'hi' || lowerMsg === 'hello' || lowerMsg === 'hey' || lowerMsg === 'start')) {
        return res.json({ reply: ONBOARDING_STEPS[0].question });
      }

      // Process current step answer
      const stepDef = ONBOARDING_STEPS[currentStep];
      
      // Save the answer
      if (stepDef.field === 'family_income_bracket') {
        const mapping = { '1': '< 1L', '2': '1L - 2.5L', '3': '2.5L - 8L', '4': '> 8L' };
        student[stepDef.field] = mapping[msg] || msg;
      } else {
        student[stepDef.field] = msg;
      }

      const nextStep = currentStep + 1;

      if (nextStep < ONBOARDING_STEPS.length) {
        student.onboarding_step = nextStep;
        return res.json({ reply: ONBOARDING_STEPS[nextStep].question });
      } else {
        // Onboarding complete!
        student.onboarding_complete = true;
        const matchMsg = `Thank you, ${student.full_name}! You're all set up. ✅\n\nI found scholarships you may be eligible for:\n\n🎓 *NSP Post-Matric Scholarship* — Up to ₹48,000\n📅 Deadline: October 31, 2026\n\nWant me to help you apply step by step?\n\n(Reply 'Yes' or 'Later')`;
        return res.json({ reply: matchMsg });
      }
    }

    // WALKER FLOW (scholarship application)
    if (student.walk_active) {
      // Pause
      if (lowerMsg.includes('later') || lowerMsg.includes('pause') || lowerMsg.includes('stop')) {
        student.walk_active = false;
        return res.json({ reply: "Got it. I've saved your progress. We can continue whenever you're ready. Just message me 'Continue'. 👍" });
      }

      // Bank account pivot at step 2
      if (student.walk_step === 2 && lowerMsg === 'no') {
        student.walk_flow = 'jan_dhan';
        return res.json({ reply: "No problem! You'll need a bank account to receive the scholarship.\n\nThe easiest way is to open a *Jan Dhan account* at your nearest SBI or Canara Bank branch. You just need:\n• Aadhaar card\n• 2 passport photos\n\nIt's a zero-balance account — completely free!\n\nReply 'Done' when you've opened the account." });
      }

      // Return from Jan Dhan pivot
      if (student.walk_flow === 'jan_dhan') {
        if (lowerMsg.includes('done') || lowerMsg.includes('yes') || lowerMsg.includes('opened')) {
          student.walk_flow = 'nsp';
          student.walk_step = 3;
          return res.json({ reply: `Awesome! Glad you got the account set up! 🎉\n\nLet's resume your NSP application.\n\n${NSP_FLOW[2].prompt}` });
        } else {
          return res.json({ reply: "Take your time! Just visit the nearest bank branch with your Aadhaar card and 2 photos. It takes about 30 minutes. Reply 'Done' when you're ready to continue." });
        }
      }

      // Normal flow progression
      const nextStep = student.walk_step + 1;
      if (nextStep > NSP_FLOW.length) {
        student.walk_active = false;
        return res.json({ reply: "Congratulations! 🎊 You've completed the NSP Scholarship application walkthrough!\n\nYour application will be reviewed within 2-3 weeks. Keep your Application ID safe.\n\nI'll remind you if any action is needed. You're going to do great! 💪" });
      } else {
        student.walk_step = nextStep;
        return res.json({ reply: NSP_FLOW[nextStep - 1].prompt });
      }
    }

    // START WALKER if keywords match
    if (lowerMsg.includes('yes') || lowerMsg.includes('apply') || lowerMsg.includes('help me') || lowerMsg.includes('continue')) {
      student.walk_active = true;
      student.walk_step = 1;
      student.walk_flow = 'nsp';
      return res.json({ reply: NSP_FLOW[0].prompt });
    }

    // KNOWLEDGE AGENT (AI or template fallback)
    const systemPrompt = `You are Disha, an AI companion for first-generation college students in India. 
Be warm, encouraging, and use simple language. Keep responses to 2-3 short paragraphs.
Student Profile: Name: ${student.full_name || 'Student'}, College: ${student.college_name || 'Unknown'}
Available scholarships: ${JSON.stringify(scholarshipsData)}`;

    const reply = await generateResponse(systemPrompt, [{ role: 'user', content: msg }]);
    return res.json({ reply });

  } catch (error) {
    console.error('Chat error:', error);
    return res.json({ reply: "I'm here to help you with scholarships, fees, and college guidance. Try asking me about scholarships or deadlines!" });
  }
});

// API for dashboard demo data
app.get('/api/students', (req, res) => {
  res.json([
    { id: 1, full_name: 'Priya M.', college_name: 'BMS College of Engineering', branch: 'CSE 2nd Year', home_district: 'Bidar', caste_category: 'SC', fee_payment_status: 'Pending', risk_score: 11, status: 'CRITICAL', silent_days: 9 },
    { id: 2, full_name: 'Rahul K.', college_name: 'RV College of Engineering', branch: 'Mech 1st Year', home_district: 'Bangalore', caste_category: 'OBC', fee_payment_status: 'Paid', risk_score: 2, status: 'LOW', silent_days: 1 },
    { id: 3, full_name: 'Anjali S.', college_name: 'PES University', branch: 'ECE 3rd Year', home_district: 'Mysore', caste_category: 'ST', fee_payment_status: 'Partial', risk_score: 5, status: 'MEDIUM', silent_days: 4 },
    ...Object.entries(students).filter(([_, s]) => s.onboarding_complete).map(([phone, s], i) => ({
      id: 10 + i, full_name: s.full_name, college_name: s.college_name, branch: s.branch, home_district: s.home_district, caste_category: s.caste_category, fee_payment_status: s.fee_payment_status, risk_score: 0, status: 'LOW', silent_days: 0
    }))
  ]);
});

// Trigger silence detector manually for demo
app.post('/api/trigger-alert', (req, res) => {
  res.json({ success: true, message: "Silence detector triggered. Priya flagged as CRITICAL." });
});

// Send check-in (simulated)
app.post('/api/checkin', (req, res) => {
  const { studentName } = req.body;
  res.json({ success: true, message: `Check-in message sent to ${studentName} via WhatsApp!` });
});

app.listen(PORT, () => {
  console.log(`Disha server is running on port ${PORT}`);
  console.log(`Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`Students API: http://localhost:${PORT}/api/students`);
});
