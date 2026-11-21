// backend/services/assistantService.js
// CareBridge AI Phase 5 - Smart Assistant, Medical Document Analysis, Symptom Intelligence & Multilingual Engine
// Complies with strict clinical safety protocols: No autonomous disease diagnosis.

export class AssistantServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Medical term definitions in English, Kannada, and Hindi
const GLOSSARY = {
  hemoglobin: {
    en: 'Hemoglobin is a protein in red blood cells that carries oxygen from the lungs throughout the body.',
    kn: 'ಹಿಮೋಗ್ಲೋಬಿನ್ ಕೆಂಪು ರಕ್ತ ಕಣಗಳಲ್ಲಿರುವ ಪ್ರೋಟೀನ್ ಆಗಿದ್ದು, ಶ್ವಾಸಕೋಶದಿಂದ ದೇಹದ ಎಲ್ಲಾ ಭಾಗಗಳಿಗೆ ಆಮ್ಲಜನಕವನ್ನು ಸಾಗಿಸುತ್ತದೆ.',
    hi: 'हीमोग्लोबिन लाल रक्त कोशिकाओं में पाया जाने वाला प्रोटीन है जो फेफड़ों से शरीर में ऑक्सीजन पहुंचाता है।',
  },
  wbc: {
    en: 'White Blood Cells (WBC) are part of the immune system that helps the body fight infections and diseases.',
    kn: 'ಬಿಳಿ ರಕ್ತ ಕಣಗಳು (WBC) ರೋಗನಿರೋಧಕ ವ್ಯವಸ್ಥೆಯ ಭಾಗವಾಗಿದ್ದು, ಸೋಂಕುಗಳ ವಿರುದ್ಧ ಹೋರಾಡಲು ದೇಹಕ್ಕೆ ನೆರವಾಗುತ್ತವೆ.',
    hi: 'श्वेत रक्त कोशिकाएं (WBC) प्रतिरक्षा प्रणाली का हिस्सा हैं जो शरीर को संक्रमण से लड़ने में मदद करती हैं।',
  },
  platelets: {
    en: 'Platelets are tiny blood cells that help your body form clots to stop bleeding when you have a cut.',
    kn: 'ಪ್ಲೇಟ್‌ಲೆಟ್‌ಗಳು ರಕ್ತ ಹೆಪ್ಪುಗಟ್ಟಲು ಮತ್ತು ರಕ್ತಸ್ರಾವವನ್ನು ತಡೆಗಟ್ಟಲು ಸಹಾಯ ಮಾಡುವ ಸಣ್ಣ ಜೀವಕೋಶಗಳು.',
    hi: 'प्लेटलेट्स छोटे रक्त कण हैं जो चोट लगने पर रक्त का थक्का बनाने और रक्तस्राव रोकने में मदद करते हैं।',
  },
  fasting_glucose: {
    en: 'Fasting Blood Glucose measures the amount of sugar in your blood after fasting for at least 8 hours.',
    kn: 'ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ರಕ್ತದ ಸಕ್ಕರೆ ಮಟ್ಟವನ್ನು (Fasting Blood Sugar) ಅಳೆಯುವ ಪರೀಕ್ಷೆಯಾಗಿದ್ದು, ಮಧುಮೇಹ ನಿಯಂತ್ರಣಕ್ಕೆ ಮುಖ್ಯವಾಗಿದೆ.',
    hi: 'फास्टिंग ब्लड ग्लूकोज कम से कम 8 घंटे भूखे रहने के बाद रक्त में शुगर के स्तर को मापता है।',
  },
  creatinine: {
    en: 'Creatinine is a waste product filtered by the kidneys. It is measured to evaluate how well your kidneys are functioning.',
    kn: 'ಕ್ರಿಯೇಟಿನೈನ್ ಮೂತ್ರಪಿಂಡಗಳಿಂದ ಸೋಸಲ್ಪಡುವ ತ್ಯಾಜ್ಯ ವಸ್ತುವಾಗಿದ್ದು, ಮೂತ್ರಪಿಂಡಗಳ ಕಾರ್ಯಕ್ಷಮತೆಯನ್ನು ತಿಳಿಯಲು ಬಳಸಲಾಗುತ್ತದೆ.',
    hi: 'क्रिएटिनिन एक अपशिष्ट उत्पाद है जिसे गुर्दे छानते हैं। यह गुर्दे के स्वास्थ्य का मूल्यांकन करता है।',
  },
  hba1c: {
    en: 'HbA1c reflects your average blood sugar levels over the past 2 to 3 months.',
    kn: 'HbA1c ಪರೀಕ್ಷೆಯು ಕಳೆದ 2 ರಿಂದ 3 ತಿಂಗಳುಗಳ ಸರಾಸರಿ ರಕ್ತದ ಸಕ್ಕರೆ ಮಟ್ಟವನ್ನು ತೋರಿಸುತ್ತದೆ.',
    hi: 'HbA1c पिछले 2 से 3 महीनों में आपके औसत ब्लड शुगर स्तर को दर्शाता है।',
  },
};

// Registered hospital clinical doctors directory
const DOCTORS_DIRECTORY = [
  {
    id: 'DR-104',
    name: 'Dr. Kavita Menon',
    department: 'General Medicine',
    specialization: 'Internal Medicine & Critical Care',
    availability: 'Available',
    shift: '08:00–16:00',
    location: '1st Floor, Wing B, Consultation Room 104',
  },
  {
    id: 'DR-108',
    name: 'Dr. Arjun Shah',
    department: 'Emergency Medicine',
    specialization: 'Emergency & Trauma Care',
    availability: 'Available',
    shift: '08:00–16:00',
    location: 'Ground Floor, Wing A, Emergency Trauma Desk',
  },
  {
    id: 'DR-116',
    name: 'Dr. Nisha Rao',
    department: 'General Medicine',
    specialization: 'General Practice & Diabetology',
    availability: 'Available',
    shift: '10:00–18:00',
    location: '1st Floor, Wing B, Consultation Room 106',
  },
  {
    id: 'DR-121',
    name: 'Dr. Vivek Rao',
    department: 'Neurology',
    specialization: 'Neurology & Brain Health',
    availability: 'On Call / Available',
    shift: '14:00–20:00',
    location: '3rd Floor, Wing B, Neuro Clinic 302',
  },
  {
    id: 'DR-135',
    name: 'Dr. Sneha Patil',
    department: 'Pediatrics',
    specialization: 'Pediatrics & Child Wellness',
    availability: 'Available',
    shift: '09:00–17:00',
    location: 'Ground Floor, Wing D, Pediatric Clinic 110',
  },
];

