import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage, t } = useLanguage();
  return <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#101F33] px-2.5 py-2 text-xs text-text-secondary" title={language === 'kn' ? 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ' : 'Choose language'}>
    <Languages size={15} className="shrink-0 text-accent-cyan" />
    {!compact && <span className="hidden md:inline">{language === 'kn' ? 'ಭಾಷೆ' : 'Language'}</span>}
    <select aria-label={language === 'kn' ? 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ' : language === 'hi' ? 'भाषा चुनें' : 'Choose language'} value={language} onChange={(event) => setLanguage(event.target.value)} className="cursor-pointer bg-transparent font-medium text-white outline-none">
      <option className="bg-[#101F33]" value="en">English</option>
      <option className="bg-[#101F33]" value="kn">ಕನ್ನಡ (Kannada)</option>
      <option className="bg-[#101F33]" value="hi">हिंदी (Hindi)</option>
    </select>
  </label>;
}
