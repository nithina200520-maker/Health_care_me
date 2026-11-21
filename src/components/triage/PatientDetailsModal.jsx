import React, { useState } from 'react';
import { AlertTriangle, ClipboardCheck, FileText, MessageSquarePlus, ShieldAlert } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { DEMO_PRIORITIES, formatWait } from '../../utils/triageRules';
import { useLanguage } from '../../i18n/LanguageContext';

const priorityVariant = (priority) => priority === 'Immediate Attention' ? 'error' : priority === 'Urgent Review' ? 'warning' : 'blue';

export default function PatientDetailsModal({ patient, onClose, onBegin, onEscalate, onUpdateStatus, onAddNote, onOverride }) {
  const { t, language } = useLanguage();
  const [tool, setTool] = useState('');
  const [status, setStatus] = useState(patient.assessmentStatus);
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState(patient.demonstrationPriority);
  const [reason, setReason] = useState('');
  const [staffName, setStaffName] = useState('Demo Staff');
  const warning = patient.warningSigns?.length > 0;

  const actionAndClose = (action, ...args) => {
    action?.(...args);
    setTool('');
  };

  return <Modal isOpen={Boolean(patient)} onClose={onClose} title={`${t('Patient details')} · ${patient.id}`} description={t('Review submitted symptoms and workflow information. This screen does not provide medical advice or determine clinical priority.')} maxWidth="xl">
    <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
      {warning && <div role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 p-4"><div className="flex items-start gap-3"><AlertTriangle size={20} className="mt-0.5 shrink-0 text-health-error" /><div><p className="font-semibold text-white">{t('Potential emergency warning signs')}</p><p className="mt-1 text-sm leading-relaxed text-red-100">{t('Seek immediate assessment from qualified medical staff. Do not wait for a routine appointment.')}</p><p className="mt-2 text-xs text-red-100/80">{patient.warningSigns.map((item) => t(item)).join(', ')}</p></div></div></div>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
        ['Patient', patient.name], ['Age / Gender', `${patient.age} · ${t(patient.gender)}`], ['Arrival time', new Date(patient.arrivalTime).toLocaleString(language === 'kn' ? 'kn-IN' : 'en-IN')], ['Waiting duration', formatWait(patient.waitingMinutes, language)],
      ].map(([label, value]) => <div key={label} className="rounded-xl border border-white/5 bg-[#07111F]/50 p-3"><p className="text-xs text-text-muted">{t(label)}</p><p className="mt-1 text-sm font-medium text-white">{value}</p></div>)}</div>
      <div className="grid gap-5 md:grid-cols-2">
        <section><h3 className="mb-2 text-sm font-semibold text-white">{t('Reported symptoms')}</h3><div className="flex flex-wrap gap-2">{patient.symptoms.map((symptom) => <Badge key={symptom} variant={patient.warningSigns?.includes(symptom) ? 'error' : 'neutral'} size="sm">{t(symptom)}</Badge>)}</div><div className="mt-4 space-y-3 text-sm"><p><span className="text-text-muted">{t('Duration')}:</span> <span className="text-text-secondary">{t(patient.duration)}</span></p><p><span className="text-text-muted">{t('Severity reported')}:</span> <span className="text-text-secondary">{t(patient.severity)}</span></p><p><span className="text-text-muted">{t('Additional details')}:</span> <span className="text-text-secondary">{patient.details || t('None provided')}</span></p><p><span className="text-text-muted">{t('Existing conditions')}:</span> <span className="text-text-secondary">{patient.conditions || t('Not provided')}</span></p><p><span className="text-text-muted">{t('Current medications')}:</span> <span className="text-text-secondary">{patient.medications || t('Not provided')}</span></p></div></section>
        <section className="space-y-4"><div><h3 className="mb-2 text-sm font-semibold text-white">{t('Demonstration workflow')}</h3><div className="flex flex-wrap gap-2"><Badge variant={priorityVariant(patient.demonstrationPriority)} size="sm">{t(patient.demonstrationPriority)}</Badge><Badge variant={patient.assessmentStatus === 'Reviewed' ? 'success' : 'neutral'} size="sm">{t(patient.assessmentStatus)}</Badge>{patient.escalated && <Badge variant="error" size="sm">Escalated</Badge>}</div><p className="mt-2 text-xs text-text-muted">{t('Prototype labels only. A qualified clinician determines actual priority.')}</p></div>
          <div className="rounded-xl border border-white/5 bg-[#07111F]/50 p-3"><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><FileText size={15} /> {t('Staff notes')}</h3>{patient.staffNotes?.length ? <ul className="space-y-2">{patient.staffNotes.map((item) => <li key={item.id} className="border-t border-white/5 pt-2 text-sm"><p className="text-text-secondary">{item.text}</p><p className="mt-1 text-xs text-text-muted">{item.staff} · {new Date(item.time).toLocaleString(language === 'kn' ? 'kn-IN' : 'en-IN')}</p></li>)}</ul> : <p className="text-xs text-text-muted">{t('No staff notes yet.')}</p>}</div>
          {patient.overrides?.length > 0 && <div className="rounded-xl border border-amber-300/15 bg-amber-300/5 p-3"><h3 className="mb-2 text-sm font-semibold text-white">{t('Priority override history')}</h3>{patient.overrides.map((item) => <div key={item.id} className="border-t border-white/5 py-2 text-xs text-text-secondary"><p>{t(item.previousPriority)} → {t(item.newPriority)}</p><p className="mt-1 text-text-muted">{t('Reason for override')}: {item.reason} · {item.staff}</p></div>)}</div>}
        </section>
      </div>
      {tool === 'status' && <form onSubmit={(e) => { e.preventDefault(); actionAndClose(onUpdateStatus, status); }} className="rounded-xl border border-white/10 bg-[#07111F]/60 p-4"><label className="mb-3 block text-sm text-text-secondary">{t('Update assessment status')}<select value={status} onChange={(e) => setStatus(e.target.value)} className="form-control mt-2">{['Awaiting Staff Assessment', 'Assessment Started', 'Reviewed', 'Referred for Further Assessment'].map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label><Button size="sm" type="submit">Update Status</Button></form>}
      {tool === 'note' && <form onSubmit={(e) => { e.preventDefault(); actionAndClose(onAddNote, note, staffName); }} className="rounded-xl border border-white/10 bg-[#07111F]/60 p-4"><label className="mb-3 block text-sm text-text-secondary">{t('Staff name')}<input required value={staffName} onChange={(e) => setStaffName(e.target.value)} className="form-control mt-2" /></label><label className="mb-3 block text-sm text-text-secondary">{t('Staff note')}<textarea required rows="3" value={note} onChange={(e) => setNote(e.target.value)} className="form-control mt-2" placeholder={t('Enter a coordination note')} /></label><Button size="sm" type="submit">Add Note</Button></form>}
      {tool === 'override' && <form onSubmit={(e) => { e.preventDefault(); actionAndClose(onOverride, { priority, reason, staffName }); }} className="rounded-xl border border-amber-300/15 bg-amber-300/5 p-4"><p className="mb-3 text-sm font-semibold text-white">{t('Override demonstration priority')}</p><label className="mb-3 block text-sm text-text-secondary">{t('New priority')}<select required value={priority} onChange={(e) => setPriority(e.target.value)} className="form-control mt-2">{DEMO_PRIORITIES.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label><label className="mb-3 block text-sm text-text-secondary">{t('Reason for override')}<textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows="2" className="form-control mt-2" /></label><label className="mb-3 block text-sm text-text-secondary">{t('Staff name')}<input required value={staffName} onChange={(e) => setStaffName(e.target.value)} className="form-control mt-2" /></label><Button size="sm" type="submit" variant="secondary">Record Override</Button></form>}
      <div className="flex flex-wrap gap-2 border-t border-white/5 pt-4"><Button size="sm" onClick={() => actionAndClose(onBegin)} leftIcon={ClipboardCheck}>Begin Assessment</Button><Button size="sm" variant="danger" onClick={() => actionAndClose(onEscalate)} leftIcon={ShieldAlert}>Escalate</Button><Button size="sm" variant="secondary" onClick={() => setTool(tool === 'status' ? '' : 'status')}>Update Status</Button><Button size="sm" variant="secondary" onClick={() => setTool(tool === 'note' ? '' : 'note')} leftIcon={MessageSquarePlus}>Add Note</Button><Button size="sm" variant="ghost" onClick={() => setTool(tool === 'override' ? '' : 'override')}>Override Priority</Button></div>
    </div>
  </Modal>;
}
