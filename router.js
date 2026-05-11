const supabase = require('./services/db');
const { sendWhatsAppMessage } = require('./services/twilio');
const intakeAgent = require('./agents/intake');
const walkerAgent = require('./agents/walker');
const knowledgeAgent = require('./agents/knowledge');

async function router(req, res) {
  console.log('--- WEBHOOK HIT ---');
  console.log('Body:', JSON.stringify(req.body));

  const { Body, From } = req.body;
  if (!Body || !From) {
    console.log('Missing Body or From, ignoring.');
    res.status(200).send('<Response></Response>');
    return;
  }

  const phone = From.replace('whatsapp:', '');
  const message = Body.trim();
  console.log(`Message from ${phone}: "${message}"`);

  try {
    // 1. Check if student exists and their onboarding status
    let { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('phone_number', phone)
      .single();

    if (studentError && studentError.code !== 'PGRST116') {
      console.error('Error fetching student:', studentError);
      res.status(200).send('<Response></Response>');
      return;
    }

    // New student or not fully onboarded -> Route to Intake Agent
    if (!student || !student.onboarding_complete) {
      console.log('Routing to Intake Agent');
      await intakeAgent.handleMessage(phone, message, student);
      res.status(200).send('<Response></Response>');
      return;
    }

    // 2. Check for active Walker session
    const { data: walkState } = await supabase
      .from('walk_state')
      .select('*')
      .eq('student_id', student.id)
      .eq('is_active', true)
      .single();

    if (walkState) {
      console.log('Routing to Walker Agent');
      await walkerAgent.handleMessage(phone, message, student, walkState);
      res.status(200).send('<Response></Response>');
      return;
    }

    // 3. Simple Keyword Intent Matching for Walker Agent initiation
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('apply') || lowerMsg.includes('scholarship') || lowerMsg.includes('form') || lowerMsg.includes('help with')) {
      console.log('Routing to Walker Agent (new flow)');
      await walkerAgent.startFlow(phone, message, student);
      res.status(200).send('<Response></Response>');
      return;
    }

    // 4. Default fallback -> Route to Knowledge Agent for Q&A
    console.log('Routing to Knowledge Agent');
    await knowledgeAgent.handleMessage(phone, message, student);
    res.status(200).send('<Response></Response>');

  } catch (error) {
    console.error('Router error:', error);
    await sendWhatsAppMessage(phone, "I'm having a little trouble right now, but I'll be back soon to help you.");
    res.status(200).send('<Response></Response>');
  }
}

module.exports = { router };
