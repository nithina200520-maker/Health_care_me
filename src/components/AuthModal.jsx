import React from 'react';
import { ArrowRight, Info } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useLanguage } from '../i18n/LanguageContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'signup' }) {
  const { t } = useLanguage();
  const isSignup = initialMode === 'signup';
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t(isSignup ? 'CareBridge AI is in its foundation phase' : 'Sign in will be available later')} description={t('This Phase 0 preview does not create accounts or collect credentials.')} maxWidth="md">
      <div className="space-y-5 pt-1">
        <div className="flex gap-3 rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-4 text-sm leading-relaxed text-text-secondary"><Info size={19} className="mt-0.5 shrink-0 text-accent-cyan" /><p>{t('Authentication is planned for a future phase. No patient records, passwords, or personal health information are handled on this page.')}</p></div>
        <Button variant="primary" size="md" className="w-full" rightIcon={ArrowRight} onClick={onClose}>Continue exploring</Button>
      </div>
    </Modal>
  );
}
