import React from 'react';
import { AlertTriangle, ArrowRight, CalendarClock, ClipboardList, Clock3, FlaskConical, HeartPulse, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';
import AIAssistantPreview from '../components/AIAssistantPreview';
import HologramHeart from '../components/HologramHeart';
import { useLanguage } from '../i18n/LanguageContext';

const features = [
  { icon: HeartPulse, title: 'Smart Patient Prioritization', text: 'Help authorized medical staff identify time-sensitive cases using approved protocols.' },
  { icon: FlaskConical, title: 'Diagnostic Queue Management', text: 'Track pending laboratory tests, CT scans, and MRI requests across departments.' },
  { icon: Clock3, title: 'Report Delay Monitoring', text: 'Make delayed reports visible so responsible teams can follow up.' },
  { icon: AlertTriangle, title: 'Critical Case Escalation', text: 'Surface urgent workflow delays to the appropriate hospital staff.' },
  { icon: CalendarClock, title: 'Appointment Coordination', text: 'Coordinate diagnostic appointments and available slots.' },
  { icon: ClipboardList, title: 'Patient Journey Tracker', text: 'Follow progress from consultation and investigations through follow-up.' },
];

const steps = [
  'Patient Registration', 'Doctor Consultation', 'Investigation Request',
  'Diagnostic Test', 'Report Generation', 'Follow-up Consultation',
];

export default function LandingPage({ onOpenGetStarted }) {
  const { t } = useLanguage();
  const scrollToFeatures = () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  return (
    <div className="overflow-hidden pt-24 pb-16">
      <section id="home" className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-28">
        <div className="text-center lg:text-left">
          <Badge variant="cyan" size="md" className="mb-6">{t('Healthcare coordination platform')}</Badge>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">{t('Connecting Patients to')} <span className="cyan-gradient-text">{t('Timely Healthcare.')}</span></h1>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg lg:mx-0">{t('Smarter healthcare coordination that helps patients track diagnostic tests, reduce waiting uncertainty and connect with the right medical teams.')}</p>
          <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button variant="primary" size="lg" rightIcon={ArrowRight} onClick={onOpenGetStarted}>{t('Get Started')}</Button>
            <Button variant="secondary" size="lg" onClick={scrollToFeatures}>{t('Explore Platform')}</Button>
          </div>
          <p className="flex items-center justify-center gap-2 text-xs text-text-muted lg:justify-start"><ShieldCheck size={15} className="text-health-success" /> {t('Designed to support coordination; clinical decisions remain with care teams.')}</p>
        </div>
        <HologramHeart />
      </section>

      <section id="assistant" className="border-y border-cyan-300/10 bg-[#08172d]/70 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl"><AIAssistantPreview /></div>
      </section>

      <section id="features" className="border-t border-white/5 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader badgeText={t('Platform capabilities')} title={t('Coordination across every step of care')} subtitle={t('A shared view can help patients and hospital teams understand what is pending and what needs attention.')} align="center" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => <Card key={title} variant="default" hover className="border border-white/5 transition-colors hover:border-cyan-300/30">
              <CardContent className="p-6"><div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/15 bg-[#142842] text-accent-cyan"><Icon size={23} /></div><h3 className="mb-2 text-lg font-semibold text-white">{t(title)}</h3><p className="text-sm leading-relaxed text-text-secondary">{t(text)}</p></CardContent>
            </Card>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-white/5 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader badgeText={t('A connected care journey')} title={t('How it works')} subtitle={t('The intended patient workflow, from the first visit to the follow-up consultation.')} align="center" />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => <li key={step} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#101F33]/70 p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/5 text-sm font-bold text-accent-cyan">{String(index + 1).padStart(2, '0')}</span><span className="font-medium text-white">{t(step)}</span></li>)}
          </ol>
        </div>
      </section>

      <section id="about" className="border-t border-white/5 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-[#142842] to-[#0B1728] p-7 sm:p-12">
          <Badge variant="blue" size="md" className="mb-4">{t('About CareBridge AI')}</Badge>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">{t('More visibility. Better coordination.')}</h2>
          <p className="max-w-3xl text-base leading-relaxed text-text-secondary">{t('CareBridge AI is a healthcare coordination concept focused on making diagnostic workflows easier to follow. By improving visibility between patients, doctors, laboratories and radiology teams, the platform aims to reduce uncertainty around tests, reports and follow-up care. This web app is a frontend demo; it does not process patient records or provide medical advice.')}</p>
        </div>
      </section>

      <section id="contact" className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl"><h2 className="mb-3 text-3xl font-bold text-white">{t('Building a more connected care journey')}</h2><p className="mb-6 text-text-secondary">{t('Explore the platform concept and its planned workflow.')}</p><Button variant="secondary" size="lg" onClick={scrollToFeatures}>{t('Explore the features')}</Button></div>
      </section>
    </div>
  );
}
