import React from 'react';
import { AlertTriangle, ArrowRight, CalendarClock, ClipboardList, Clock3, FlaskConical, HeartPulse, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';
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

export default function LandingPage({ onOpenGetStarted, onOpenAuth, onOpenRoleAuth }) {
  const { t } = useLanguage();
  const scrollToFeatures = () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  return (
    <div className="overflow-hidden pt-24 pb-16">
      <section id="home" className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-20">
        <div className="text-center lg:text-left">
          <Badge variant="cyan" size="md" className="mb-6">{t('Healthcare coordination platform')}</Badge>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">{t('Connecting Patients to')} <span className="cyan-gradient-text">{t('Timely Healthcare.')}</span></h1>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg lg:mx-0">{t('Smarter healthcare coordination that helps patients track diagnostic tests, reduce waiting uncertainty and connect with the right medical teams.')}</p>
          <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button variant="primary" size="lg" rightIcon={ArrowRight} onClick={() => onOpenAuth ? onOpenAuth('signup', 'Patient') : onOpenGetStarted()}>{t('Get Started')}</Button>
            <Button variant="secondary" size="lg" onClick={() => onOpenAuth ? onOpenAuth('login', 'Patient') : onOpenGetStarted()}>{t('Login')}</Button>
          </div>
          <p className="flex items-center justify-center gap-2 text-xs text-text-muted lg:justify-start"><ShieldCheck size={15} className="text-health-success" /> {t('Designed to support coordination; clinical decisions remain with care teams.')}</p>
        </div>
        <HologramHeart />
      </section>

      {/* Slide 2: Dedicated Role Authentication & Management Portals */}
      <section id="portals" className="border-t border-cyan-900/30 bg-gradient-to-b from-[#071324] via-[#091b33] to-[#07111f] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/50 mb-3">
              Role-Based Portals & Access Control
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Dedicated Registration & Control Portals
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Access CareBridge AI with customized portals tailored for Patients, Licensed Clinicians, and Hospital System Administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patient Portal Card */}
            <div className="rounded-2xl p-6 bg-[#08172c] border border-cyan-500/30 hover:border-cyan-400/60 shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Portal 01</span>
                <h3 className="text-xl font-bold text-white mt-1 mb-2">Patient Portal</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Self-register as a patient to securely log in, track blood test and radiology turnaround times, check live queue status, and submit symptom check-ins.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400 mb-6">
                  <li className="flex items-center gap-1.5">• Patient Registration & Secure Sign In</li>
                  <li className="flex items-center gap-1.5">• Symptom Check-In & Red-Flag Triage</li>
                  <li className="flex items-center gap-1.5">• 11-Stage Test Tracking with AI Explanations</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-cyan-900/40">
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('signup', 'Patient')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider text-center transition-all"
                >
                  Register Patient
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('login', 'Patient')}
                  className="py-2.5 px-3 rounded-xl bg-[#0b1d36] hover:bg-cyan-950 text-cyan-300 border border-cyan-800/50 text-xs font-semibold text-center transition-all"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Doctor Portal Card */}
            <div className="rounded-2xl p-6 bg-[#081f26] border border-emerald-500/30 hover:border-emerald-400/60 shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Portal 02</span>
                <h3 className="text-xl font-bold text-white mt-1 mb-2">Doctor Portal</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Register with your Medical Council License and specialization. Access clinical priority assessments, consultation queues, and patient review histories.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400 mb-6">
                  <li className="flex items-center gap-1.5">• Doctor Registration with License Validation</li>
                  <li className="flex items-center gap-1.5">• Urgent / Moderate / Routine Prioritization</li>
                  <li className="flex items-center gap-1.5">• Doctor Availability & Caseload Balancing</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-emerald-900/40">
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('signup', 'Doctor')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider text-center transition-all"
                >
                  Register Doctor
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('login', 'Doctor')}
                  className="py-2.5 px-3 rounded-xl bg-[#0b2823] hover:bg-emerald-950 text-emerald-300 border border-emerald-800/50 text-xs font-semibold text-center transition-all"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Administrator Control Dashboard Card */}
            <div className="rounded-2xl p-6 bg-[#11132e] border border-indigo-500/30 hover:border-indigo-400/60 shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Portal 03 (Master Control)</span>
                <h3 className="text-xl font-bold text-white mt-1 mb-2">Admin Dashboard</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Full administrative control center with <strong className="text-white">complete CRUD operations</strong> to view, register, edit, and delete all registered persons across the hospital.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400 mb-6">
                  <li className="flex items-center gap-1.5">• <span className="text-indigo-300 font-semibold">CRUD Power:</span> Create, View, Edit & Delete Persons</li>
                  <li className="flex items-center gap-1.5">• Full Directory Governance (Patients, Doctors, Staff)</li>
                  <li className="flex items-center gap-1.5">• Hospital Waiting-Time & Bottleneck Supervision</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-indigo-900/40">
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('login', 'Hospital Administrator')}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider text-center transition-all shadow-lg shadow-indigo-950/60"
                >
                  Admin Master Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
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