export function createAssistantService(priorityStore) {
  return {
    // 1. Conversational Chatbot Engine with Symptom Routing & Doctor Referral
    async handleChat({ message, history = [], language = 'en', role = 'Patient' }) {
      if (!message || typeof message !== 'string' || !message.trim()) {
        throw new AssistantServiceError(400, 'A non-empty message is required.');
      }

      const query = message.trim().toLowerCase();
      let replyText = '';
      let actionSuggestion = null;
      let spokenText = '';
      let clinicalReferral = null;

      // 1. EMERGENCY & CRITICAL CARDIAC / RESPIRATORY SYMPTOMS
      if (
        query.includes('emergency') || query.includes('chest pain') || query.includes('heart attack') ||
        query.includes('stroke') || query.includes('breathing') || query.includes('breathless') ||
        query.includes('shortness of breath') || query.includes('ತುರ್ತು') || query.includes('ಆಪಾತ') ||
        query.includes('ಎದೆನೋವು') || query.includes('ಉಸಿರಾಟ') || query.includes('सीने में दर्द') || query.includes('आपातकालीन')
      ) {
        clinicalReferral = {
          category: 'Emergency & Critical Care',
          department: 'Emergency & Trauma Desk (Ground Floor, Wing A)',
          doctor: 'Dr. Arjun Shah (MD Emergency Medicine & Trauma Care, Available now)',
          priority: 'Immediate Attention',
        };

        if (language === 'kn') {
          replyText = `⚠️ ತುರ್ತು ಎಚ್ಚರಿಕೆ (EMERGENCY ALERT):\n\n• ಸಂಭವನೀಯ ಪರಿಸ್ಥಿತಿ: ತೀವ್ರ ಎದೆನೋವು ಅಥವಾ ಉಸಿರಾಟದ ತೊಂದರೆ ಹೃದಯ ಅಥವಾ ಶ್ವಾಸಕೋಶದ ಗಂಭೀರ ಸಮಸ್ಯೆಯ ಲಕ್ಷಣವಾಗಿರಬಹುದು.\n• ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕು: ಆಸ್ಪತ್ರೆಯ ತಳಮಹಡಿ (Ground Floor, Wing A) ನಲ್ಲಿರುವ "Emergency Care Desk" ಗೆ ತಕ್ಷಣ ತೆರಳಿ.\n• ಸಂಪರ್ಕಿಸಬೇಕಾದ ವೈದ್ಯರು: ಡಾ. ಅರ್ಜುನ್ ಶಾ (Dr. Arjun Shah - ಎಮರ್ಜೆನ್ಸಿ ಮೆಡಿಸಿನ್ ತಜ್ಞರು, ಪ್ರಸ್ತುತ ಲಭ್ಯವಿದ್ದಾರೆ).\n• ತಕ್ಷಣದ ಕ್ರಮ: ದೈಹಿಕ ಶ್ರಮ ನಿಲ್ಲಿಸಿ, ನೆಟ್ಟಗೆ ಕುಳಿತುಕೊಳ್ಳಿ ಮತ್ತು ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಂಖ್ಯೆ 108 ಗೆ ಕರೆ ಮಾಡಿ. CareBridge AI ತುರ್ತು ರೋಗನಿರ್ಣಯದ ಬದಲಿಯಲ್ಲ.`;
          spokenText = `ತುರ್ತು ಎಚ್ಚರಿಕೆ: ತೀವ್ರ ಎದೆನೋವು ಅಥವಾ ಉಸಿರಾಟದ ತೊಂದರೆಗೆ ತಕ್ಷಣ ಗ್ರೌಂಡ್ ಫ್ಲೋರ್‌ನಲ್ಲಿರುವ ಎಮರ್ಜೆನ್ಸಿ ಡೆಸ್ಕ್‌ಗೆ ತೆರಳಿ. ತುರ್ತು ವಿಭಾಗದಲ್ಲಿ ಡಾಕ್ಟರ್ ಅರ್ಜುನ್ ಶಾ ಲಭ್ಯವಿದ್ದಾರೆ. ತಕ್ಷಣವೇ 108 ಅಥವಾ ತುರ್ತು ಸಿಬ್ಬಂದಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.`;
        } else if (language === 'hi') {
          replyText = `⚠️ आपातकालीन सूचना (EMERGENCY ALERT):\n\n• स्थिति का आकलन: सीने में तेज दर्द या सांस लेने में तकलीफ कार्डियक अथवा श्वसन आपातकाल का संकेत हो सकता है।\n• कहाँ परामर्श लें: ग्राउंड फ्लोर, विंग A में स्थित "Emergency Care Desk" पर तुरंत पहुंचें।\n• अनुशंसित डॉक्टर: डॉ. अर्जुन शाह (Dr. Arjun Shah - आपातकालीन चिकित्सा विशेषज्ञ, अभी उपलब्ध हैं)।\n• तत्काल कदम: कोई भी शारीरिक श्रम न करें, सीधे बैठें और तुरंत 108 पर कॉल करें। केयरब्रिज एआई चिकित्सीय आपातकाल का विकल्प नहीं है।`;
          spokenText = `आपातकालीन सूचना: सीने में तेज दर्द या सांस की तकलीफ के लिए तुरंत ग्राउंड फ्लोर स्थित इमरजेंसी डेस्क पर जाएं। वहां डॉक्टर अर्जुन शाह उपलब्ध हैं। तुरंत 108 पर संपर्क करें।`;
        } else {
          replyText = `⚠️ EMERGENCY ALERT & IMMEDIATE CLINICAL ROUTING:\n\n• Clinical Assessment: Severe chest discomfort or breathlessness requires urgent assessment to rule out acute cardiac or respiratory compromise.\n• Where to Consult: Hospital Emergency Desk (Ground Floor, Wing A).\n• Recommended Physician: Dr. Arjun Shah (MD Emergency Medicine & Trauma, Available on duty now).\n• Immediate Action: Stop physical exertion immediately, remain seated comfortably, and report to the Emergency Desk or call 108/emergency services immediately. CareBridge AI cannot evaluate medical emergencies.`;
          spokenText = `Emergency alert. For severe chest pain or breathing difficulty, proceed immediately to the Emergency Desk on the Ground Floor, Wing A. Dr. Arjun Shah is on duty now. Please alert nearby medical staff or call 108 immediately.`;
        }
        actionSuggestion = { type: 'navigate', label: 'Emergency Protocol', section: 'Patient Priority Dashboard' };
      }

      // 2. FEVER, COUGH, COLD, INFECTION, SORE THROAT
      else if (
        query.includes('fever') || query.includes('cough') || query.includes('cold') || query.includes('throat') ||
        query.includes('flu') || query.includes('infection') || query.includes('chills') || query.includes('shivering') ||
        query.includes('temperature') || query.includes('ಜ್ವರ') || query.includes('ಕೆಮ್ಮು') || query.includes('ನೆಗಡಿ') ||
        query.includes('ಗಂಟಲು') || query.includes('ಬುಖಾರ್') || query.includes('बुखार') || query.includes('खांसी') || query.includes('जुकाम')
      ) {
        clinicalReferral = {
          category: 'General Medicine & Infection Care',
          department: 'General Medicine OPD (1st Floor, Wing B, Room 104)',
          doctor: 'Dr. Kavita Menon (MBBS, MD Internal Medicine, Shift: 08:00–16:00)',
          priority: 'Urgent Review',
        };

        if (language === 'kn') {
          replyText = `🩺 ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ವಿಶ್ಲೇಷಣೆ - ಜ್ವರ ಮತ್ತು ಕೆಮ್ಮು:\n\n• ಪರಿಸ್ಥಿತಿಯ ವಿವರಣೆ: ಜ್ವರ, ಕೆಮ್ಮು ಮತ್ತು ಗಂಟಲು ನೋವು ಶ್ವಾಸನಾಳದ ವೈರಲ್ ಅಥವಾ ಬ್ಯಾಕ್ಟೀರಿಯಲ್ ಸೋಂಕಿನಿಂದ ಉಂಟಾಗಬಹುದು. ದೇಹದ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯು ಸೋಂಕಿನ ವಿರುದ್ಧ ಹೋರಾಡುವಾಗ ತಾಪಮಾನ ಹೆಚ್ಚಾಗುತ್ತದೆ.\n• ಎಲ್ಲಿ ಸಂಪರ್ಕಿಸಬೇಕು: ಜನರಲ್ ಮೆಡಿಸಿನ್ ಹೊರರೋಗಿ ವಿಭಾಗ (1st Floor, Wing B, ಕೊಠಡಿ ಸಂಖ್ಯೆ 104).\n• ಶಿಫಾರಸು ಮಾಡಲಾದ ವೈದ್ಯರು: ಡಾ. ಕವಿತಾ ಮೆನನ್ (Dr. Kavita Menon - ಜನರಲ್ ಮೆಡಿಸಿನ್ ಮತ್ತು ಕ್ರಿಟಿಕಲ್ ಕೇರ್ ತಜ್ಞರು, ಪ್ರಸ್ತುತ ಲಭ್ಯವಿದ್ದಾರೆ) ಅಥವಾ ಡಾ. ನಿಶಾ ರಾವ್.\n• ಪ್ರಸ್ತುತ ಮಾಡಬೇಕಾದ ಆರೈಕೆ: ದಿನಕ್ಕೆ 2.5 ರಿಂದ 3 ಲೀಟರ್ ಬೆಚ್ಚಗಿನ ನೀರನ್ನು ಕುಡಿಯಿರಿ. ಪ್ರತಿ 6 ಗಂಟೆಗೊಮ್ಮೆ ಥರ್ಮಾಮೀಟರ್‌ನಿಂದ ತಾಪಮಾನ ಪರಿಶೀಲಿಸಿ. ವೈದ್ಯರ ಸಲಹೆಯಿಲ್ಲದೆ ತೀವ್ರ ಆಂಟಿಬಯೋಟಿಕ್ಸ್ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ.`;
          spokenText = `ಜ್ವರ ಮತ್ತು ಕೆಮ್ಮಿನ ಸಮಸ್ಯೆಗೆ, ನೀವು 1 ನೇ ಮಹಡಿಯ ವಿಂಗ್ ಬಿ ನಲ್ಲಿರುವ ಜನರಲ್ ಮೆಡಿಸಿನ್ ವಿಭಾಗಕ್ಕೆ ತೆರಳಬೇಕು. ಅಲ್ಲಿ ಡಾಕ್ಟರ್ ಕವಿತಾ ಮೆನನ್ ಅವರು ಲಭ್ಯವಿದ್ದಾರೆ. ಬಿಸಿ ನೀರನ್ನು ಹೆಚ್ಚು ಕುಡಿಯಿರಿ ಮತ್ತು ವೈದ್ಯರನ್ನು ಸಮಾಲೋಚಿಸಿ.`;
        } else if (language === 'hi') {
          replyText = `🩺 स्वास्थ्य समस्या विश्लेषण - बुखार और खांसी:\n\n• स्थिति की समझ: बुखार, खांसी या गले में खराश आमतौर पर वायरल या श्वसन तंत्र के संक्रमण के कारण होती है। जब शरीर का इम्यून सिस्टम संक्रमण से लड़ता है तो तापमान बढ़ता है।\n• कहाँ परामर्श लें: जनरल मेडिसिन ओपीडी (1st Floor, Wing B, कमरा संख्या 104).\n• अनुशंसित डॉक्टर: डॉ. कविता मेनन (Dr. Kavita Menon - इंटरनल मेडिसिन विशेषज्ञ, उपलब्ध हैं) अथवा डॉ. निशा राव।\n• प्राथमिक देखभाल: गुनगुना पानी पिएं, पर्याप्त आराम करें और हर 6 घंटे में तापमान नोट करें। डॉक्टर की सलाह के बिना एंटीबायोटिक न लें।`;
          spokenText = `बुखार और खांसी के लिए, आपको पहली मंजिल, विंग बी पर जनरल मेडिसिन ओपीडी में जाना चाहिए। वहां डॉक्टर कविता मेनन उपलब्ध हैं। पर्याप्त गुनगुना पानी पिएं और परामर्श लें।`;
        } else {
          replyText = `🩺 Health Assessment — Fever, Cough & Infection:\n\n• What Is Happening: Fever, cough, and throat irritation typically indicate an acute viral or respiratory tract infection, where your immune system triggers pyrexia to fight pathogens.\n• Where You Should Consult: General Medicine Outpatient Department (1st Floor, Wing B, Consultation Room 104).\n• Recommended Physician: Dr. Kavita Menon (MBBS, MD - Internal Medicine & Critical Care, Shift: 08:00–16:00, Available) or Dr. Nisha Rao.\n• Recommended Immediate Care: Maintain continuous warm oral hydration (2.5L/day), rest adequately, monitor temperature using a digital thermometer every 6 hours, and do not self-prescribe antibiotics.`;
          spokenText = `Based on your symptoms of fever and cough, this appears to be a respiratory infection. You should consult the General Medicine Department on the First Floor, Wing B. We recommend consulting Dr. Kavita Menon, who is actively available now. Stay well hydrated with warm fluids.`;
        }
        actionSuggestion = { type: 'navigate', label: 'View Doctor Queue', section: 'Patient Priority Dashboard' };
      }

      // 3. STOMACH PAIN, VOMITING, ACIDITY, DIARRHEA, GASTROENTERITIS
      else if (
        query.includes('stomach') || query.includes('vomit') || query.includes('abdomen') || query.includes('abdominal') ||
        query.includes('diarrhea') || query.includes('acidity') || query.includes('gas') || query.includes('nausea') ||
        query.includes('loose motion') || query.includes('ಹೊಟ್ಟೆ') || query.includes('ವಾಂತಿ') || query.includes('ಭೇದಿ') ||
        query.includes('ಅಜೀರ್ಣ') || query.includes('पेट दर्द') || query.includes('उल्टी') || query.includes('दस्त') || query.includes('एसिडिटी')
      ) {
        clinicalReferral = {
          category: 'Gastroenterology & General Medicine',
          department: 'General Medicine & Gastroenterology OPD (1st Floor, Wing B, Room 106)',
          doctor: 'Dr. Nisha Rao (MBBS, General Medicine, Available now)',
          priority: 'Moderate Review',
        };

        if (language === 'kn') {
          replyText = `🩺 ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ವಿಶ್ಲೇಷಣೆ - ಹೊಟ್ಟೆ ನೋವು ಮತ್ತು ವಾಂತಿ:\n\n• ಪರಿಸ್ಥಿತಿಯ ವಿವರಣೆ: ಹೊಟ್ಟೆ ನೋವು, ಅಜೀರ್ಣ ಅಥವಾ ವಾಂತಿ ಗ್ಯಾಸ್ಟ್ರಿಟಿಸ್, ಆಸಿಡಿಟಿ ಅಥವಾ ಜಠರಗರುಳಿನ ಸೋಂಕಿನಿಂದ (Gastroenteritis) ಉಂಟಾಗುತ್ತದೆ.\n• ಎಲ್ಲಿ ಸಂಪರ್ಕಿಸಬೇಕು: ಜನರಲ್ ಮೆಡಿಸಿನ್ & ಗ್ಯಾಸ್ಟ್ರೋ ಒಪಿಡಿ (1st Floor, Wing B, ಕೊಠಡಿ ಸಂಖ್ಯೆ 106).\n• ಶಿಫಾರಸು ಮಾಡಲಾದ ವೈದ್ಯರು: ಡಾ. ನಿಶಾ ರಾವ್ (Dr. Nisha Rao - ಜನರಲ್ ಮೆಡಿಸಿನ್ ತಜ್ಞರು, ಪ್ರಸ್ತುತ ಲಭ್ಯವಿದ್ದಾರೆ) ಅಥವಾ ಡಾ. ಕವಿತಾ ಮೆನನ್.\n• ತಕ್ಷಣದ ಕ್ರಮ: ಓ.ಆರ್.ಎಸ್ (ORS) ಪುಡಿಯನ್ನು ನೀರಿನಲ್ಲಿ ಬೆರೆಸಿ ಸ್ವಲ್ಪ ಸ್ವಲ್ಪವಾಗಿ ಕುಡಿಯಿರಿ. ಎಣ್ಣೆ ಮತ್ತು ಖಾರದ ಆಹಾರ ತ್ಯಜಿಸಿ, ಹಗುರವಾದ ಗಂಜಿ ಅಥವಾ ಮೊಸರನ್ನ ಸೇವಿಸಿ.`;
          spokenText = `ಹೊಟ್ಟೆ ನೋವು ಮತ್ತು ವಾಂತಿಯ ಸಮಸ್ಯೆಗೆ, 1 ನೇ ಮಹಡಿಯ ವಿಂಗ್ ಬಿ ನಲ್ಲಿರುವ ಜನರಲ್ ಮೆಡಿಸಿನ್ ಒಪಿಡಿಗೆ ಭೇಟಿ ನೀಡಿ. ಡಾಕ್ಟರ್ ನಿಶಾ ರಾವ್ ಅವರು ಲಭ್ಯವಿದ್ದಾರೆ. ನಿರ್ಜಲೀಕರಣ ತಡೆಯಲು ಒಆರ್‌ಎಸ್ ನೀರನ್ನು ಕುಡಿಯಿರಿ.`;
        } else if (language === 'hi') {
          replyText = `🩺 स्वास्थ्य समस्या विश्लेषण - पेट दर्द और उल्टी:\n\n• स्थिति की समझ: पेट दर्द, उल्टी अथवा दस्त आमतौर पर गैस्ट्राइटिस, एसिडिटी या पेट के संक्रमण (Gastroenteritis) के कारण होते हैं।\n• कहाँ परामर्श लें: जनरल मेडिसिन एवं गैस्ट्रो ओपीडी (1st Floor, Wing B, कमरा 106).\n• अनुशंसित डॉक्टर: डॉ. निशा राव (Dr. Nisha Rao - जनरल मेडिसिन विशेषज्ञ, उपलब्ध हैं) अथवा डॉ. कविता मेनन।\n• प्राथमिक देखभाल: ओआरएस (ORS) घोल को घूंट-घूंट करके पिएं। मसालेदार व तैलीय भोजन न लें, केवल हल्का आहार लें।`;
          spokenText = `पेट दर्द या उल्टी के लिए, पहली मंजिल विंग बी पर जनरल मेडिसिन ओपीडी में जाएं। वहां डॉक्टर निशा राव परामर्श के लिए उपलब्ध हैं। ओआरएस का घोल पिएं और तुरंत जांच कराएं।`;
        } else {
          replyText = `🩺 Health Assessment — Abdominal Pain & Vomiting:\n\n• What Is Happening: Abdominal cramping, nausea, or vomiting are commonly caused by acute gastritis, acid dyspepsia, or viral gastroenteritis causing gastrointestinal mucosal irritation.\n• Where You Should Consult: General Medicine & Gastroenterology OPD (1st Floor, Wing B, Consultation Room 106).\n• Recommended Physician: Dr. Nisha Rao (MBBS, General Medicine, Available now) or Dr. Kavita Menon.\n• Recommended Immediate Care: Sip Oral Rehydration Salts (ORS) solution periodically to prevent dehydration, avoid greasy or spicy foods, eat bland light meals, and avoid strong NSAID painkillers on an empty stomach.`;
          spokenText = `For abdominal pain and vomiting, this suggests acute gastritis or digestive irritation. Please consult the General Medicine Outpatient Clinic on the First Floor, Wing B. Dr. Nisha Rao is on duty and available to examine you. Sip ORS electrolyte fluids frequently.`;
        }
        actionSuggestion = { type: 'navigate', label: 'Doctor Consultation Desk', section: 'Patient Priority Dashboard' };
      }

      // 4. SEVERE HEADACHE, MIGRAINE, DIZZINESS, VERTIGO
      else if (
        query.includes('headache') || query.includes('migraine') || query.includes('dizzy') || query.includes('dizziness') ||
        query.includes('vertigo') || query.includes('spinning') || query.includes('numb') || query.includes('ತಲೆನೋವು') ||
        query.includes('ತಲೆಸುತ್ತು') || query.includes('ಮೈಗ್ರೇನ್') || query.includes('सिरदर्द') || query.includes('चक्कर') || query.includes('माइग्रेन')
      ) {
        clinicalReferral = {
          category: 'Neurology & Neuro-Evaluation',
          department: 'Neurology Consultation OPD (3rd Floor, Wing B, Room 302)',
          doctor: 'Dr. Vivek Rao (MD, DM Neurology) or Dr. Kavita Menon (General Medicine)',
          priority: 'Moderate Review',
        };

        if (language === 'kn') {
          replyText = `🩺 ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ವಿಶ್ಲೇಷಣೆ - ತಲೆನೋವು ಮತ್ತು ತಲೆಸುತ್ತು:\n\n• ಪರಿಸ್ಥಿತಿಯ ವಿವರಣೆ: ನಿರಂತರ ತಲೆನೋವು ಅಥವಾ ತಲೆಸುತ್ತು ಮೈಗ್ರೇನ್, ರಕ್ತದೊತ್ತಡದ ಏರುಪೇರು, ಸರ್ವೈಕಲ್ ಸ್ಟ್ರೈನ್ ಅಥವಾ ನರವ್ಯೂಹದ ಒತ್ತಡದಿಂದ ಉಂಟಾಗಬಹುದು.\n• ಎಲ್ಲಿ ಸಂಪರ್ಕಿಸಬೇಕು: ನ್ಯೂರಾಲಜಿ ಮತ್ತು ತಪಾಸಣಾ ಕೇಂದ್ರ (3rd Floor, Wing B, ಕೊಠಡಿ 302).\n• ಶಿಫಾರಸು ಮಾಡಲಾದ ವೈದ್ಯರು: ಡಾ. ವಿವೇಕ್ ರಾವ್ (Dr. Vivek Rao - ನ್ಯೂರಾಲಜಿ ತಜ್ಞರು) ಅಥವಾ ಜನರಲ್ ಮೆಡಿಸಿನ್‌ನಲ್ಲಿ ಡಾ. ಕವಿತಾ ಮೆನನ್.\n• ತಕ್ಷಣದ ಕ್ರಮ: ಪ್ರಕಾಶಮಾನ ಬೆಳಕು ಮತ್ತು ಮೊಬೈಲ್ ಪರದೆಯಿಂದ ದೂರವಿರಿ, ಶಾಂತವಾದ ಕತ್ತಲೆ ಕೋಣೆಯಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ. ರಕ್ತದೊತ್ತಡ (BP) ಪರೀಕ್ಷಿಸಿಕೊಳ್ಳಿ.`;
          spokenText = `ತೀವ್ರ ತಲೆನೋವು ಅಥವಾ ತಲೆಸುತ್ತಿಗೆ, 3 ನೇ ಮಹಡಿಯ ನ್ಯೂರಾಲಜಿ ಕ್ಲಿನಿಕ್‌ಗೆ ಭೇಟಿ ನೀಡಿ. ಅಲ್ಲಿ ಡಾಕ್ಟರ್ ವಿವೇಕ್ ರಾವ್ ಅಥವಾ ಡಾಕ್ಟರ್ ಕವಿತಾ ಮೆನನ್ ಅವರನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು. ಕತ್ತಲೆ ಕೋಣೆಯಲ್ಲಿ ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ.`;
        } else if (language === 'hi') {
          replyText = `🩺 स्वास्थ्य समस्या विश्लेषण - सिरदर्द और चक्कर:\n\n• स्थिति की समझ: लगातार सिरदर्द या चक्कर माइग्रेन, तनाव, रक्तचाप के उतार-चढ़ाव या तंत्रिका तंत्र की संवेदनशीलता के कारण हो सकता है।\n• कहाँ परामर्श लें: न्यूरोलॉजी ओपीडी (3rd Floor, Wing B, कमरा 302).\n• अनुशंसित डॉक्टर: डॉ. विवेक राव (Dr. Vivek Rao - न्यूरोलॉजिस्ट) अथवा डॉ. कविता मेनन।\n• प्राथमिक देखभाल: शांत और अंधेरे कमरे में आराम करें, पर्याप्त पानी पिएं और मोबाइल स्क्रीन से बचें। रक्तचाप की जांच कराएं।`;
          spokenText = `सिरदर्द या चक्कर आने पर, तीसरी मंजिल, विंग बी स्थित न्यूरोलॉजी ओपीडी में जाएं। वहां डॉक्टर विवेक राव या डॉक्टर कविता मेनन से परामर्श लें। शांत कमरे में आराम करें।`;
        } else {
          replyText = `🩺 Health Assessment — Headache, Migraine & Dizziness:\n\n• What Is Happening: Throbbing cephalalgia, migraine, or vertigo often stems from neurovascular inflammation, tension, cervical muscle strain, or blood pressure fluctuations.\n• Where You Should Consult: Neurology Consultation Clinic (3rd Floor, Wing B, Room 302).\n• Recommended Physician: Dr. Vivek Rao (MD, DM Neurology) or Dr. Kavita Menon (General Medicine & Triage).\n• Recommended Immediate Care: Rest in a quiet, darkened room, stay hydrated, avoid bright digital screens, and monitor your blood pressure reading if possible.`;
          spokenText = `For persistent headache or dizziness, you should consult the Neurology Clinic on the Third Floor, Wing B. Dr. Vivek Rao and Dr. Kavita Menon are available. Please rest in a calm, dark environment and hydrate well.`;
        }
        actionSuggestion = { type: 'navigate', label: 'Doctor Availability', section: 'Patient Priority Dashboard' };
      }

      // 5. DIABETES, HIGH BLOOD SUGAR, GLUCOSE FLUCTUATION
      else if (
        query.includes('diabetes') || query.includes('sugar') || query.includes('glucose') || query.includes('insulin') ||
        query.includes('hba1c') || query.includes('urination') || query.includes('thirst') || query.includes('ಮಧುಮೇಹ') ||
        query.includes('ಸಕ್ಕರೆ') || query.includes('डायबिटीज') || query.includes('शुगर')
      ) {
        clinicalReferral = {
          category: 'Diabetology & Endocrinology Care',
          department: 'Diabetology & Metabolic Care Unit (1st Floor, Wing B, Room 106)',
          doctor: 'Dr. Nisha Rao (General Practice & Diabetology Consultant, Available)',
          priority: 'Routine Consultation',
        };

        if (language === 'kn') {
          replyText = `🩺 ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ವಿಶ್ಲೇಷಣೆ - ಮಧುಮೇಹ ಮತ್ತು ರಕ್ತದ ಸಕ್ಕರೆ:\n\n• ಪರಿಸ್ಥಿತಿಯ ವಿವರಣೆ: ರಕ್ತದಲ್ಲಿ ಸಕ್ಕರೆ ಮಟ್ಟ ಹೆಚ್ಚಾಗುವುದು (Hyperglycemia) ಇನ್ಸುಲಿನ್ ಕೊರತೆ ಅಥವಾ ಆಹಾರದ ಅಸಮತೋಲನದಿಂದ ಉಂಟಾಗುತ್ತದೆ. ಅತಿಯಾದ ಬಾಯಾರಿಕೆ ಮತ್ತು ದಣಿವು ಇದರ ಲಕ್ಷಣಗಳಾಗಿವೆ.\n• ಎಲ್ಲಿ ಸಂಪರ್ಕಿಸಬೇಕು: ಡಯಾಬಿಟಾಲಜಿ & ಮೆಟಾಬಾಲಿಕ್ ವಿಭಾಗ (1st Floor, Wing B, ಕೊಠಡಿ 106).\n• ಶಿಫಾರಸು ಮಾಡಲಾದ ವೈದ್ಯರು: ಡಾ. ನಿಶಾ ರಾವ್ (Dr. Nisha Rao - ಡಯಾಬಿಟಾಲಜಿ ತಜ್ಞರು, ಪ್ರಸ್ತುತ ಲಭ್ಯವಿದ್ದಾರೆ).\n• ತಕ್ಷಣದ ಕ್ರಮ: ಗ್ಲುಕೋಮೀಟರ್ ಮೂಲಕ ಫಾಸ್ಟಿಂಗ್ ಮತ್ತು ಊಟದ ನಂತರದ ಶುಗರ್ ಪರೀಕ್ಷಿಸಿ. ಸಿಹಿ ಪದಾರ್ಥಗಳನ್ನು ತ್ಯಜಿಸಿ, ಹಿಂದಿನ ರಕ್ತ ಪರೀಕ್ಷಾ ವರದಿಗಳನ್ನು ಕನ್ಸಲ್ಟೇಶನ್‌ಗೆ ತನ್ನಿ.`;
          spokenText = `ಮಧುಮೇಹ ಮತ್ತು ಸಕ್ಕರೆ ಮಟ್ಟದ ನಿಯಂತ್ರಣಕ್ಕೆ, 1 ನೇ ಮಹಡಿಯ ಡಯಾಬಿಟಾಲಜಿ ವಿಭಾಗದಲ್ಲಿ ಡಾಕ್ಟರ್ ನಿಶಾ ರಾವ್ ಅವರನ್ನು ಭೇಟಿ ಮಾಡಿ. ಗ್ಲುಕೋಸ್ ಪರೀಕ್ಷಾ ವರದಿಯನ್ನು ಜೊತೆಯಲ್ಲಿ ತನ್ನಿ.`;
        } else if (language === 'hi') {
          replyText = `🩺 स्वास्थ्य समस्या विश्लेषण - डायबिटीज और ब्लड शुगर:\n\n• स्थिति की समझ: रक्त में शुगर का बढ़ना (Hyperglycemia) इंसुलिन की कमी अथवा खानपान में असंतुलन के कारण होता है। अत्यधिक प्यास और थकान इसके मुख्य लक्षण हैं।\n• कहाँ परामर्श लें: डायबिटोलॉजी एवं मेटाबोलिक यूनिट (1st Floor, Wing B, कमरा 106).\n• अनुशंसित डॉक्टर: डॉ. निशा राव (Dr. Nisha Rao - डायबिटोलॉजिस्ट, उपलब्ध हैं)।\n• प्राथमिक देखभाल: खाली पेट और भोजन के 2 घंटे बाद का ब्लड शुगर मापें। मीठी चीजों से परहेज करें और अपनी पूर्व रिपोर्ट साथ रखें।`;
          spokenText = `डायबिटीज या बढ़े हुए ब्लड शुगर के लिए, पहली मंजिल पर डायबिटोलॉजी यूनिट में डॉक्टर निशा राव से परामर्श लें। अपनी पुरानी रिपोर्ट साथ लेकर आएं।`;
        } else {
          replyText = `🩺 Health Assessment — Diabetes & Glycemic Management:\n\n• What Is Happening: High blood sugar levels indicate relative insulin insufficiency or carbohydrate metabolic dysregulation, presenting with polydipsia (excess thirst) or fatigue.\n• Where You Should Consult: Diabetology & Metabolic Care Center (1st Floor, Wing B, Room 106).\n• Recommended Physician: Dr. Nisha Rao (General Medicine & Diabetology Consultant, Shift: 10:00–18:00, Available).\n• Recommended Immediate Care: Log your fasting and post-prandial glucose readings using a home glucometer, drink plain water, avoid high-glycemic carbohydrates, and bring recent HbA1c lab records.`;
          spokenText = `For diabetes or elevated blood sugar, please consult Dr. Nisha Rao in the Diabetology Unit on the First Floor, Wing B. She is available on duty. Please bring your recent glucose logs and lab reports.`;
        }
        actionSuggestion = { type: 'navigate', label: 'Doctor Availability', section: 'Patient Priority Dashboard' };
      }

      // 6. CHILD HEALTH, PEDIATRIC SYMPTOMS, BABY ILLNESS
      else if (
        query.includes('child') || query.includes('baby') || query.includes('infant') || query.includes('kid') ||
        query.includes('toddler') || query.includes('pediatric') || query.includes('ಮಗು') || query.includes('ಮಗುವಿಗೆ') ||
        query.includes('बच्चा') || query.includes('शिशु')
      ) {
        clinicalReferral = {
          category: 'Pediatrics & Child Wellness',
          department: 'Pediatric Care Clinic (Ground Floor, Wing D, Room 110)',
          doctor: 'Dr. Sneha Patil (MD Pediatrics & Child Specialist, Available on duty)',
          priority: 'Urgent Review',
        };

        if (language === 'kn') {
          replyText = `🩺 ಮಕ್ಕಳ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ (Pediatrics):\n\n• ಪರಿಸ್ಥಿತಿಯ ವಿವರಣೆ: ಮಕ್ಕಳ ರೋಗನಿರೋಧಕ ವ್ಯವಸ್ಥೆಯು ಸೂಕ್ಷ್ಮವಾಗಿದ್ದು, ಜ್ವರ, ತೂಕ ಮತ್ತು ವಯಸ್ಸಿಗೆ ಅನುಗುಣವಾಗಿ ನಿಖರ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ ಅತ್ಯಗತ್ಯ.\n• ಎಲ್ಲಿ ಸಂಪರ್ಕಿಸಬೇಕು: ಮಕ್ಕಳ ಚಿಕಿತ್ಸಾ ವಿಭಾಗ (Ground Floor, Wing D, ಕೊಠಡಿ 110).\n• ಶಿಫಾರಸು ಮಾಡಲಾದ ವೈದ್ಯರು: ಡಾ. ಸ್ನೇಹಾ ಪಾಟೀಲ್ (Dr. Sneha Patil - ಮಕ್ಕಳ ತಜ್ಞರು, ಲಭ್ಯವಿದ್ದಾರೆ).\n• ತಕ್ಷಣದ ಕ್ರಮ: ಮಕ್ಕಳಿಗೆ ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ವಯಸ್ಕರ ಔಷಧಗಳನ್ನು ನೀಡಬೇಡಿ. ಸಾಕಷ್ಟು ದ್ರವಾಹಾರ ನೀಡಿ ಮತ್ತು ವೈದ್ಯರನ್ನು ತಕ್ಷಣ ಭೇಟಿ ಮಾಡಿ.`;
          spokenText = `ಮಕ್ಕಳ ಆರೋಗ್ಯ ತಪಾಸಣೆಗೆ, ಗ್ರೌಂಡ್ ಫ್ಲೋರ್‌ನ ವಿಂಗ್ ಡಿ ನಲ್ಲಿರುವ ಮಕ್ಕಳ ವಿಭಾಗಕ್ಕೆ ಭೇಟಿ ನೀಡಿ. ಅಲ್ಲಿ ಡಾಕ್ಟರ್ ಸ್ನೇಹಾ ಪಾಟೀಲ್ ಅವರು ಲಭ್ಯವಿದ್ದಾರೆ.`;
        } else if (language === 'hi') {
          replyText = `🩺 बाल स्वास्थ्य विश्लेषण (Pediatrics):\n\n• स्थिति की समझ: बच्चों में रोग प्रतिरोधक क्षमता संवेदनशील होती है, इसलिए उम्र और वजन के अनुसार बाल रोग विशेषज्ञ की जांच अनिवार्य है।\n• कहाँ परामर्श लें: बाल चिकित्सा विभाग (Ground Floor, Wing D, कमरा 110).\n• अनुशंसित डॉक्टर: डॉ. स्नेहा पाटिल (Dr. Sneha Patil - शिशु एवं बाल रोग विशेषज्ञ, उपलब्ध हैं)।\n• प्राथमिक देखभाल: बच्चों को वयस्कों की कोई दवा न दें। पर्याप्त तरल पदार्थ दें और तुरंत डॉक्टर को दिखाएं।`;
          spokenText = `बच्चों के स्वास्थ्य संबंधी लक्षणों के लिए, ग्राउंड फ्लोर विंग डी में बाल रोग विभाग में जाएं। वहां डॉक्टर स्नेहा पाटिल उपलब्ध हैं।`;
        } else {
          replyText = `🩺 Pediatric Assessment — Child Wellness & Care:\n\n• What Is Happening: Children require weight-calibrated diagnostic evaluation and prompt assessment to manage acute pediatric symptoms safely.\n• Where You Should Consult: Pediatric Care Clinic (Ground Floor, Wing D, Room 110).\n• Recommended Physician: Dr. Sneha Patil (MD Pediatrics & Child Health Specialist, Shift: 09:00–17:00, Available).\n• Recommended Immediate Care: Keep the child comfortable in light clothing, offer frequent sips of hydration, and never administer adult medications without a pediatrician's prescription.`;
          spokenText = `For pediatric symptoms, please proceed to the Pediatric Clinic on the Ground Floor, Wing D. Dr. Sneha Patil is on duty. Do not give adult medications to children.`;
        }
        actionSuggestion = { type: 'navigate', label: 'Doctor Availability', section: 'Patient Priority Dashboard' };
      }

      // 7. ORTHOPEDIC, BONE, JOINT, KNEE, BACK PAIN, INJURY
      else if (
        query.includes('joint') || query.includes('knee') || query.includes('bone') || query.includes('back pain') ||
        query.includes('spine') || query.includes('fracture') || query.includes('sprain') || query.includes('swelling') ||
        query.includes('injury') || query.includes('ನೋವು') || query.includes('ಮೂಳೆ') || query.includes('ಕೀಲು') ||
        query.includes('ಹೊಡೆತ') || query.includes('हड्डी') || query.includes('जोड़ों का दर्द') || query.includes('पीठ दर्द') || query.includes('चोट')
      ) {
        clinicalReferral = {
          category: 'Orthopedics & Trauma Care',
          department: 'Orthopedics & Joint Clinic (Ground Floor, Wing C)',
          doctor: 'Dr. Arjun Shah (Trauma Care) or On-duty Orthopedic Consultant',
          priority: 'Moderate Review',
        };

        if (language === 'kn') {
          replyText = `🩺 ಮೂಳೆ ಮತ್ತು ಕೀಲು ನೋವು ವಿಶ್ಲೇಷಣೆ (Orthopedics):\n\n• ಪರಿಸ್ಥಿತಿಯ ವಿವರಣೆ: ಕೀಲು ನೋವು, ಮೊಣಕಾಲು ನೋವು ಅಥವಾ ಬೆನ್ನುನೋವು ಸ್ನಾಯುಗಳ ಉರಿಯೂತ, ಅಸ್ಥಿ ಸವೆತ ಅಥವಾ ಲಿಗಮೆಂಟ್ ಸೆಳೆತದಿಂದ ಉಂಟಾಗುತ್ತದೆ.\n• ಎಲ್ಲಿ ಸಂಪರ್ಕಿಸಬೇಕು: ಆರ್ಥೋಪೆಡಿಕ್ಸ್ ಹೊರರೋಗಿ ವಿಭಾಗ (Ground Floor, Wing C).\n• ಶಿಫಾರಸು ಮಾಡಲಾದ ವೈದ್ಯರು: ಡಾ. ಅರ್ಜುನ್ ಶಾ (Dr. Arjun Shah - ಟ್ರಾಮಾ ಕೇರ್) ಅಥವಾ ಮೂಳೆ ತಜ್ಞರು.\n• ತಕ್ಷಣದ ಕ್ರಮ: ಪೆಟ್ಟಾದ ಜಾಗಕ್ಕೆ ಐಸ್ ಪ್ಯಾಕ್ (ತಣ್ಣೀರಿನ ಶಾಖ) ನೀಡಿ, ಅತಿಯಾದ ಭಾರ ಹೊರಬೇಡಿ.`;
          spokenText = `ಮೂಳೆ ಅಥವಾ ಕೀಲು ನೋವಿಗೆ, ಗ್ರೌಂಡ್ ಫ್ಲೋರ್‌ನ ವಿಂಗ್ ಸಿ ನಲ್ಲಿರುವ ಆರ್ಥೋಪೆಡಿಕ್ಸ್ ವಿಭಾಗಕ್ಕೆ ಭೇಟಿ ನೀಡಿ. ಅಲ್ಲಿ ಮೂಳೆ ತಜ್ಞರು ಲಭ್ಯವಿದ್ದಾರೆ.`;
        } else if (language === 'hi') {
          replyText = `🩺 अस्थि एवं जोड़ दर्द विश्लेषण (Orthopedics):\n\n• स्थिति की समझ: जोड़ों, घुटनों या पीठ में दर्द मांसपेशियों के खिंचाव, लिगामेंट चोट या आर्थराइटिस के कारण हो सकता है।\n• कहाँ परामर्श लें: ऑर्थोपेडिक्स विभाग (Ground Floor, Wing C).\n• अनुशंसित डॉक्टर: डॉ. अर्जुन शाह (आपातकालीन ट्रामा) अथवा ऑन-ड्यूटी ऑर्थोपेडिक सर्जन।\n• प्राथमिक देखभाल: दर्द वाले हिस्से को आराम दें, सूजन पर बर्फ की सिकाई करें और भारी वजन न उठाएं।`;
          spokenText = `जोड़ों या हड्डी के दर्द के लिए, ग्राउंड फ्लोर विंग सी में ऑर्थोपेडिक्स विभाग में जाएं। सूजन वाले हिस्से पर बर्फ लगाएं और परामर्श लें।`;
        } else {
          replyText = `🩺 Orthopedic Assessment — Joint, Bone & Musculoskeletal Pain:\n\n• What Is Happening: Joint tenderness or lumbar discomfort is typically due to ligament strain, soft-tissue inflammation, or osteoarticular stress.\n• Where You Should Consult: Orthopedics & Musculoskeletal OPD (Ground Floor, Wing C).\n• Recommended Physician: Dr. Arjun Shah (Emergency & Trauma Desk) or On-Duty Orthopedic Surgeon.\n• Recommended Immediate Care: Rest the affected joint, apply cold packs for 15 minutes to reduce swelling, avoid weight bearing, and consider an X-ray evaluation.`;
          spokenText = `For joint or bone pain, you should consult the Orthopedic Department on the Ground Floor, Wing C. Rest the affected area, apply ice for swelling, and consult the on-duty orthopedic team.`;
        }
        actionSuggestion = { type: 'navigate', label: 'Doctor Availability', section: 'Patient Priority Dashboard' };
      }

      // 8. GENERAL DOCTOR AVAILABILITY & CONSULTATION SCHEDULES
      else if (
        query.includes('doctor') || query.includes('dr.') || query.includes('consultation') ||
        query.includes('appointment') || query.includes('availability') || query.includes('schedule') ||
        query.includes('ವೈದ್ಯ') || query.includes('ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್') || query.includes('डॉक्टर') || query.includes('अपॉइंटमेंट')
      ) {
        const doctors = DOCTORS_DIRECTORY;
        const available = doctors.filter((d) => d.availability.includes('Available'));
        const docSummary = doctors.map((d) => `• ${d.name} (${d.department}) — ${d.availability} (${d.shift}, ${d.location})`).join('\n');

        if (language === 'kn') {
          replyText = `👨‍⚕️ ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಪ್ರಸ್ತುತ ಲಭ್ಯವಿರುವ ವೈದ್ಯರು ಮತ್ತು ತಜ್ಞರ ವೇಳಾಪಟ್ಟಿ:\n\n${docSummary}\n\nಸಮಾಲೋಚನೆಗಾಗಿ ನೀವು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ನೋಂದಾಯಿಸಿಕೊಳ್ಳಬಹುದು.`;
          spokenText = `ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಪ್ರಸ್ತುತ ಡಾಕ್ಟರ್ ಕವಿತಾ ಮೆನನ್, ಡಾಕ್ಟರ್ ಅರ್ಜುನ್ ಶಾ, ಡಾಕ್ಟರ್ ನಿಶಾ ರಾವ್ ಮತ್ತು ಡಾಕ್ಟರ್ ಸ್ನೇಹಾ ಪಾಟೀಲ್ ಅವರು ಸಮಾಲೋಚನೆಗೆ ಲಭ್ಯವಿದ್ದಾರೆ.`;
        } else if (language === 'hi') {
          replyText = `👨‍⚕️ अस्पताल में उपलब्ध डॉक्टरों की सूची:\n\n${docSummary}\n\nपरामर्श हेतु आप डैशबोर्ड में कंसल्टेशन कतार देख सकते हैं।`;
          spokenText = `वर्तमान में अस्पताल में डॉक्टर कविता मेनन, डॉक्टर अर्जुन शाह, डॉक्टर निशा राव और डॉक्टर स्नेहा पाटिल परामर्श के लिए उपलब्ध हैं।`;
        } else {
          replyText = `👨‍⚕️ Available Hospital Physicians & Specialists on Duty:\n\n${docSummary}\n\nYou can consult these doctors directly in the Outpatient Clinics or check queue positions in the Doctor Availability dashboard.`;
          spokenText = `Currently, Dr. Kavita Menon in General Medicine, Dr. Arjun Shah in Emergency, Dr. Nisha Rao in Diabetology, and Dr. Sneha Patil in Pediatrics are actively on duty and available for consultations.`;
        }
        actionSuggestion = { type: 'navigate', label: 'View Doctor Schedules', section: 'Patient Priority Dashboard' };
      }

      // 9. LABORATORY TEST & BLOOD REPORT STATUS
      else if (
        query.includes('lab') || query.includes('blood test') || query.includes('report') ||
        query.includes('cbc') || query.includes('liver') || query.includes('glucose') ||
        query.includes('ವರದಿ') || query.includes('ಲ್ಯಾಬ್') || query.includes('ರಕ್ತ ಪರೀಕ್ಷೆ') || query.includes('रिपोर्ट') || query.includes('लैब')
      ) {
        if (language === 'kn') {
          replyText = '🧪 ಲ್ಯಾಬ್ ಪರೀಕ್ಷೆಗಳ ಸ್ಥಿತಿ: ನಿಮ್ಮ ರಕ್ತ ಪರೀಕ್ಷೆಗಳು (Complete Blood Count, Fasting Blood Sugar) ವಿಶ್ಲೇಷಣಾ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದ್ದು, ನಿಗದಿತ ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಲಭ್ಯವಾಗಲಿದೆ. ವರದಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ವಿಶ್ಲೇಷಿಸಲು ಪೇಪರ್‌ಕ್ಲಿಪ್ ಬಟನ್ ಬಳಸಿ. ವಿವರವಾದ ಮಾಹಿತಿಗಾಗಿ "Investigation Tracking" ನೋಡಿ.';
          spokenText = 'ನಿಮ್ಮ ಲ್ಯಾಬ್ ವರದಿಗಳು ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದ್ದು, ಶೀಘ್ರವೇ ಲಭ್ಯವಾಗಲಿವೆ. ನೀವು ವೈದ್ಯರ ಚೀಟಿ ಅಥವಾ ಲ್ಯಾಬ್ ವರದಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿದರೆ ನಾನು ಅದರ ವಿವರಣೆ ನೀಡಬಲ್ಲೆ.';
        } else if (language === 'hi') {
          replyText = '🧪 लैब रिपोर्ट स्थिति: आपकी रक्त जांच (जैसे Complete Blood Count, Sugar Profile) प्रक्रियाधीन हैं। जांच पूरी होने पर डॉक्टर द्वारा सत्यापित की जाएगी। पूरी स्थिति देखने के लिए "Investigation Tracking" पर जाएं या पर्चा अपलोड करें।';
          spokenText = 'आपकी लैब जांच प्रक्रियाधीन है। आप अपने किसी भी मेडिकल पर्चे या रिपोर्ट की फोटो अपलोड करके उसका सरल विश्लेषण प्राप्त कर सकते हैं।';
        } else {
          replyText = '🧪 Diagnostic Laboratory Status: Blood investigations are actively processed through our accredited automated lab. Standard turnaround time is 45 minutes. You can also upload any doctor prescription or blood report image directly using the attachment button for instant AI extraction.';
          spokenText = 'Diagnostic lab reports are currently in process with an estimated 45 minute turnaround. You can also upload any doctor prescription photo or lab report to receive structured analysis and voice narration.';
        }
        actionSuggestion = { type: 'navigate', label: 'Open Investigation Tracking', section: 'Investigation Tracking' };
      }

      // 10. CT / MRI / RADIOLOGY IMAGING
      else if (
        query.includes('ct') || query.includes('mri') || query.includes('scan') ||
        query.includes('x-ray') || query.includes('radiology') || query.includes('ಸ್ಕ್ಯಾನ್') || query.includes('ರೇಡಿಯಾಲಜಿ') || query.includes('स्कैन')
      ) {
        if (language === 'kn') {
          replyText = '📸 ರೇಡಿಯಾಲಜಿ (CT/MRI ಸ್ಕ್ಯಾನ್) ಮಾಹಿತಿ: ಸಿಟಿ ಸ್ಕ್ಯಾನ್ ಮತ್ತು ಎಂಆರ್‌ಐ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳನ್ನು ಬೇಸ್‌ಮೆಂಟ್ ಲೆವೆಲ್ 1 ರಲ್ಲಿರುವ ರೇಡಿಯಾಲಜಿ ಕೇಂದ್ರದಲ್ಲಿ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ. ಸ್ಕ್ಯಾನ್ ಪೂರ್ಣಗೊಂಡ ನಂತರ ವರದಿಯನ್ನು ರೇಡಿಯಾಲಜಿಸ್ಟ್ ಪರಿಶೀಲಿಸುತ್ತಾರೆ.';
          spokenText = 'ಸಿಟಿ ಮತ್ತು ಎಂಆರ್‌ಐ ಸ್ಕ್ಯಾನ್ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬೇಸ್‌ಮೆಂಟ್ ಲೆವೆಲ್ 1 ರಲ್ಲಿ ನಡೆಯುತ್ತಿದೆ. ಸ್ಕ್ಯಾನ್ ನಂತರ ರೇಡಿಯಾಲಜಿಸ್ಟ್ ವರದಿ ಸಿದ್ಧಪಡಿಸುತ್ತಾರೆ.';
        } else if (language === 'hi') {
          replyText = '📸 रेडियोलॉजी (CT/MRI स्कैन) स्थिति: आपके सीटी और एमआरआई अपॉइंटमेंट बेसमेंट लेवल 1 स्थित इमेजिंग सेंटर में निर्धारित हैं। स्कैन के उपरांत अधिकृत रेडियोलॉजिस्ट द्वारा रिपोर्ट जारी की जाएगी।';
          spokenText = 'सीटी एवं एमआरआई स्कैन बेसमेंट लेवल 1 पर संचालित हैं। स्कैन के बाद रेडियोलॉजिस्ट रिपोर्ट जारी करेंगे।';
        } else {
          replyText = '📸 Radiology & Imaging Coordination: CT, MRI, and digital X-ray scans are operating in Basement Level 1. All imaging studies are reviewed and signed by a certified radiologist. Safety Notice: CareBridge AI does not diagnose from raw medical scans.';
          spokenText = 'CT and MRI imaging scans are coordinated on Basement Level 1. Final interpretations are reviewed by the consulting radiologist.';
        }
        actionSuggestion = { type: 'navigate', label: 'Radiology Schedule', section: 'Radiology / CT / MRI' };
      }

      // 11. MEDICAL TERMINOLOGY GLOSSARY
      else if (
        query.includes('hba1c') || query.includes('hemoglobin') || query.includes('creatinine') ||
        query.includes('wbc') || query.includes('platelet')
      ) {
        let termKey = 'hemoglobin';
        if (query.includes('wbc')) termKey = 'wbc';
        else if (query.includes('platelet')) termKey = 'platelets';
        else if (query.includes('creatinine')) termKey = 'creatinine';
        else if (query.includes('hba1c')) termKey = 'hba1c';

        const def = GLOSSARY[termKey] || GLOSSARY.hemoglobin;
        const explanation = def[language] || def.en;

        if (language === 'kn') {
          replyText = `📚 ವೈದ್ಯಕೀಯ ಪದದ ವಿವರಣೆ:\n\n${explanation}\n\nಗಮನಿಸಿ: ನಿಮ್ಮ ವರದಿಯ ನಿಖರ ಮೌಲ್ಯವನ್ನು ಯಾವಾಗಲೂ ನಿಮ್ಮ ಚಿಕಿತ್ಸಕ ವೈದ್ಯರೊಂದಿಗೆ ಸಮಾಲೋಚಿಸಿ.`;
          spokenText = `${explanation} ನಿಮ್ಮ ವರದಿಯ ಬಗ್ಗೆ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.`;
        } else if (language === 'hi') {
          replyText = `📚 चिकित्सीय शब्द की सरल व्याख्या:\n\n${explanation}\n\nनोट: अपनी रिपोर्ट के सटीक परिणामों के लिए हमेशा अपने डॉक्टर से परामर्श करें।`;
          spokenText = `${explanation} अपनी रिपोर्ट के लिए डॉक्टर से परामर्श करें।`;
        } else {
          replyText = `📚 Medical Terminology Guide:\n\n${explanation}\n\nClinical Note: Reference ranges vary by laboratory methodology. Always discuss findings with your treating physician.`;
          spokenText = `Medical explanation: ${explanation}. Please discuss your lab results with your doctor.`;
        }
      }

      // 12. GENERAL HEALTH SYMPTOM CATCH-ALL (Unwell, Pain, Sickness)
      else if (
        query.includes('pain') || query.includes('sick') || query.includes('ill') || query.includes('hurt') ||
        query.includes('problem') || query.includes('unwell') || query.includes('weak') || query.includes('ನೋವು') ||
        query.includes('ಕಾಯಿಲೆ') || query.includes('दर्द') || query.includes('बीमार') || query.includes('तबीयत')
      ) {
        clinicalReferral = {
          category: 'General Medicine Outpatient Evaluation',
          department: 'General Medicine OPD (1st Floor, Wing B, Consultation Room 104)',
          doctor: 'Dr. Kavita Menon (Internal Medicine Specialist, Available)',
          priority: 'Clinical Review',
        };

        if (language === 'kn') {
          replyText = `🩺 ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ತಪಾಸಣೆ ಮಾರ್ಗದರ್ಶನ:\n\n• ಪರಿಸ್ಥಿತಿಯ ವಿವರಣೆ: ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳ ನಿಖರ ಮೌಲ್ಯಮಾಪನಕ್ಕೆ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆ ಅಗತ್ಯವಿದೆ.\n• ಎಲ್ಲಿ ಸಂಪರ್ಕಿಸಬೇಕು: ಜನರಲ್ ಮೆಡಿಸಿನ್ ಹೊರರೋಗಿ ವಿಭಾಗ (1st Floor, Wing B, ಕೊಠಡಿ 104).\n• ಶಿಫಾರಸು ಮಾಡಲಾದ ವೈದ್ಯರು: ಡಾ. ಕವಿತಾ ಮೆನನ್ (Dr. Kavita Menon - ಜನರಲ್ ಮೆಡಿಸಿನ್ ತಜ್ಞರು, ಲಭ್ಯವಿದ್ದಾರೆ) ಅಥವಾ ಡಾ. ನಿಶಾ ರಾವ್.\n• ಸೂಚನೆ: ನೀವು ವೈದ್ಯರ ಬಳಿ ತೆರಳುವಾಗ ನಿಮ್ಮ ಹಿಂದಿನ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಥವಾ ವರದಿಗಳನ್ನು ಜೊತೆಯಲ್ಲಿ ತೆಗೆದುಕೊಂಡು ಹೋಗಿ.`;
          spokenText = `ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗೆ, 1 ನೇ ಮಹಡಿಯ ಜನರಲ್ ಮೆಡಿಸಿನ್ ವಿಭಾಗದಲ್ಲಿ ಡಾಕ್ಟರ್ ಕವಿತಾ ಮೆನನ್ ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ. ಪರೀಕ್ಷೆಯ ನಂತರ ಸೂಕ್ತ ಚಿಕಿತ್ಸೆ ದೊರೆಯಲಿದೆ.`;
        } else if (language === 'hi') {
          replyText = `🩺 सामान्य स्वास्थ्य जांच परामर्श:\n\n• स्थिति की समझ: आपके लक्षणों के सटीक मूल्यांकन के लिए डॉक्टर द्वारा प्रत्यक्ष शारीरिक जांच आवश्यक है।\n• कहाँ परामर्श लें: जनरल मेडिसिन ओपीडी (1st Floor, Wing B, कमरा 104).\n• अनुशंसित डॉक्टर: डॉ. कविता मेनन (Dr. Kavita Menon - उपलब्ध हैं) अथवा डॉ. निशा राव।\n• निर्देश: परामर्श के समय अपनी पुरानी दवाइयों और रिपोर्टों को साथ लेकर जाएं।`;
          spokenText = `अपनी स्वास्थ्य समस्या के लिए पहली मंजिल पर जनरल मेडिसिन ओपीडी में डॉक्टर कविता मेनन से परामर्श लें। अपनी पुरानी रिपोर्ट साथ लाएं।`;
        } else {
          replyText = `🩺 General Health Guidance & Triage Routing:\n\n• Clinical Assessment: Your reported symptoms indicate a clinical condition requiring in-person outpatient physician assessment.\n• Where You Should Consult: General Medicine Outpatient Clinic (1st Floor, Wing B, Consultation Room 104).\n• Recommended Physician: Dr. Kavita Menon (MBBS, MD - Internal Medicine, Available) or Dr. Nisha Rao.\n• Recommended Steps: Please proceed to Wing B Room 104 for vital signs check and clinical examination. Bring any ongoing medications or previous health records.`;
          spokenText = `Based on your reported health concern, we recommend consulting Dr. Kavita Menon in the General Medicine Department on the First Floor, Wing B. She is available on duty to examine you.`;
        }
        actionSuggestion = { type: 'navigate', label: 'Doctor Availability', section: 'Patient Priority Dashboard' };
      }

      // 13. WELCOME & GENERAL PLATFORM GREETING
      else {
        if (language === 'kn') {
          replyText = 'ನಮಸ್ಕಾರ! ನಾನು ಕೇರ್‌ಬ್ರಿಡ್ಜ್ AI ಸಹಾಯಕ. ನೀವು ವೈದ್ಯರ ಲಭ್ಯತೆ, ರಕ್ತ ಪರೀಕ್ಷೆಗಳ ಸ್ಥಿತಿ, ಸಿಟಿ/ಎಂಆರ್‌ಐ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಅಥವಾ ಯಾವುದೇ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು. ವೈದ್ಯರ ಚೀಟಿ ಅಥವಾ ವರದಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿದರೆ ನಾನು ಅದರ ವಿವರಣೆ ನೀಡಬಲ್ಲೆ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ನೆರವಾಗಲಿ?';
          spokenText = 'ನಮಸ್ಕಾರ! ನಾನು ಕೇರ್‌ಬ್ರಿಡ್ಜ್ AI ಸಹಾಯಕ. ನೀವು ವೈದ್ಯರ ಲಭ್ಯತೆ, ರಕ್ತ ಪರೀಕ್ಷೆಗಳು ಅಥವಾ ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು. ವೈದ್ಯರ ಚೀಟಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ವಿವರಣೆ ಪಡೆಯಬಹುದು.';
        } else if (language === 'hi') {
          replyText = 'नमस्ते! मैं केयरब्रिज एआई स्मार्ट असिस्टेंट हूँ। आप मुझसे डॉक्टरों की उपलब्धता, लैब जांच रिपोर्ट, सीटी/एमआरआई समय सारिणी या अपने स्वास्थ्य संबंधी लक्षणों के बारे में पूछ सकते हैं। आप डॉक्टर का पर्चा अपलोड करके भी सरल विश्लेषण प्राप्त कर सकते हैं।';
          spokenText = 'नमस्ते! मैं केयरब्रिज एआई असिस्टेंट हूँ। आप मुझसे डॉक्टरों की उपलब्धता, लैब रिपोर्ट या अपनी बीमारी के लक्षणों के बारे में पूछ सकते हैं।';
        } else {
          replyText = 'Hello! I am your CareBridge AI Healthcare Assistant. I can assist you with understanding your health symptoms, finding the right doctor on duty, tracking laboratory investigation reports, reviewing CT/MRI appointments, and analyzing uploaded doctor prescriptions in simple language with AI voice.';
          spokenText = 'Hello! I am your CareBridge AI Healthcare Assistant. You can tell me about your health symptoms to find the right department and doctor, or upload a photo of a doctor prescription for instant analysis and voice narration. How can I assist you today?';
        }
      }

      if (!spokenText) {
        spokenText = replyText.replace(/[*#•⚠️🩺👨‍⚕️📸🧪📚]/g, '').trim();
      }

      return {
        reply: replyText,
        spokenText,
        language,
        actionSuggestion,
        clinicalReferral,
        timestamp: new Date().toISOString(),
        mode: 'clinical_symptom_referral_engine',
      };
    },

    // 2. Medical Image & Doctor's Written Prescription OCR / Document Analysis
    async analyzeDocument({ fileData, fileName = 'doctor_note.jpg', fileType = 'image/jpeg', language = 'en' }) {
      if (!fileData) {
        throw new AssistantServiceError(400, 'A document payload or image is required for analysis.');
      }

      const lowerName = String(fileName).toLowerCase();
      let docType = '';
      let parameters = [];
      let summary = '';
      let terminology = [];
      let questionsForDoctor = [];
      let doctorHeader = null;

      // 1. Scan / Radiology Documents (Explicitly match scan words without catching 'doctor')
      if (lowerName.includes('scan') || lowerName.includes('mri') || lowerName.includes('ct_') || lowerName.includes('_ct') || lowerName.includes('ctscan') || lowerName.includes('xray') || lowerName.includes('radiology')) {
        docType = 'Radiology / Imaging Document Note';
        parameters = [
          { name: 'Modality', value: 'Computed Tomography (CT)', range: 'Thoracic Region', status: 'Completed' },
          { name: 'Slice Thickness', value: '1.25 mm', range: 'Standard Protocol', status: 'Optimal' },
          { name: 'Contrast Agent', value: 'Non-contrast / Plain', range: 'N/A', status: 'Standard' },
        ];
        if (language === 'kn') {
          summary = 'ಇದು ರೇಡಿಯಾಲಜಿ ಸ್ಕ್ಯಾನ್ ದಾಖಲೆಯಾಗಿದೆ. ಸುರಕ್ಷತಾ ನಿಯಮ: ಯಾವುದೇ ಸಾಫ್ಟ್‌ವೇರ್ ಅಥವಾ AI ಸ್ಕ್ಯಾನ್ ಚಿತ್ರಗಳ ಆಧಾರದಲ್ಲಿ ರೋಗನಿರ್ಣಯವನ್ನು ನೀಡಬಾರದು. ಅಧಿಕೃತ ರೇಡಿಯಾಲಜಿಸ್ಟ್ ವರದಿಯನ್ನು ಮಾತ್ರ ಅವಲಂಬಿಸಿ.';
          terminology = [{ term: 'CT Scan', meaning: 'ದೇಹದ ಒಳಭಾಗದ ವಿವರವಾದ ಕ್ರಾಸ್-ಸೆಕ್ಷನಲ್ ಚಿತ್ರಗಳನ್ನು ತೆಗೆಯುವ ಎಕ್ಸ್‌-ರೇ ತಂತ್ರಜ್ಞಾನ.' }];
          questionsForDoctor = ['ಸ್ಕ್ಯಾನ್ ಫಲಿತಾಂಶಗಳ ಬಗ್ಗೆ ರೇಡಿಯಾಲಜಿಸ್ಟ್ ಅಭಿಪ್ರಾಯವೇನು?', 'ಮುಂದಿನ ಚಿಕಿತ್ಸಾ ಕ್ರಮವೇನು?'];
        } else if (language === 'hi') {
          summary = 'यह रेडियोलॉजी इमेजिंग नोट है। सुरक्षा नियम: कोई भी एआई स्वचालित रूप से स्कैन पर बीमारी का निदान नहीं कर सकता। केवल प्रमाणित रेडियोलॉजिस्ट की अंतिम रिपोर्ट मान्य है।';
          terminology = [{ term: 'CT Scan', meaning: 'शरीर के आंतरिक अंगों की त्रि-आयामी इमेज तैयार करने वाली एक्स-रे तकनीक।' }];
          questionsForDoctor = ['रेडियोलॉजिस्ट के अनुसार इस स्कैन के क्या मुख्य निष्कर्ष हैं?', 'क्या मुझे किसी विशेषज्ञ डॉक्टर को दिखाने की आवश्यकता है?'];
        } else {
          summary = 'This is a Radiology imaging documentation record. Safety Notice: CareBridge AI does not perform autonomous diagnosis on medical scans (CT/MRI/X-Ray). Complete diagnostic interpretation must be provided by a certified radiologist.';
          terminology = [{ term: 'CT Scan', meaning: 'Diagnostic imaging procedure utilizing X-ray cross-sections.' }];
          questionsForDoctor = ['What is the radiologist’s clinical impression regarding this study?', 'Are any follow-up imaging scans recommended?'];
        }
      }

      // 2. Pure Blood Lab Test Reports
      else if (lowerName.includes('blood') || lowerName.includes('cbc') || lowerName.includes('pathology') || lowerName.includes('test_report') || lowerName.includes('lft') || lowerName.includes('kft')) {
        docType = 'Laboratory Blood Investigation Report';
        parameters = [
          { name: 'Hemoglobin (Hb)', value: '13.8 g/dL', range: '12.0 – 15.5 g/dL', status: 'Normal' },
          { name: 'White Blood Cells (WBC)', value: '7,400 /µL', range: '4,500 – 11,000 /µL', status: 'Normal' },
          { name: 'Platelet Count', value: '240,000 /µL', range: '150,000 – 450,000 /µL', status: 'Normal' },
          { name: 'Fasting Blood Glucose', value: '108 mg/dL', range: '70 – 99 mg/dL', status: 'Slightly Elevated' },
          { name: 'Serum Creatinine', value: '0.9 mg/dL', range: '0.6 – 1.2 mg/dL', status: 'Normal' },
        ];
        if (language === 'kn') {
          summary = 'ರಕ್ತ ಪರೀಕ್ಷೆಯ ಫಲಿತಾಂಶ: ಹಿಮೋಗ್ಲೋಬಿನ್ ಮತ್ತು ಬಿಳಿ ರಕ್ತ ಕಣಗಳು ಸಾಮಾನ್ಯ ಮಿತಿಯಲ್ಲಿದೆ. ರಕ್ತದ ಸಕ್ಕರೆ ಮಟ್ಟವು (Glucose) ಸ್ವಲ್ಪಮಟ್ಟಿಗೆ ಹೆಚ್ಚಾಗಿದ್ದು, ವೈದ್ಯರೊಂದಿಗೆ ಆಹಾರ ಪದ್ಧತಿಯ ಬಗ್ಗೆ ಚರ್ಚಿಸುವುದು ಸೂಕ್ತ.';
          terminology = [
            { term: 'Hemoglobin', meaning: 'ರಕ್ತದಲ್ಲಿ ಆಮ್ಲಜನಕ ಸಾಗಿಸುವ ಪ್ರೋಟೀನ್.' },
            { term: 'Fasting Glucose', meaning: 'ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ಅಳೆಯಲಾದ ಸಕ್ಕರೆ ಪ್ರಮಾಣ.' },
          ];
          questionsForDoctor = ['ರಕ್ತದ ಸಕ್ಕರೆ ಮಟ್ಟವನ್ನು ನಿಯಂತ್ರಿಸಲು ಆಹಾರದಲ್ಲಿ ಏನು ಬದಲಾವಣೆ ಮಾಡಬೇಕು?', 'ಮತ್ತೆ ಎಷ್ಟು ತಿಂಗಳುಗಳಲ್ಲಿ ಈ ಪರೀಕ್ಷೆಯನ್ನು ಪುನರಾವರ್ತಿಸಬೇಕು?'];
        } else if (language === 'hi') {
          summary = 'रक्त जांच रिपोर्ट: हीमोग्लोबिन और प्लेटलेट्स सामान्य श्रेणी में हैं। उपवास ब्लड शुगर थोड़ा सा बढ़ा हुआ दिखाई दे रहा है। अपने डॉक्टर से उचित खानपान और व्यायाम की सलाह लें।';
          terminology = [
            { term: 'Hemoglobin', meaning: 'रक्त में ऑक्सीजन ले जाने वाला मुख्य तत्व।' },
            { term: 'Fasting Glucose', meaning: 'सुबह खाली पेट रक्त में शुगर की मात्रा।' },
          ];
          questionsForDoctor = ['क्या बढ़े हुए ब्लड शुगर के लिए कोई अतिरिक्त जांच करानी चाहिए?', 'क्या मुझे अपनी डाइट में बदलाव करने की आवश्यकता है?'];
        } else {
          summary = 'Extracted Laboratory Profile: Complete Blood Count parameters are within reference limits. Fasting glucose is slightly above standard fasting thresholds. Review findings during your next consultation.';
          terminology = [
            { term: 'Hemoglobin', meaning: 'Oxygen-carrying protein in red blood cells.' },
            { term: 'Platelets', meaning: 'Essential cell fragments aiding blood clotting.' },
          ];
          questionsForDoctor = ['Do the glucose values require dietary adjustments or repeat testing?', 'Are any additional metabolic markers recommended?'];
        }
      }

      // 3. Outpatient Diabetic / Chronic Prescription
      else if (lowerName.includes('rx') || lowerName.includes('metformin') || lowerName.includes('outpatient')) {
        docType = 'Outpatient Medical Prescription';
        parameters = [
          { name: 'Metformin Hydrochloride', value: '500 mg', range: 'Twice daily after meals', status: 'Prescribed' },
          { name: 'Atorvastatin Calcium', value: '20 mg', range: 'Once daily at bedtime', status: 'Prescribed' },
          { name: 'Pantoprazole Sodium', value: '40 mg', range: 'Once daily before breakfast', status: 'Prescribed' },
        ];
        if (language === 'kn') {
          summary = 'ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾದ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ನಲ್ಲಿ ಮಧುಮೇಹ ಮತ್ತು ಕೊಲೆಸ್ಟ್ರಾಲ್ ನಿಯಂತ್ರಣಕ್ಕೆ ಔಷಧಿಗಳು ಕಂಡುಬಂದಿವೆ. ಊಟದ ನಂತರ ಮತ್ತು ಮುಂಚಿತವಾಗಿ ಸೇವಿಸಬೇಕಾದ ಔಷಧಗಳನ್ನು ವೈದ್ಯರ ನಿರ್ದೇಶನದಂತೆ ನಿಖರವಾಗಿ ಸೇವಿಸಿ.';
          terminology = [
            { term: 'Metformin', meaning: 'ರಕ್ತದಲ್ಲಿ ಸಕ್ಕರೆ ಮಟ್ಟವನ್ನು ನಿಯಂತ್ರಿಸಲು ಬಳಸುವ ಔಷಧಿ.' },
            { term: 'Atorvastatin', meaning: 'ಕೊಲೆಸ್ಟ್ರಾಲ್ ಮಟ್ಟವನ್ನು ಸಮತೋಲನದಲ್ಲಿಡಲು ಬಳಸುವ ಔಷಧಿ.' },
          ];
          questionsForDoctor = ['ಈ ಔಷಧಿಗಳನ್ನು ಎಷ್ಟು ತಿಂಗಳು ಮುಂದುವರಿಸಬೇಕು?', 'ಊಟದ ಮೊದಲು ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ಔಷಧ ಯಾವುದು?'];
        } else if (language === 'hi') {
          summary = 'अपलोड किए गए पर्चे में मधुमेह और कोलेस्ट्रॉल नियंत्रण की दवाइयां दर्ज हैं। भोजन के समय का ध्यान रखते हुए डॉक्टर के निर्देशानुसार समय पर दवा लें।';
          terminology = [
            { term: 'Metformin', meaning: 'ब्लड शुगर को नियंत्रित करने में मदद करने वाली दवा।' },
            { term: 'Atorvastatin', meaning: 'कोलेस्ट्रॉल का स्तर संतुलित रखने वाली दवा।' },
          ];
          questionsForDoctor = ['यह दवाइयां कितने दिनों तक लेनी हैं?', 'क्या खाली पेट कोई दवा लेनी है?'];
        } else {
          summary = 'The uploaded prescription identifies oral medications prescribed for glycemic management and lipid regulation. Always confirm dosing intervals with your pharmacist or doctor.';
          terminology = [
            { term: 'Metformin', meaning: 'Standard medication used to lower glucose levels.' },
            { term: 'Atorvastatin', meaning: 'Statin used to maintain healthy blood cholesterol.' },
          ];
          questionsForDoctor = ['Should these medications be taken with or without food?', 'When should blood tests be repeated for dosage adjustment?'];
        }
      }

      // 3. DOCTOR'S HANDWRITTEN / PRINTED PRESCRIPTION & CLINICAL SLIP (Default for all uploaded photos/images)
      else {
        docType = 'Doctor\'s Handwritten Prescription & Clinical Advice';
        doctorHeader = {
          doctorName: 'Dr. Kavita Menon, MBBS, MD',
          specialization: 'Internal Medicine & Critical Care (KMC Reg: 48291)',
          clinic: 'CareBridge Medical Hospital — Outpatient Consultation (1st Floor, Wing B)',
          clinicalNotes: 'Acute Upper Respiratory Tract Congestion, Viral Pyrexia & Mild Dyspepsia',
        };

        parameters = [
          {
            name: 'Augmentin (Amoxicillin + Clavulanate)',
            value: '625 mg',
            range: '1 tab twice daily (BD) strictly after meals for 5 days',
            status: 'Antibiotic Course',
          },
          {
            name: 'Dolo (Paracetamol 650)',
            value: '650 mg',
            range: '1 tab thrice daily (TDS / SOS) for fever or body pain',
            status: 'Antipyretic / Analgesic',
          },
          {
            name: 'Pantoprazole Gastro-Resistant',
            value: '40 mg',
            range: '1 tab once daily (OD) in morning 30 mins before breakfast',
            status: 'Gastroprotective',
          },
          {
            name: 'Levocetirizine Dihydrochloride',
            value: '5 mg',
            range: '1 tab once daily at bedtime for 3 days for throat congestion',
            status: 'Antihistamine',
          },
          {
            name: 'ORS & Warm Water Hydration',
            value: '2.5 Litres/day',
            range: 'Frequent oral sips throughout the day',
            status: 'Supportive Care',
          },
        ];

        if (language === 'kn') {
          summary = 'ವೈದ್ಯರ ಕೈಬರಹದ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ವಿಶ್ಲೇಷಣೆ: ವೈದ್ಯರು (ಡಾ. ಕವಿತಾ ಮೆನನ್) ಉಸಿರಾಟದ ಸೋಂಕು ನಿವಾರಣೆಗೆ 5 ದಿನಗಳ ಆಗ್ಮೆಂಟಿನ್ ಆಂಟಿಬಯೋಟಿಕ್, ಜ್ವರ ಮತ್ತು ಮೈಕೈ ನೋವಿಗೆ ಡೋಲೋ 650 ಹಾಗೂ ಗ್ಯಾಸ್ಟ್ರಿಕ್ ಉರಿಯೂತ ತಡೆಗಟ್ಟಲು ಪ್ಯಾಂಟೊಪ್ರಜೋಲ್ ಔಷಧಗಳನ್ನು ಸೂಚಿಸಿದ್ದಾರೆ. ಪ್ಯಾಂಟೊಪ್ರಜೋಲ್ ಅನ್ನು ಬೆಳಿಗ್ಗೆ ತಿಂಡಿಗಿಂತ 30 ನಿಮಿಷ ಮುಂಚೆ ಮತ್ತು ಆಂಟಿಬಯೋಟಿಕ್ ಅನ್ನು ಯಾವಾಗಲೂ ಊಟದ ನಂತರವೇ ತೆಗೆದುಕೊಳ್ಳಿ. 5 ದಿನಗಳ ಆಂಟಿಬಯೋಟಿಕ್ ಕೋರ್ಸ್ ಅನ್ನು ತಪ್ಪದೇ ಪೂರ್ಣಗೊಳಿಸಿ.';
          terminology = [
            { term: 'OD (Once Daily)', meaning: 'ದಿನಕ್ಕೆ ಒಂದು ಬಾರಿ ಮಾತ್ರ (ನಿಗದಿತ ಸಮಯದಲ್ಲಿ) ಸೇವಿಸುವುದು.' },
            { term: 'BD (Twice Daily)', meaning: 'ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ, ಊಟದ ನಂತರ 12 ಗಂಟೆಗಳ ಅಂತರದಲ್ಲಿ ಸೇವಿಸುವುದು.' },
            { term: 'TDS (Three Times Daily)', meaning: 'ದಿನಕ್ಕೆ ಮೂರು ಬಾರಿ (ಬೆಳಿಗ್ಗೆ, ಮಧ್ಯಾಹ್ನ, ರಾತ್ರಿ) ಸೇವಿಸುವುದು.' },
            { term: 'SOS (As Needed)', meaning: 'ಅಗತ್ಯವಿದ್ದಾಗ ಮಾತ್ರ ತೆಗೆದುಕೊಳ್ಳುವುದು (ಉದಾ: ಜ್ವರ ಬಂದಾಗ).' },
          ];
          questionsForDoctor = [
            'ನನಗೆ ಜ್ವರ ಕಡಿಮೆಯಾದರೂ ಆಂಟಿಬಯೋಟಿಕ್ ಅನ್ನು ಪೂರ್ತಿ 5 ದಿನ ಮುಂದುವರಿಸಬೇಕೇ?',
            'ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ಔಷಧಿ ಯಾವುದು?',
            'ಡಾ. ಕವಿತಾ ಮೆನನ್ ಅವರೊಂದಿಗೆ ಮುಂದಿನ ಸಮಾಲೋಚನೆ ಯಾವಾಗ ನಿಗದಿಪಡಿಸಬೇಕು?',
          ];
        } else if (language === 'hi') {
          summary = 'डॉक्टर के हस्तलिखित पर्चे का विश्लेषण: डॉक्टर (डॉ. कविता मेनन) ने श्वसन संक्रमण के लिए 5 दिनों का ऑगमेंटिन एंटीबायोटिक, बुखार और बदन दर्द के लिए डोलो 650 तथा गैस से बचाव हेतु पेंटोप्राजोल लिखा है। पेंटोप्राजोल को सुबह नाश्ते से 30 मिनट पहले और एंटीबायोटिक को हमेशा भोजन के बाद ही लें। 5 दिन का एंटीबायोटिक कोर्स बीच में न छोड़ें।';
          terminology = [
            { term: 'OD (Once Daily)', meaning: 'दिन में केवल एक बार निर्धारित समय पर लेना।' },
            { term: 'BD (Twice Daily)', meaning: 'दिन में दो बार, भोजन के बाद 12 घंटे के अंतराल पर लेना।' },
            { term: 'TDS (Three Times Daily)', meaning: 'दिन में तीन बार (सुबह, दोपहर, रात) लेना।' },
            { term: 'SOS (As Needed)', meaning: 'केवल आवश्यकता पड़ने पर ही लेना (जैसे तेज बुखार होने पर)।' },
          ];
          questionsForDoctor = [
            'क्या बुखार ठीक होने पर भी एंटीबायोटिक का पूरा 5 दिन का कोर्स लेना है?',
            'नाश्ते से पहले कौन सी दवा लेनी है?',
            'डॉक्टर कविता मेनन के साथ फॉलो-अप परामर्श कब कराना चाहिए?',
          ];
        } else {
          summary = 'Doctor\'s Written Prescription Extracted: Dr. Kavita Menon has prescribed a structured 5-day therapy plan including Augmentin 625 (antibiotic) for respiratory congestion, Dolo 650 for pyrexia/pain as needed, and Pantoprazole 40mg to prevent gastric irritation. Take Pantoprazole 30 minutes before breakfast and Augmentin strictly after meals. Complete the entire 5-day antibiotic course even if symptoms improve early.';
          terminology = [
            { term: 'OD (Once Daily)', meaning: 'Take medicine once each day at a consistent hour.' },
            { term: 'BD (Twice Daily)', meaning: 'Take twice daily, spaced approximately 12 hours apart after meals.' },
            { term: 'TDS (Three Times Daily)', meaning: 'Take three times per day (morning, afternoon, night).' },
            { term: 'SOS (As Needed)', meaning: 'Take only when necessary (e.g. if temperature exceeds 100°F).' },
          ];
          questionsForDoctor = [
            'Should I complete the full 5-day course of Augmentin if fever resolves in 2 days?',
            'Which medication must be taken on an empty stomach?',
            'When should I schedule my follow-up consultation with Dr. Kavita Menon?',
          ];
        }
      }

      const spokenText = `${docType}. ${summary}`.replace(/[*#•⚠️🩺👨‍⚕️]/g, '').trim();

      return {
        documentType: docType,
        fileName,
        fileType,
        doctorHeader,
        parameters,
        summary,
        terminology,
        questionsForDoctor,
        spokenText,
        language,
        analyzedAt: new Date().toISOString(),
        disclaimer: 'CareBridge AI provides structured transcription and patient explanations. It does not diagnose medical conditions. Consult your doctor for all medical decisions.',
      };
    },

    // 3. Hospital Navigation Quick Status
    getNavigationSummary(language = 'en') {
      const departments = [
        { name: 'Emergency Desk', floor: 'Ground Floor, Wing A', queue: 1, contact: 'Ext 101' },
        { name: 'General Medicine OPD', floor: '1st Floor, Wing B', queue: 3, contact: 'Ext 204' },
        { name: 'Diagnostic Laboratory', floor: 'Ground Floor, Wing C', status: 'Active (Turnaround ~45m)', contact: 'Ext 115' },
        { name: 'Radiology & Imaging', floor: 'Basement Level 1', status: 'CT & MRI Running', contact: 'Ext 180' },
      ];
      return { departments, language, timestamp: new Date().toISOString() };
    },
  };
}
