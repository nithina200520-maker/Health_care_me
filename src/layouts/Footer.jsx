import React from 'react';
import { Activity, HeartPulse } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const links = [
  ['About', '#about'], ['Features', '#features'], ['Contact', '#contact'],
  ['Privacy', '#privacy'], ['Disclaimer', '#disclaimer'],
];

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-cyan-300/10 bg-[#07111F] px-4 py-10 text-text-secondary sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <a href="#home" className="mb-3 inline-flex items-center gap-2 font-bold text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-300/10 text-accent-cyan"><Activity size={18} /></span>CareBridge <span className="text-accent-cyan">AI</span></a>
          <p className="text-sm leading-relaxed">{t('Healthcare coordination designed to make diagnostic workflows easier to follow.')}</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          {links.map(([label, href]) => <a key={label} href={href} className="transition-colors hover:text-accent-cyan">{t(label)}</a>)}
        </nav>
      </div>
      <div id="disclaimer" className="mx-auto mt-8 flex max-w-7xl items-start gap-2 border-t border-white/5 pt-5 text-xs leading-relaxed text-text-muted"><HeartPulse size={15} className="mt-0.5 shrink-0" /><p>{t('Disclaimer: CareBridge AI is a concept and coordination platform. It does not provide medical advice, diagnosis, emergency response, or active clinical prioritization. Always consult qualified healthcare professionals.')}</p></div>
      <span id="privacy" className="sr-only">Privacy information will be provided before any personal information is collected.</span>
      <p className="mx-auto mt-4 max-w-7xl text-xs text-text-muted">© {new Date().getFullYear()} CareBridge AI</p>
    </footer>
  );
}
