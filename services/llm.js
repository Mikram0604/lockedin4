const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'placeholder_key');

// Try multiple models as fallback
const MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];

/**
 * Generate a response using Google Gemini with fallback to templates
 * @param {string} systemPrompt 
 * @param {Array} messages - Array of message objects {role: 'user'|'assistant', content: string}
 * @returns {Promise<string>}
 */
async function generateResponse(systemPrompt, messages) {
  const userMessage = messages[messages.length - 1].content.toLowerCase();

  // Try Gemini API with multiple model fallbacks
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const fullPrompt = `${systemPrompt}\n\nUser message: ${messages[messages.length - 1].content}`;
      const result = await model.generateContent(fullPrompt);
      const response = result.response.text();
      console.log(`Gemini response successful using model: ${modelName}`);
      return response;
    } catch (error) {
      console.log(`Model ${modelName} failed: ${error.message?.substring(0, 80)}`);
      continue;
    }
  }

  // If ALL Gemini models fail, use smart template responses
  console.log('All Gemini models failed. Using template fallback.');
  return getTemplateResponse(userMessage);
}

function getTemplateResponse(message) {
  // Scholarship related
  if (message.includes('scholarship') || message.includes('nsp') || message.includes('money') || message.includes('financial')) {
    return "Based on your profile, here are the scholarships you may be eligible for:\n\n" +
      "1. *NSP Post-Matric Scholarship* — Up to ₹48,000 | Deadline: Oct 31\n" +
      "2. *Karnataka Rajiv Gandhi Scholarship* — ₹20,000 | Deadline: Sep 30\n" +
      "3. *AICTE Pragati Scholarship (Girls)* — ₹50,000 | Deadline: Nov 15\n" +
      "4. *Vidyasiri Scholarship* — ₹15,000 | Deadline: Aug 31\n\n" +
      "Would you like me to help you apply for any of these? Just reply with the name!";
  }

  // Fee related
  if (message.includes('fee') || message.includes('payment') || message.includes('pay') || message.includes('pending')) {
    return "I understand fee payments can be stressful. Here are some options:\n\n" +
      "1. You can request a *fee extension* from your college — this is your right, not a favour.\n" +
      "2. Apply for the *NSP Scholarship* (up to ₹48,000) which covers tuition.\n" +
      "3. Check if your college has an *installment plan*.\n\n" +
      "Want me to guide you through requesting a fee extension or applying for a scholarship?";
  }

  // Apply / help
  if (message.includes('apply') || message.includes('help') || message.includes('how') || message.includes('guide')) {
    return "I'd love to help! Here's what I can guide you through:\n\n" +
      "1. *Scholarship applications* — step by step on WhatsApp\n" +
      "2. *Fee extension requests* — how to approach the office\n" +
      "3. *College processes* — internal assessments, library, etc.\n\n" +
      "Just tell me what you need help with!";
  }

  // Deadline related
  if (message.includes('deadline') || message.includes('date') || message.includes('when')) {
    return "Here are the upcoming deadlines you should know about:\n\n" +
      "📅 *Vidyasiri Scholarship* — Aug 31, 2026\n" +
      "📅 *Karnataka Rajiv Gandhi* — Sep 30, 2026\n" +
      "📅 *NSP Post-Matric* — Oct 31, 2026\n" +
      "📅 *AICTE Pragati* — Nov 15, 2026\n\n" +
      "Don't miss these! Want me to help you apply for any?";
  }

  // Greeting
  if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
    return "Hey! I'm Disha, your college companion. I'm here to help you with scholarships, fee payments, and navigating college life.\n\n" +
      "Here's what I can do:\n" +
      "• Find scholarships you qualify for\n" +
      "• Guide you through applications step-by-step\n" +
      "• Help with fee extensions and college processes\n\n" +
      "What would you like to know?";
  }

  // Thank you
  if (message.includes('thank') || message.includes('thanks')) {
    return "You're welcome! I'm always here whenever you need help. Don't hesitate to reach out anytime. Your success matters! 💪";
  }

  // Later / bye
  if (message.includes('later') || message.includes('bye') || message.includes('ok')) {
    return "No problem! I'll be right here whenever you need me. Remember — you've got this, and I've got your back! 🙌";
  }

  // Default
  return "I'm here to help you with anything related to college — scholarships, fees, deadlines, or applications.\n\n" +
    "Try asking me:\n" +
    "• \"What scholarships can I get?\"\n" +
    "• \"Help me apply for NSP\"\n" +
    "• \"When are the deadlines?\"\n" +
    "• \"How do I request a fee extension?\"";
}

module.exports = {
  generateResponse
};
