// Multilingual translations for Disha bot
type Lang = "english" | "kannada" | "hindi" | "telugu" | "tamil";

const T: Record<Lang, Record<string, string>> = {
  english: {
    q1: "Great! What is your *full name*?",
    q2: "What is the *name of your college*?",
    q3: "What is your *branch* and *year of study*?\n(e.g. CSE, Year 2  or  Mechanical, Year 1)",
    q4: "Which *city or town* are you from? (your hometown)",
    q5: "What is your approximate *family income per year*?\n1. Below ₹1 lakh\n2. ₹1–2.5 lakh\n3. ₹2.5–6 lakh\n4. Above ₹6 lakh\n\nReply with a number (1–4)",
    q6: "What is your *caste category*?\n1. SC\n2. ST\n3. OBC\n4. General / Others\n\nReply with a number (1–4)",
    q7: "What is your current *college fee payment status*?\n1. Paid in full ✅\n2. Partially paid ⚠️\n3. Not yet paid ❌\n\nReply with a number (1–3)",
    profileDone: "✅ *Profile complete! Welcome to Disha, {name}!*",
    feePending: "\n\n⚠️ I see your fees are *not yet paid*. Reply *\"fee help\"* and I'll explain how to request a fee extension.",
    feePartial: "\n\n⚠️ Your fees are partially paid. Reply *\"fee help\"* for guidance on clearing the balance.",
    helpMenu: "Hi {name}! 👋 I'm here to help. Try asking:\n\n📋 *\"scholarships\"* — see what you qualify for\n💰 *\"fee help\"* — guidance on fee extension\n📚 *\"resources\"* — tips and links for college life\n🌐 *\"change language\"* — switch your language\n\nWhat do you need help with?",
    langChanged: "✅ Language changed to *English*. How can I help you?",
    langPrompt: "Which language do you prefer?\n1. English\n2. ಕನ್ನಡ (Kannada)\n3. हिन्दी (Hindi)\n4. తెలుగు (Telugu)\n5. தமிழ் (Tamil)\n\nReply with a number (1–5)",
  },
  hindi: {
    q1: "बढ़िया! आपका *पूरा नाम* क्या है?",
    q2: "आपके *कॉलेज का नाम* क्या है?",
    q3: "आपकी *ब्रांच* और *साल* क्या है?\n(जैसे CSE, साल 2 या Mechanical, साल 1)",
    q4: "आप किस *शहर या कस्बे* से हैं? (आपका गृहनगर)",
    q5: "आपकी परिवार की अनुमानित *सालाना आय* कितनी है?\n1. ₹1 लाख से कम\n2. ₹1–2.5 लाख\n3. ₹2.5–6 लाख\n4. ₹6 लाख से ज़्यादा\n\nनंबर भेजें (1–4)",
    q6: "आपकी *जाति श्रेणी* क्या है?\n1. SC\n2. ST\n3. OBC\n4. सामान्य / अन्य\n\nनंबर भेजें (1–4)",
    q7: "आपकी *कॉलेज फीस* का स्टेटस क्या है?\n1. पूरी भुगतान हो गई ✅\n2. आंशिक भुगतान ⚠️\n3. अभी तक नहीं भरी ❌\n\nनंबर भेजें (1–3)",
    profileDone: "✅ *प्रोफ़ाइल पूरी! दिशा में आपका स्वागत है, {name}!*",
    feePending: "\n\n⚠️ आपकी फीस *अभी तक नहीं भरी* है। *\"fee help\"* भेजें और मैं फीस एक्सटेंशन के बारे में बताऊँगी।",
    feePartial: "\n\n⚠️ आपकी फीस आंशिक रूप से भरी है। *\"fee help\"* भेजें बाकी फीस के बारे में जानने के लिए।",
    helpMenu: "नमस्ते {name}! 👋 मैं आपकी मदद के लिए हूँ:\n\n📋 *\"scholarships\"* — छात्रवृत्ति देखें\n💰 *\"fee help\"* — फीस एक्सटेंशन गाइड\n📚 *\"resources\"* — कॉलेज टिप्स\n🌐 *\"change language\"* — भाषा बदलें\n\nकिसमें मदद चाहिए?",
    langChanged: "✅ भाषा *हिन्दी* में बदल दी गई। मैं कैसे मदद कर सकती हूँ?",
    langPrompt: "आप कौन सी भाषा पसंद करते हैं?\n1. English\n2. ಕನ್ನಡ (Kannada)\n3. हिन्दी (Hindi)\n4. తెలుగు (Telugu)\n5. தமிழ் (Tamil)\n\nनंबर भेजें (1–5)",
  },
  kannada: {
    q1: "ಒಳ್ಳೆಯದು! ನಿಮ್ಮ *ಪೂರ್ಣ ಹೆಸರು* ಏನು?",
    q2: "ನಿಮ್ಮ *ಕಾಲೇಜಿನ ಹೆಸರು* ಏನು?",
    q3: "ನಿಮ್ಮ *ಶಾಖೆ* ಮತ್ತು *ವರ್ಷ* ಯಾವುದು?\n(ಉದಾ: CSE, ವರ್ಷ 2)",
    q4: "ನೀವು ಯಾವ *ನಗರ/ಪಟ್ಟಣ*ದವರು?",
    q5: "ನಿಮ್ಮ ಕುಟುಂಬದ ವಾರ್ಷಿಕ *ಆದಾಯ* ಎಷ್ಟು?\n1. ₹1 ಲಕ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ\n2. ₹1–2.5 ಲಕ್ಷ\n3. ₹2.5–6 ಲಕ್ಷ\n4. ₹6 ಲಕ್ಷಕ್ಕಿಂತ ಹೆಚ್ಚು\n\nಸಂಖ್ಯೆ ಕಳುಹಿಸಿ (1–4)",
    q6: "ನಿಮ್ಮ *ಜಾತಿ ವರ್ಗ* ಯಾವುದು?\n1. SC\n2. ST\n3. OBC\n4. ಸಾಮಾನ್ಯ\n\nಸಂಖ್ಯೆ ಕಳುಹಿಸಿ (1–4)",
    q7: "ನಿಮ್ಮ *ಕಾಲೇಜು ಶುಲ್ಕ* ಸ್ಥಿತಿ ಏನು?\n1. ಪೂರ್ಣ ಪಾವತಿ ✅\n2. ಭಾಗಶಃ ⚠️\n3. ಇನ್ನೂ ಕಟ್ಟಿಲ್ಲ ❌\n\nಸಂಖ್ಯೆ ಕಳುಹಿಸಿ (1–3)",
    profileDone: "✅ *ಪ್ರೊಫೈಲ್ ಪೂರ್ಣ! ದಿಶಾಗೆ ಸ್ವಾಗತ, {name}!*",
    feePending: "\n\n⚠️ ನಿಮ್ಮ ಶುಲ್ಕ *ಇನ್ನೂ ಕಟ್ಟಿಲ್ಲ*. ಶುಲ್ಕ ವಿಸ್ತರಣೆಗಾಗಿ *\"fee help\"* ಕಳುಹಿಸಿ.",
    feePartial: "\n\n⚠️ ನಿಮ್ಮ ಶುಲ್ಕ ಭಾಗಶಃ ಪಾವತಿಯಾಗಿದೆ. *\"fee help\"* ಕಳುಹಿಸಿ.",
    helpMenu: "ನಮಸ್ಕಾರ {name}! 👋 ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇದ್ದೇನೆ:\n\n📋 *\"scholarships\"* — ವಿದ್ಯಾರ್ಥಿವೇತನ ನೋಡಿ\n💰 *\"fee help\"* — ಶುಲ್ಕ ಮಾರ್ಗದರ್ಶನ\n📚 *\"resources\"* — ಕಾಲೇಜು ಸಲಹೆಗಳು\n🌐 *\"change language\"* — ಭಾಷೆ ಬದಲಿಸಿ\n\nಏನು ಬೇಕು?",
    langChanged: "✅ ಭಾಷೆ *ಕನ್ನಡ*ಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ. ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    langPrompt: "ನೀವು ಯಾವ ಭಾಷೆ ಬಯಸುತ್ತೀರಿ?\n1. English\n2. ಕನ್ನಡ (Kannada)\n3. हिन्दी (Hindi)\n4. తెలుగు (Telugu)\n5. தமிழ் (Tamil)\n\nಸಂಖ್ಯೆ ಕಳುಹಿಸಿ (1–5)",
  },
  telugu: {
    q1: "బాగుంది! మీ *పూర్తి పేరు* ఏమిటి?",
    q2: "మీ *కాలేజీ పేరు* ఏమిటి?",
    q3: "మీ *బ్రాంచ్* మరియు *సంవత్సరం* ఏమిటి?\n(ఉదా: CSE, సంవత్సరం 2)",
    q4: "మీరు ఏ *నగరం/పట్టణం* నుండి?",
    q5: "మీ కుటుంబ వార్షిక *ఆదాయం* ఎంత?\n1. ₹1 లక్ష కంటే తక్కువ\n2. ₹1–2.5 లక్షలు\n3. ₹2.5–6 లక్షలు\n4. ₹6 లక్షలు పైన\n\nసంఖ్య పంపండి (1–4)",
    q6: "మీ *కుల వర్గం* ఏమిటి?\n1. SC\n2. ST\n3. OBC\n4. జనరల్\n\nసంఖ్య పంపండి (1–4)",
    q7: "మీ *కాలేజీ ఫీజు* స్థితి ఏమిటి?\n1. పూర్తిగా చెల్లించారు ✅\n2. పాక్షికంగా ⚠️\n3. ఇంకా చెల్లించలేదు ❌\n\nసంఖ్య పంపండి (1–3)",
    profileDone: "✅ *ప్రొఫైల్ పూర్తి! దిశాకు స్వాగతం, {name}!*",
    feePending: "\n\n⚠️ మీ ఫీజు *ఇంకా చెల్లించలేదు*. *\"fee help\"* పంపండి.",
    feePartial: "\n\n⚠️ మీ ఫీజు పాక్షికంగా చెల్లించారు. *\"fee help\"* పంపండి.",
    helpMenu: "హలో {name}! 👋 నేను మీకు సహాయం చేస్తాను:\n\n📋 *\"scholarships\"* — స్కాలర్‌షిప్‌లు చూడండి\n💰 *\"fee help\"* — ఫీజు మార్గదర్శకత్వం\n📚 *\"resources\"* — కాలేజీ చిట్కాలు\n🌐 *\"change language\"* — భాష మార్చండి\n\nఏమి కావాలి?",
    langChanged: "✅ భాష *తెలుగు*కు మార్చబడింది. నేను ఎలా సహాయం చేయగలను?",
    langPrompt: "మీకు ఏ భాష ఇష్టం?\n1. English\n2. ಕನ್ನಡ (Kannada)\n3. हिन्दी (Hindi)\n4. తెలుగు (Telugu)\n5. தமிழ் (Tamil)\n\nసంఖ్య పంపండి (1–5)",
  },
  tamil: {
    q1: "நல்லது! உங்கள் *முழு பெயர்* என்ன?",
    q2: "உங்கள் *கல்லூரியின் பெயர்* என்ன?",
    q3: "உங்கள் *பிரிவு* மற்றும் *ஆண்டு* என்ன?\n(எ.கா: CSE, ஆண்டு 2)",
    q4: "நீங்கள் எந்த *நகரம்/ஊரில்* இருந்து வருகிறீர்கள்?",
    q5: "உங்கள் குடும்ப வருடாந்திர *வருமானம்* எவ்வளவு?\n1. ₹1 லட்சத்திற்கு கீழ்\n2. ₹1–2.5 லட்சம்\n3. ₹2.5–6 லட்சம்\n4. ₹6 லட்சத்திற்கு மேல்\n\nஎண் அனுப்புங்கள் (1–4)",
    q6: "உங்கள் *சாதி பிரிவு* என்ன?\n1. SC\n2. ST\n3. OBC\n4. பொது\n\nஎண் அனுப்புங்கள் (1–4)",
    q7: "உங்கள் *கல்லூரி கட்டணம்* நிலை என்ன?\n1. முழுமையாக செலுத்தப்பட்டது ✅\n2. ஓரளவு ⚠️\n3. இன்னும் செலுத்தவில்லை ❌\n\nஎண் அனுப்புங்கள் (1–3)",
    profileDone: "✅ *சுயவிவரம் முடிந்தது! திசாவிற்கு வரவேற்கிறோம், {name}!*",
    feePending: "\n\n⚠️ உங்கள் கட்டணம் *இன்னும் செலுத்தவில்லை*. *\"fee help\"* அனுப்புங்கள்.",
    feePartial: "\n\n⚠️ உங்கள் கட்டணம் ஓரளவு செலுத்தப்பட்டது. *\"fee help\"* அனுப்புங்கள்.",
    helpMenu: "வணக்கம் {name}! 👋 நான் உங்களுக்கு உதவ இருக்கிறேன்:\n\n📋 *\"scholarships\"* — உதவித்தொகை பாருங்கள்\n💰 *\"fee help\"* — கட்டண வழிகாட்டுதல்\n📚 *\"resources\"* — கல்லூரி குறிப்புகள்\n🌐 *\"change language\"* — மொழி மாற்றுங்கள்\n\nஎன்ன வேண்டும்?",
    langChanged: "✅ மொழி *தமிழ்*க்கு மாற்றப்பட்டது. நான் எப்படி உதவ முடியும்?",
    langPrompt: "நீங்கள் எந்த மொழி விரும்புகிறீர்கள்?\n1. English\n2. ಕನ್ನಡ (Kannada)\n3. हिन्दी (Hindi)\n4. తెలుగు (Telugu)\n5. தமிழ் (Tamil)\n\nஎண் அனுப்புங்கள் (1–5)",
  },
};

export function t(lang: string, key: string, vars?: Record<string, string>): string {
  const l = (lang || "english") as Lang;
  const dict = T[l] ?? T.english;
  let text = dict[key] ?? T.english[key] ?? "";
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}

export const LANG_MAP: Record<string, string> = {
  "1": "english", "2": "kannada", "3": "hindi", "4": "telugu", "5": "tamil",
};
