import React, { useState } from 'react';
import { AlertTriangle, BellRing, CheckCircle2, Clock3, Info } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { evaluateDemonstrationPriority, SYMPTOM_OPTIONS } from '../../utils/triageRules';
import { useLanguage } from '../../i18n/LanguageContext';

const nowForInput = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const blankForm = (defaults = {}) => ({
  patientId: defaults.patientId || '',
  patientName: defaults.patientName || '',
  age: defaults.age || '',
  gender: defaults.gender || '',
  symptoms: [],
  duration: '',
  severity: 'Moderate',
  details: '',
  conditions: '',
  medications: '',
  arrivalTime: nowForInput(),
  otherSymptom: '',
});

export default function SymptomCheckIn({ onSubmit, latestCheckIn, defaults = {}, compact = false }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => blankForm(defaults));
  const [submitted, setSubmitted] = useState(null);
  const triage = evaluateDemonstrationPriority({ symptoms: form.symptoms, severity: form.severity });
  const activeTriage = submitted ? evaluateDemonstrationPriority({ symptoms: submitted.symptoms, severity: submitted.severity }) : triage;
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const toggleSymptom = (symptom) => setForm((prev) => ({ ...prev, symptoms: prev.symptoms.includes(symptom) ? prev.symptoms.filter((x) => x !== symptom) : [...prev.symptoms, symptom] }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const symptomList = form.symptoms.map((symptom) => symptom === 'Other' && form.otherSymptom.trim() ? `Other: ${form.otherSymptom.trim()}` : symptom);
    const result = evaluateDemonstrationPriority({ symptoms: form.symptoms, severity: form.severity });
    const payload = {
      id: form.patientId.trim(),
      name: form.patientName.trim(),
      age: Number(form.age),
      gender: form.gender,
      symptoms: symptomList,
      duration: form.duration,
      severity: form.severity,
      details: form.details.trim(),
      conditions: form.conditions.trim() || 'Not provided',
      medications: form.medications.trim() || 'Not provided',
      arrivalTime: new Date(form.arrivalTime).toISOString(),
      department: 'Registration',
      warningSigns: result.warningSigns,
      demonstrationPriority: result.priority,
      assessmentStatus: 'Awaiting Staff Assessment',
      staffNotes: [],
      overrides: [],
      escalated: false,
      createdAt: new Date().toISOString(),
      waitingMinutes: 0,
      submissionTime: new Date().toISOString(),
    };
    onSubmit?.(payload);
    setSubmitted(payload);
    setForm(blankForm(defaults));
  };

  const current = submitted || latestCheckIn;
  const emergency = activeTriage.warningSigns.length > 0;

  return <div className={compact ? '' : 'space-y-5'}>
    {current && <Card variant="elevated"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-accent-cyan"><CheckCircle2 size={20} /></div><div className="min-w-0 flex-1"><p className="font-semibold text-white">{t('Latest symptom check-in')} · {current.id}</p><p className="mt-1 text-sm text-text-secondary">{t(current.assessmentStatus || 'Awaiting Staff Assessment')} · {t('Submitted')} {new Date(current.submissionTime || current.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p></div><Badge variant={current.warningSigns?.length ? 'error' : 'neutral'} size="sm">{current.warningSigns?.length ? t('Staff notification sent') : t('Awaiting staff review')}</Badge></CardContent></Card>}

    <Card>
      <CardHeader><CardTitle>Symptom Check-In</CardTitle><p className="mt-1 text-sm text-text-muted">{t('Share your symptoms with the care team for staff review.')}</p></CardHeader>
      <CardContent className="pt-0">
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-300/15 bg-amber-300/5 p-3 text-sm text-text-secondary"><Info size={17} className="mt-0.5 shrink-0 text-health-warning" /><p>{t('This form supports a demonstration workflow only. It does not diagnose, determine that you are safe, or replace qualified medical assessment.')}</p></div>
        {emergency && <div role="alert" className="mb-5 rounded-xl border border-red-400/40 bg-red-500/10 p-4 sm:p-5"><div className="flex items-start gap-3"><AlertTriangle size={22} className="mt-0.5 shrink-0 text-health-error" /><div><p className="font-semibold text-white">{t('Potential emergency warning signs detected.')}</p><p className="mt-1 text-sm leading-relaxed text-red-100">{t('Seek immediate assessment from qualified medical staff. Do not wait for a routine appointment.')}</p><p className="mt-3 text-xs text-red-100/80">{t('Selected warning symptoms:')} {activeTriage.warningSigns.map((symptom) => t(symptom)).join(', ')}. {t('If this is an emergency, alert nearby medical staff now.')}</p>{submitted ? <p className="mt-2 text-xs font-medium text-red-100/80">{t('Check-in submitted for')} {submitted.id} · {new Date(submitted.submissionTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · {t('Staff notification created.')}</p> : <p className="mt-2 text-xs font-medium text-red-100/80">{t('Staff notification will be created when this check-in is submitted.')}</p>}</div></div></div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Patient ID"><input required maxLength={24} value={form.patientId} onChange={(e) => update('patientId', e.target.value)} placeholder={t('e.g. CB-2048')} className="form-control" /></Field>
            <Field label="Patient name"><input required value={form.patientName} onChange={(e) => update('patientName', e.target.value)} placeholder={t('Full name')} className="form-control" /></Field>
            <Field label="Age"><input required type="number" min="0" max="120" value={form.age} onChange={(e) => update('age', e.target.value)} placeholder={t('Age')} className="form-control" /></Field>
            <Field label="Gender"><select required value={form.gender} onChange={(e) => update('gender', e.target.value)} className="form-control"><option value="">{t('Select')}</option><option value="Female">{t('Female')}</option><option value="Male">{t('Male')}</option><option value="Non-binary">{t('Non-binary')}</option><option value="Prefer not to say">{t('Prefer not to say')}</option></select></Field>
          </div>

          <fieldset><legend className="mb-2 text-sm font-medium text-white">{t('Main and additional symptoms')} <span className="text-health-error">*</span></legend><p className="mb-3 text-xs text-text-muted">{t('Select all that apply. Choosing symptoms does not provide a diagnosis.')}</p><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{SYMPTOM_OPTIONS.map((symptom) => <label key={symptom} className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${form.symptoms.includes(symptom) ? 'border-cyan-300/30 bg-cyan-300/5 text-white' : 'border-white/5 bg-[#07111F]/40 text-text-secondary hover:border-white/15'}`}><input type="checkbox" checked={form.symptoms.includes(symptom)} onChange={() => toggleSymptom(symptom)} className="h-4 w-4 accent-cyan-400" />{t(symptom)}</label>)}</div>{form.symptoms.includes('Other') && <div className="mt-3 max-w-lg"><Field label="Describe other symptom"><input required value={form.otherSymptom} onChange={(e) => update('otherSymptom', e.target.value)} className="form-control" placeholder={t('Describe the symptom')} /></Field></div>}</fieldset>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Symptom duration"><input required value={form.duration} onChange={(e) => update('duration', e.target.value)} placeholder={t('e.g. Since this morning')} className="form-control" /></Field>
            <Field label="Symptom severity"><select value={form.severity} onChange={(e) => update('severity', e.target.value)} className="form-control"><option value="Mild">{t('Mild')}</option><option value="Moderate">{t('Moderate')}</option><option value="Severe">{t('Severe')}</option></select></Field>
            <Field label="Arrival time"><input required type="datetime-local" value={form.arrivalTime} onChange={(e) => update('arrivalTime', e.target.value)} className="form-control" /></Field>
            <Field label="Existing conditions (optional)"><input value={form.conditions} onChange={(e) => update('conditions', e.target.value)} placeholder={t('Optional')} className="form-control" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Current medications (optional)"><input value={form.medications} onChange={(e) => update('medications', e.target.value)} placeholder={t('Optional')} className="form-control" /></Field><Field label="Additional details"><textarea value={form.details} onChange={(e) => update('details', e.target.value)} rows="3" placeholder={t('Add any details that may help staff understand your concern')} className="form-control resize-y" /></Field></div>

          <div className="rounded-xl border border-white/5 bg-[#07111F]/40 p-4"><div className="flex flex-wrap items-center gap-2"><span className="text-sm text-text-secondary">{t('Demonstration workflow label:')}</span><Badge variant={activeTriage.priority === 'Immediate Attention' ? 'error' : activeTriage.priority === 'Urgent Review' ? 'warning' : 'blue'} size="sm">{t(activeTriage.priority)}</Badge></div><p className="mt-2 text-xs leading-relaxed text-text-muted">{t('Prototype label only. It is not a validated medical triage classification. A qualified clinician must determine actual clinical priority. Do not delay emergency care while using this form.')}</p></div>
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!form.symptoms.length}>Submit symptom check-in</Button>
        </form>
      </CardContent>
    </Card>
    {submitted?.warningSigns?.length > 0 && <Card className="border-red-400/30"><CardContent className="flex items-start gap-3 p-4"><BellRing size={19} className="mt-0.5 text-health-error" /><div><p className="font-semibold text-white">{t('Staff notification created')}</p><p className="mt-1 text-sm text-text-secondary">{t('A demonstration notification for')} {submitted.id} {t('was added to the staff notification center at')} {new Date(submitted.submissionTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.</p></div><Clock3 size={16} className="ml-auto shrink-0 text-text-muted" /></CardContent></Card>}
  </div>;
}

function Field({ label, children }) {
  const { t } = useLanguage();
  return <label className="block space-y-1.5 text-sm text-text-secondary">{t(label)}{children}</label>;
}
