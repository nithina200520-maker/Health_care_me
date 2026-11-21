import React, { useState } from 'react';
import { ArrowUp, Bot, MessageCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const promptKeys = [
  'How can I track my test report?',
  'How does CareBridge AI work?',
  'I need urgent medical help',
];

export default function AIAssistantPreview() {
  const { language, t } = useLanguage();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const ask = (value = question) => {
    const normalized = value.toLowerCase();
    let reply;
    if (normalized.includes('urgent') || normalized.includes('emergency') || normalized.includes('ತುರ್ತು')) {
      reply = language === 'kn'
        ? 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ ಇರಬಹುದು ಎಂದು ಅನಿಸಿದರೆ, ತಕ್ಷಣ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ ಸಿಬ್ಬಂದಿ ಅಥವಾ ಸ್ಥಳೀಯ ತುರ್ತು ಸೇವೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ. ಈ ಡೆಮೊ ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸುವುದಿಲ್ಲ.'
        : 'If this may be an emergency, contact nearby hospital staff or local emergency services now. This demo cannot assess symptoms.';
    } else if (normalized.includes('report') || normalized.includes('ಪರೀಕ್ಷೆ')) {
      reply = language === 'kn'
        ? 'CareBridge ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ “ವರದಿ ಟ್ರ್ಯಾಕಿಂಗ್” ಆಯ್ಕೆಮಾಡಿ. ಈ ಪೂರ್ವವೀಕ್ಷಣೆಯಲ್ಲಿ ಮಾದರಿ ಮಾಹಿತಿಯನ್ನಷ್ಟೇ ತೋರಿಸಲಾಗುತ್ತದೆ.'
        : 'Open Report Tracking in the CareBridge dashboard to view a test update. This preview shows sample information only.';
    } else {
      reply = language === 'kn'
        ? 'CareBridge AI ರೋಗಿಗಳು ಮತ್ತು ಆಸ್ಪತ್ರೆ ತಂಡಗಳು ಪರೀಕ್ಷೆಗಳು, ವರದಿಗಳು ಮತ್ತು ಮರುಪರಿಶೀಲನೆಗಳನ್ನು ಸಮನ್ವಯಗೊಳಿಸಲು ನೆರವಾಗುವ ಪರಿಕಲ್ಪನೆ. ಈ ಉತ್ತರ ಪೂರ್ವನಿಗದಿತ ಡೆಮೊ ಪ್ರತಿಕ್ರಿಯೆ.'
        : 'CareBridge AI is a concept to help patients and hospital teams coordinate tests, reports, and follow-up. This is a scripted demo response.';
    }
    setQuestion(value);
    setAnswer(reply);
  };

  return <section aria-label={language === 'kn' ? 'CareBridge ಸಹಾಯಕ ಪೂರ್ವವೀಕ್ಷಣೆ' : 'CareBridge assistant preview'} className="relative rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-[#142842] via-[#101F33] to-[#0B1728] p-5 shadow-[0_24px_60px_-30px_rgba(0,212,255,0.4)] sm:p-7">
    <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300/20 to-blue-500/20 text-accent-cyan"><Bot size={23} /></span><div><h2 className="font-semibold text-white">{t('CareBridge AI Assistant')}</h2><p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted"><span className="h-1.5 w-1.5 rounded-full bg-health-success" />{t('Assistant preview')} · {language === 'kn' ? 'ಕನ್ನಡ' : 'English'}</p></div></div><Sparkles size={18} className="text-accent-cyan" /></div>
    <div className="mb-5 min-h-40 rounded-2xl border border-white/5 bg-[#07111F]/60 p-4"><div className="mb-3 flex items-start gap-2.5"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-accent-cyan"><Bot size={15} /></span><p className="rounded-xl rounded-tl-sm bg-[#142842] px-3 py-2.5 text-sm leading-relaxed text-text-secondary">{t('Hello! I can explain how CareBridge helps coordinate appointments, tests, and reports.')}</p></div>{answer && <div className="ml-5 flex items-start gap-2.5"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-400/10 text-accent-blue"><MessageCircle size={15} /></span><div><p className="rounded-xl rounded-tl-sm border border-cyan-300/10 bg-cyan-300/[0.04] px-3 py-2.5 text-sm leading-relaxed text-white">{answer}</p><span className="mt-1 block text-[10px] text-text-muted">{t('Scripted preview · Not medical advice')}</span></div></div>}</div>
    <div className="mb-3"><p className="mb-2 text-xs font-medium text-text-muted">{t('Try a question')}</p><div className="flex flex-wrap gap-2">{promptKeys.map((prompt) => <button key={prompt} onClick={() => ask(t(prompt))} className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.04] px-3 py-1.5 text-left text-xs text-text-secondary transition-colors hover:border-cyan-300/35 hover:text-white">{t(prompt)}</button>)}</div></div>
    <form onSubmit={(e) => { e.preventDefault(); if (question.trim()) ask(question.trim()); }} className="flex gap-2"><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t('Ask about the platform')} aria-label={t('Ask about the platform')} className="form-control min-w-0 flex-1" /><button type="submit" aria-label={t('Send question')} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-accent-cyan to-accent-blue text-[#07111F] transition-transform hover:scale-105"><ArrowUp size={19} /></button></form>
    <p className="mt-3 text-[11px] leading-relaxed text-text-muted">{t('Demo replies are scripted. For urgent concerns, contact qualified medical staff directly.')}</p>
  </section>;
}
