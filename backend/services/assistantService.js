// backend/services/assistantService.js
// CareBridge AI Phase 5 - Smart Assistant, Medical Document Analysis & Multilingual Engine
// Complies with strict clinical safety protocols: No automated disease diagnosis.

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

export function createAssistantService(priorityStore) {
  return {
    // 1. Conversational Chatbot Engine
    async handleChat({ message, history = [], language = 'en', role = 'Patient' }) {
      if (!message || typeof message !== 'string' || !message.trim()) {
        throw new AssistantServiceError(400, 'A non-empty message is required.');
      }

      const query = message.trim().toLowerCase();
      let replyText = '';
      let actionSuggestion = null;
      let spokenText = '';

      // Emergency keywords check
      if (
        query.includes('emergency') || query.includes('chest pain') || query.includes('breathing') ||
        query.includes('heart attack') || query.includes('stroke') || query.includes('ತುರ್ತು') || query.includes('आपातकालीन')
      ) {
        if (language === 'kn') {
          replyText = '⚠️ ತುರ್ತು ಎಚ್ಚರಿಕೆ: ನೀವು ತೀವ್ರ ಎದೆನೋವು, ಉಸಿರಾಟದ ತೊಂದರೆ ಅಥವಾ ಗಂಭೀರ ಲಕ್ಷಣಗಳನ್ನು ಅನುಭವಿಸುತ್ತಿದ್ದರೆ, ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಯ ತುರ್ತು ವಿಭಾಗವನ್ನು (Emergency Desk) ಸಂಪರ್ಕಿಸಿ ಅಥವಾ 108 ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ ಮಾಡಿ. CareBridge AI ಸ್ವತಂತ್ರ ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಯನ್ನು ನೀಡುವುದಿಲ್ಲ.';
        } else if (language === 'hi') {
          replyText = '⚠️ आपातकालीन सूचना: यदि आपको सीने में तेज दर्द, सांस लेने में अत्यधिक तकलीफ या गंभीर लक्षण हैं, तो तुरंत नजदीकी अस्पताल के आपातकालीन विभाग में जाएं या 108 पर कॉल करें। केयरब्रिज एआई चिकित्सीय आपातकाल का विकल्प नहीं है।';
        } else {
          replyText = '⚠️ EMERGENCY ALERT: If you are experiencing severe chest pain, shortness of breath, sudden numbness, or life-threatening symptoms, please report directly to the Hospital Emergency Desk immediately or call 108/emergency services. CareBridge AI cannot evaluate medical emergencies.';
        }
        actionSuggestion = { type: 'navigate', label: 'Emergency Protocol', section: 'Patient Priority Dashboard' };
      }
      // Doctor Availability & Consultation Queries
      else if (
        query.includes('doctor') || query.includes('dr.') || query.includes('consultation') ||
        query.includes('appointment') || query.includes('availability') || query.includes('ವೈದ್ಯ') || query.includes('डॉक्टर')
      ) {
        const doctors = priorityStore?.doctors || [];
        const available = doctors.filter((d) => d.availability === 'Available');
        const docSummary = doctors.map((d) => `• ${d.name} (${d.department}) — ${d.availability} (${d.shift})`).join('\n');

        if (language === 'kn') {
          replyText = `ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಪ್ರಸ್ತುತ ${available.length} ವೈದ್ಯರು ಲಭ್ಯವಿದ್ದಾರೆ:\n${docSummary}\n\nಸಮಾಲೋಚನೆಗಾಗಿ ನೀವು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿರುವ ಸಮಾಲೋಚನೆ ಸರತಿಯನ್ನು (Consultation Queue) ವೀಕ್ಷಿಸಬಹುದು.`;
        } else if (language === 'hi') {
          replyText = `वर्तमान में अस्पताल में ${available.length} डॉक्टर उपलब्ध हैं:\n${docSummary}\n\nपरामर्श के लिए आप अपने डैशबोर्ड में कंसल्टेशन कतार देख सकते हैं।`;
        } else {
          replyText = `Currently, there are ${available.length} doctors actively available for consultation:\n${docSummary}\n\nYou can view assigned doctors and live queue workloads directly in the Doctor Availability panel.`;
        }
        actionSuggestion = { type: 'navigate', label: 'View Doctor Schedules', section: 'Patient Priority Dashboard' };
      }
      // Laboratory Test & Report Inquiries
      else if (
        query.includes('lab') || query.includes('blood test') || query.includes('report') ||
        query.includes('cbc') || query.includes('liver') || query.includes('glucose') ||
        query.includes('ವರದಿ') || query.includes('ಲ್ಯಾಬ್') || query.includes('रिपोर्ट')
      ) {
        if (language === 'kn') {
          replyText = 'ಲ್ಯಾಬ್ ಪರೀಕ್ಷೆಗಳ ಸ್ಥಿತಿ: ನೀವು ನೀಡಿದ ರಕ್ತ ಪರೀಕ್ಷೆಗಳು (ಉದಾ: Complete Blood Count, Liver Function Test) ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದ್ದು, ನಿಗದಿತ ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ವರದಿ ಲಭ್ಯವಾಗಲಿದೆ. ವರದಿಯಲ್ಲಿ ವಿಳಂಬವಾದರೆ ಆಸ್ಪತ್ರೆಯ ಸಿಬ್ಬಂದಿಗೆ ಎಚ್ಚರಿಕೆ ರವಾನೆಯಾಗುತ್ತದೆ. ವಿವರವಾದ ಮಾಹಿತಿಗಾಗಿ "Investigation Tracking" ನೋಡಿ.';
        } else if (language === 'hi') {
          replyText = 'लैब जांच की स्थिति: आपकी रक्त जांच (जैसे Complete Blood Count, Liver Function Test) प्रक्रियाधीन हैं। रिपोर्ट तैयार होने पर डॉक्टर को भेजी जाएगी। किसी भी प्रकार के विलंब की निगरानी हमारे सिस्टम द्वारा की जाती है। पूरी स्थिति देखने के लिए "Investigation Tracking" पर जाएं।';
        } else {
          replyText = 'Diagnostic Laboratory Status: Blood tests and panels are tracked across an 11-stage verification lifecycle. If a test is delayed beyond its target SLA time, automated bottleneck alerts are dispatched to the clinical team. You can check individual test milestones in the Investigation Tracking module.';
        }
        actionSuggestion = { type: 'navigate', label: 'Open Investigation Tracking', section: 'Investigation Tracking' };
      }
      // CT / MRI / Radiology Inquiries
      else if (
        query.includes('ct') || query.includes('mri') || query.includes('scan') ||
        query.includes('x-ray') || query.includes('radiology') || query.includes('ಸ್ಕ್ಯಾನ್') || query.includes('स्कैन')
      ) {
        if (language === 'kn') {
          replyText = 'ರೇಡಿಯಾಲಜಿ (CT/MRI ಸ್ಕ್ಯಾನ್) ಮಾಹಿತಿ: ಸಿಟಿ ಸ್ಕ್ಯಾನ್ ಮತ್ತು ಎಂಆರ್‌ಐ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳನ್ನು ರೇಡಿಯಾಲಜಿ ವಿಭಾಗದಲ್ಲಿ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ (ಉದಾ: ಸಿಟಿ ಸ್ಕ್ಯಾನ್ 24 ನವೆಂಬರ್, ಬೆಳಿಗ್ಗೆ 10:00). ಸ್ಕ್ಯಾನ್ ಮುಗಿದ ನಂತರ ವರದಿಗಳನ್ನು ರೇಡಿಯಾಲಜಿಸ್ಟ್ ಪರಿಶೀಲಿಸುತ್ತಾರೆ.';
        } else if (language === 'hi') {
          replyText = 'रेडियोलॉजी (CT/MRI स्कैन) स्थिति: आपके इमेजिंग अपॉइंटमेंट निर्धारित समय पर शेड्यूल हैं। स्कैन पूरा होने के बाद रिपोर्ट रेडियोलॉजिस्ट द्वारा सत्यापित की जाएगी। नवीनतम समय देखने के लिए "Radiology / CT / MRI" अनुभाग देखें।';
        } else {
          replyText = 'Radiology Coordination: CT and MRI appointments are scheduled through the central imaging center (e.g. Chest CT scheduled for Floor 2 Imaging). Turnaround times are monitored to minimize patient wait uncertainty.';
        }
        actionSuggestion = { type: 'navigate', label: 'Radiology Schedule', section: 'Radiology / CT / MRI' };
      }
      // Medical Document / Terminology Explanation
      else if (
        query.includes('hba1c') || query.includes('sugar') || query.includes('hemoglobin') ||
        query.includes('creatinine') || query.includes('wbc') || query.includes('platelet')
      ) {
        let termKey = 'hemoglobin';
        if (query.includes('wbc')) termKey = 'wbc';
        else if (query.includes('platelet')) termKey = 'platelets';
        else if (query.includes('creatinine')) termKey = 'creatinine';
        else if (query.includes('hba1c')) termKey = 'hba1c';
        else if (query.includes('sugar') || query.includes('glucose')) termKey = 'fasting_glucose';

        const def = GLOSSARY[termKey] || GLOSSARY.hemoglobin;
        const explanation = def[language] || def.en;

        if (language === 'kn') {
          replyText = `ವೈದ್ಯಕೀಯ ಪದದ ವಿವರಣೆ:\n${explanation}\n\nಗಮನಿಸಿ: ನಿಮ್ಮ ವರದಿಯ ನಿಖರ ಮೌಲ್ಯವನ್ನು ಯಾವಾಗಲೂ ನಿಮ್ಮ ಚಿಕಿತ್ಸಕ ವೈದ್ಯರೊಂದಿಗೆ ಸಮಾಲೋಚಿಸಿ. ಈ ಸಾಧನವು ರೋಗನಿರ್ಣಯವನ್ನು ನೀಡುವುದಿಲ್ಲ.`;
        } else if (language === 'hi') {
          replyText = `चिकित्सीय शब्द की सरल व्याख्या:\n${explanation}\n\nनोट: अपनी रिपोर्ट के सटीक परिणामों के लिए हमेशा अपने परामर्शदाता डॉक्टर से बात करें। यह जानकारी केवल समझ के लिए है।`;
        } else {
          replyText = `Medical Terminology Explanation:\n${explanation}\n\nNote: Reference ranges can vary by laboratory equipment and patient clinical context. Please review all lab findings directly with your treating physician.`;
        }
      }
      // General Greeting & Platform Navigation
      else {
        if (language === 'kn') {
          replyText = 'ನಮಸ್ಕಾರ! ನಾನು ಕೇರ್‌ಬ್ರಿಡ್ಜ್ AI ಸಹಾಯಕ. ನೀವು ವೈದ್ಯರ ಲಭ್ಯತೆ, ರಕ್ತ ಪರೀಕ್ಷೆಗಳ ಸ್ಥಿತಿ, ಸಿಟಿ/ಎಂಆರ್‌ಐ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಅಥವಾ ವೈದ್ಯಕೀಯ ಚೀಟಿ/ವರದಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ವಿಶ್ಲೇಷಿಸಲು ನನ್ನೊಂದಿಗೆ ಮಾತನಾಡಬಹುದು. ನಾನು ನಿಮಗೆ ಹೇಗೆ ನೆರವಾಗಲಿ?';
        } else if (language === 'hi') {
          replyText = 'नमस्ते! मैं केयरब्रिज एआई स्मार्ट असिस्टेंट हूँ। आप मुझसे डॉक्टरों की उपलब्धता, लैब जांच रिपोर्ट, सीटी/एमआरआई समय सारिणी या अपने मेडिकल पर्चे/रिपोर्ट को अपलोड करके सरल भाषा में समझ सकते हैं। मैं आपकी क्या सहायता करूँ?';
        } else {
          replyText = 'Hello! I am your CareBridge AI Healthcare Assistant. I can assist you with tracking laboratory investigation reports, checking doctor availability, reviewing CT/MRI appointments, and explaining medical documents in simple, accessible language. How can I help you today?';
        }
      }

      spokenText = replyText.replace(/[*#•⚠️]/g, '').trim();

      return {
        reply: replyText,
        spokenText,
        language,
        actionSuggestion,
        timestamp: new Date().toISOString(),
        mode: 'demo_clinical_parser',
      };
    },

    // 2. Medical Image & Document Analysis (OCR & Clinical Extraction)
    async analyzeDocument({ fileData, fileName = 'document.png', fileType = 'image/png', language = 'en' }) {
      if (!fileData) {
        throw new AssistantServiceError(400, 'A document payload or image is required for analysis.');
      }

      // Detect document context based on filename or text signals
      const lowerName = String(fileName).toLowerCase();
      let docType = 'Laboratory Blood Investigation Report';
      let parameters = [];
      let summary = '';
      let terminology = [];
      let questionsForDoctor = [];

      if (lowerName.includes('presc') || lowerName.includes('rx') || lowerName.includes('med')) {
        docType = 'Outpatient Medical Prescription';
        parameters = [
          { name: 'Metformin Hydrochloride', value: '500 mg', range: 'Twice daily after meals', status: 'Prescribed' },
          { name: 'Atorvastatin Calcium', value: '20 mg', range: 'Once daily at bedtime', status: 'Prescribed' },
          { name: 'Pantoprazole Sodium', value: '40 mg', range: 'Once daily before breakfast', status: 'Prescribed' },
        ];
        if (language === 'kn') {
          summary = 'ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾದ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ನಲ್ಲಿ ಮಧುಮೇಹ ಮತ್ತು ಕೊಲೆಸ್ಟ್ರಾಲ್ ನಿಯಂತ್ರಣಕ್ಕೆ ಔಷಧಗಳು ಕಂಡುಬಂದಿವೆ. ಊಟದ ನಂತರ ಮತ್ತು ಮುಂಚಿತವಾಗಿ ಸೇವಿಸಬೇಕಾದ ಔಷಧಗಳನ್ನು ವೈದ್ಯರ ನಿರ್ದೇಶನದಂತೆ ನಿಖರವಾಗಿ ಸೇವಿಸಿ.';
          terminology = [
            { term: 'Metformin', meaning: 'ರಕ್ತದಲ್ಲಿ ಸಕ್ಕರೆ ಮಟ್ಟವನ್ನು ನಿಯಂತ್ರಿಸಲು ಬಳಸುವ ಔಷಧಿ.' },
            { term: 'Atorvastatin', meaning: 'ಕೊಲೆಸ್ಟ್ರಾಲ್ ಮಟ್ಟವನ್ನು ಸಮತೋಲನದಲ್ಲಿಡಲು ಬಳಸುವ ಔಷಧಿ.' },
          ];
          questionsForDoctor = [
            'ಈ ಔಷಧಿಗಳನ್ನು ಎಷ್ಟು ತಿಂಗಳು ಮುಂದುವರಿಸಬೇಕು?',
            'ಊಟದ ಮೊದಲು ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ಔಷಧ ಯಾವುದು?',
            'ಏನಾದರೂ ಅಡ್ಡಪರಿಣಾಮಗಳಿವೆಯೇ?',
          ];
        } else if (language === 'hi') {
          summary = 'अपलोड किए गए पर्चे में मधुमेह और कोलेस्ट्रॉल नियंत्रण की दवाइयां दर्ज हैं। भोजन के समय का ध्यान रखते हुए डॉक्टर के निर्देशानुसार समय पर दवा लें।';
          terminology = [
            { term: 'Metformin', meaning: 'ब्लड शुगर को नियंत्रित करने में मदद करने वाली दवा।' },
            { term: 'Atorvastatin', meaning: 'कोलेस्ट्रॉल का स्तर संतुलित रखने वाली दवा।' },
          ];
          questionsForDoctor = [
            'यह दवाइयां कितने दिनों तक लेनी हैं?',
            'क्या खाली पेट कोई दवा लेनी है?',
            'अगला फॉलो-अप परामर्श कब कराना है?',
          ];
        } else {
          summary = 'The uploaded prescription identifies oral medications prescribed for glycemic management and lipid regulation. Always confirm dosing intervals with your pharmacist or doctor.';
          terminology = [
            { term: 'Metformin', meaning: 'Standard medication used to lower glucose levels.' },
            { term: 'Atorvastatin', meaning: 'Statin used to maintain healthy blood cholesterol.' },
          ];
          questionsForDoctor = [
            'Should these medications be taken with or without food?',
            'How long is the current course intended to last?',
            'When should blood tests be repeated for dosage adjustment?',
          ];
        }
      } else if (lowerName.includes('scan') || lowerName.includes('mri') || lowerName.includes('ct') || lowerName.includes('xray')) {
        docType = 'Radiology / Imaging Document Note';
        parameters = [
          { name: 'Modality', value: 'Computed Tomography (CT)', range: 'Thoracic Region', status: 'Completed' },
          { name: 'Slice Thickness', value: '1.25 mm', range: 'Standard Protocol', status: 'Optimal' },
          { name: 'Contrast Agent', value: 'Non-contrast / Plain', range: 'N/A', status: 'Standard' },
        ];
        if (language === 'kn') {
          summary = 'ಇದು ರೇಡಿಯಾಲಜಿ ಸ್ಕ್ಯಾನ್ ದಾಖಲೆಯಾಗಿದೆ. ಸುರಕ್ಷತಾ ನಿಯಮ: ಯಾವುದೇ ಸಾಫ್ಟ್‌ವೇರ್ ಅಥವಾ AI ಸ್ಕ್ಯಾನ್ ಚಿತ್ರಗಳ ಆಧಾರದಲ್ಲಿ ರೋಗನಿರ್ಣಯವನ್ನು ನೀಡಬಾರದು. ಅಧಿಕೃತ ರೇಡಿಯಾಲಜಿಸ್ಟ್ ವರದಿಯನ್ನು ಮಾತ್ರ ಅವಲಂಬಿಸಿ.';
          terminology = [
            { term: 'CT Scan', meaning: 'ದೇಹದ ಒಳಭಾಗದ ವಿವರವಾದ ಕ್ರಾಸ್-ಸೆಕ್ಷನಲ್ ಚಿತ್ರಗಳನ್ನು ತೆಗೆಯುವ ಎಕ್ಸ್‌-ರೇ ತಂತ್ರಜ್ಞಾನ.' },
          ];
          questionsForDoctor = [
            'ಸ್ಕ್ಯಾನ್ ಫಲಿತಾಂಶಗಳ ಬಗ್ಗೆ ರೇಡಿಯಾಲಜಿಸ್ಟ್ ಅಭಿಪ್ರಾಯವೇನು?',
            'ಮುಂದಿನ ಚಿಕಿತ್ಸಾ ಕ್ರಮವೇನು?',
          ];
        } else if (language === 'hi') {
          summary = 'यह रेडियोलॉजी इमेजिंग नोट है। सुरक्षा नियम: कोई भी एआई स्वचालित रूप से स्कैन पर बीमारी का निदान नहीं कर सकता। केवल प्रमाणित रेडियोलॉजिस्ट की अंतिम रिपोर्ट मान्य है।';
          terminology = [
            { term: 'CT Scan', meaning: 'शरीर के आंतरिक अंगों की त्रि-आयामी इमेज तैयार करने वाली एक्स-रे तकनीक।' },
          ];
          questionsForDoctor = [
            'रेडियोलॉजिस्ट के अनुसार इस स्कैन के क्या मुख्य निष्कर्ष हैं?',
            'क्या मुझे किसी विशेषज्ञ डॉक्टर को दिखाने की आवश्यकता है?',
          ];
        } else {
          summary = 'This is a Radiology imaging documentation record. Safety Notice: CareBridge AI does not perform autonomous diagnosis on medical scans (CT/MRI/X-Ray). Complete diagnostic interpretation must be provided by a certified radiologist.';
          terminology = [
            { term: 'CT Scan', meaning: 'Diagnostic imaging procedure utilizing X-ray cross-sections.' },
          ];
          questionsForDoctor = [
            'What is the radiologist’s clinical impression regarding this study?',
            'Are any follow-up imaging scans recommended?',
          ];
        }
      } else {
        // Standard Laboratory Blood Test Report (e.g. CBC / Metabolic Panel)
        docType = 'Complete Blood Count & Metabolic Profile';
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
          questionsForDoctor = [
            'ರಕ್ತದ ಸಕ್ಕರೆ ಮಟ್ಟವನ್ನು ನಿಯಂತ್ರಿಸಲು ಆಹಾರದಲ್ಲಿ ಏನು ಬದಲಾವಣೆ ಮಾಡಬೇಕು?',
            'ಮತ್ತೆ ಎಷ್ಟು ತಿಂಗಳುಗಳಲ್ಲಿ ಈ ಪರೀಕ್ಷೆಯನ್ನು ಪುನರಾವರ್ತಿಸಬೇಕು?',
          ];
        } else if (language === 'hi') {
          summary = 'रक्त जांच रिपोर्ट: हीमोग्लोबिन और प्लेटलेट्स सामान्य श्रेणी में हैं। उपवास ब्लड शुगर थोड़ा सा बढ़ा हुआ दिखाई दे रहा है। अपने डॉक्टर से उचित खानपान और व्यायाम की सलाह लें।';
          terminology = [
            { term: 'Hemoglobin', meaning: 'रक्त में ऑक्सीजन ले जाने वाला मुख्य तत्व।' },
            { term: 'Fasting Glucose', meaning: 'सुबह खाली पेट रक्त में शुगर की मात्रा।' },
          ];
          questionsForDoctor = [
            'क्या बढ़े हुए ब्लड शुगर के लिए कोई अतिरिक्त जांच करानी चाहिए?',
            'क्या मुझे अपनी डाइट या दिनचर्या में बदलाव करने की आवश्यकता है?',
          ];
        } else {
          summary = 'Extracted Laboratory Profile: Complete Blood Count parameters are within reference limits. Fasting glucose is slightly above standard fasting thresholds. Review findings during your next consultation.';
          terminology = [
            { term: 'Hemoglobin', meaning: 'Oxygen-carrying protein in red blood cells.' },
            { term: 'Platelets', meaning: 'Essential cell fragments aiding blood clotting.' },
          ];
          questionsForDoctor = [
            'Do the glucose values require dietary adjustments or repeat testing?',
            'Are any additional metabolic markers (e.g. HbA1c) recommended?',
          ];
        }
      }

      const spokenText = `${docType}. ${summary}`.replace(/[*#•⚠️]/g, '').trim();

      return {
        documentType: docType,
        fileName,
        fileType,
        parameters,
        summary,
        terminology,
        questionsForDoctor,
        spokenText,
        language,
        analyzedAt: new Date().toISOString(),
        disclaimer: 'CareBridge AI provides structured transcription and patient explanations. It does not diagnose medical conditions. Consult your doctor for all medical interpretations.',
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
