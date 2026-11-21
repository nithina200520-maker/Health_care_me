import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowDownUp, Clock3, Eye, ShieldAlert, Users } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import PatientDetailsModal from './PatientDetailsModal';
import { formatWait, getPriorityRank } from '../../utils/triageRules';
import { useLanguage } from '../../i18n/LanguageContext';

const priorityTone = (priority) => priority === 'Immediate Attention' ? 'error' : priority === 'Urgent Review' ? 'warning' : 'blue';
const getWaitMinutes = (patient) => Math.max(0, Math.floor((Date.now() - new Date(patient.arrivalTime).getTime()) / 60000));

export default function TriageQueue({ cases, search = '', onUpdateCase, onNotify }) {
  const { t, language } = useLanguage();
  const [sortBy, setSortBy] = useState('priority');
  const [selectedId, setSelectedId] = useState(null);
  const selected = cases.find((item) => item.id === selectedId) || null;
  const immediate = cases.filter((item) => item.demonstrationPriority === 'Immediate Attention');
  const emergencyWarnings = cases.filter((item) => item.warningSigns?.length > 0);
  const urgent = cases.filter((item) => item.demonstrationPriority === 'Urgent Review');
  const routine = cases.filter((item) => item.demonstrationPriority === 'Routine Review');
  const awaiting = cases.filter((item) => item.assessmentStatus === 'Awaiting Staff Assessment');

  const visibleCases = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const filtered = cases.filter((item) => [item.id, item.name, item.age, item.department, ...item.symptoms, ...item.warningSigns].join(' ').toLowerCase().includes(normalized));
    return filtered.sort((a, b) => {
      if (sortBy === 'waiting') return getWaitMinutes(b) - getWaitMinutes(a);
      if (sortBy === 'arrival') return new Date(a.arrivalTime) - new Date(b.arrivalTime);
      if (sortBy === 'department') return a.department.localeCompare(b.department) || getPriorityRank(a.demonstrationPriority) - getPriorityRank(b.demonstrationPriority);
      return Number(b.escalated) - Number(a.escalated) || getPriorityRank(a.demonstrationPriority) - getPriorityRank(b.demonstrationPriority) || getWaitMinutes(b) - getWaitMinutes(a);
    });
  }, [cases, search, sortBy]);

  const patch = (id, updates) => onUpdateCase(id, updates);
  const statusUpdate = (patient, status) => {
    patch(patient.id, { assessmentStatus: status });
    onNotify({ title: 'Assessment status updated', patientId: patient.id, severity: patient.demonstrationPriority });
  };
  const escalate = (patient) => {
    patch(patient.id, { escalated: true, assessmentStatus: 'Escalated' });
    onNotify({ title: 'Patient case escalated', patientId: patient.id, severity: 'Immediate Attention' });
  };
  const begin = (patient) => statusUpdate(patient, 'Assessment Started');
  const addNote = (patient, text, staff) => {
    patch(patient.id, { staffNotes: [...(patient.staffNotes || []), { id: `${Date.now()}`, text, staff, time: new Date().toISOString() }] });
  };
  const override = (patient, data) => {
    patch(patient.id, {
      demonstrationPriority: data.priority,
      overrides: [...(patient.overrides || []), { id: `${Date.now()}`, previousPriority: patient.demonstrationPriority, newPriority: data.priority, reason: data.reason, staff: data.staffName, time: new Date().toISOString() }],
    });
    onNotify({ title: 'Demonstration priority overridden', patientId: patient.id, severity: data.priority });
  };

  const metrics = [
    ['Total Patients Waiting', cases.filter((item) => item.assessmentStatus !== 'Reviewed').length, Users, 'blue'],
    ['Immediate Attention', immediate.length, AlertTriangle, 'error'],
    ['Urgent Review', urgent.length, ShieldAlert, 'warning'],
    ['Routine Review', routine.length, Clock3, 'blue'],
    ['Awaiting Staff Assessment', awaiting.length, Eye, 'neutral'],
  ];

  return <div className="space-y-5">
    <div className="rounded-xl border border-amber-300/15 bg-amber-300/5 p-3 text-xs leading-relaxed text-text-secondary"><strong className="text-white">{t('Demonstration workflow only:')}</strong> {t('these prototype labels are not validated medical triage classifications. A qualified clinician must determine actual priority. Never delay emergency care while using this tool.')}</div>

    {/* Kept outside the sortable/filterable table so warning banners remain visible. */}
    {emergencyWarnings.length > 0 && <section aria-label={t('Emergency warning banners')} className="space-y-3">{emergencyWarnings.map((item) => <div key={item.id} role="alert" className="rounded-xl border border-red-400/35 bg-red-500/10 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><AlertTriangle size={21} className="shrink-0 text-health-error" /><div className="min-w-0 flex-1"><p className="font-semibold text-white">{t('Potential emergency warning signs')} · {item.id} · {item.name}</p><p className="mt-1 text-sm leading-relaxed text-red-100">{t('Seek immediate assessment from qualified medical staff. Do not wait for a routine appointment.')}</p><p className="mt-1 text-xs text-red-100/75">{t('Reported')}: {item.warningSigns.map((x) => t(x)).join(', ')} {item.demonstrationPriority !== 'Immediate Attention' ? `· ${t('Current demonstration override')}: ${t(item.demonstrationPriority)}` : ''}</p><p className="mt-1 text-xs text-red-100/65">{t('Submitted')} {new Date(item.submissionTime || item.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p></div><Button size="sm" variant="danger" onClick={() => setSelectedId(item.id)}>{t('Review case')}</Button></div></div>)}</section>}

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{metrics.map(([title, value, Icon, tone]) => <Card key={title}><CardContent className="flex items-center gap-3 p-4"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone === 'error' ? 'bg-red-400/10 text-health-error' : tone === 'warning' ? 'bg-amber-400/10 text-health-warning' : tone === 'neutral' ? 'bg-white/5 text-text-muted' : 'bg-cyan-300/10 text-accent-cyan'}`}><Icon size={19} /></span><span><span className="block text-xl font-bold text-white">{value}</span><span className="text-xs text-text-muted">{t(title)}</span></span></CardContent></Card>)}</div>

    <Card>
      <CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Patient Urgency &amp; Triage Queue</CardTitle><p className="mt-1 text-sm text-text-muted">{t('Review submitted symptoms and coordinate staff assessment.')}</p></div><label className="flex items-center gap-2 text-xs text-text-secondary"><ArrowDownUp size={15} /><span>{t('Sort by')}</span><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-control w-auto min-w-36 py-2"><option value="priority">{t('Priority')}</option><option value="waiting">{t('Waiting time')}</option><option value="arrival">{t('Arrival time')}</option><option value="department">{t('Department')}</option></select></label></div></CardHeader>
      <CardContent className="pt-0"><div className="overflow-x-auto"><table className="w-full min-w-[1150px] text-left text-sm"><thead><tr className="border-b border-white/10 text-[11px] uppercase tracking-wide text-text-muted">{['Patient', 'Age', 'Arrival', 'Waiting', 'Main symptoms', 'Warning signs', 'Demo priority', 'Assessment status', ''].map((label) => <th key={label} className="px-3 py-3 font-medium">{t(label)}</th>)}</tr></thead><tbody>{visibleCases.map((patient) => <tr key={patient.id} className={`border-b border-white/5 last:border-0 ${patient.warningSigns.length ? 'bg-red-500/[0.035]' : 'hover:bg-white/[0.025]'}`}>
        <td className="px-3 py-3.5"><p className="font-mono text-xs text-accent-cyan">{patient.id}</p><p className="mt-1 font-medium text-white">{patient.name}</p></td>
        <td className="px-3 py-3.5 text-text-secondary">{patient.age}</td>
        <td className="px-3 py-3.5 text-xs text-text-secondary">{new Date(patient.arrivalTime).toLocaleTimeString(language === 'kn' ? 'kn-IN' : 'en-IN', { hour: 'numeric', minute: '2-digit' })}<p className="text-text-muted">{t(patient.department)}</p></td>
        <td className="px-3 py-3.5 text-text-secondary">{formatWait(getWaitMinutes(patient), language)}</td>
        <td className="max-w-48 px-3 py-3.5 text-text-secondary">{patient.symptoms.slice(0, 2).map((x) => t(x)).join(', ')}{patient.symptoms.length > 2 ? ` +${patient.symptoms.length - 2}` : ''}</td>
        <td className="px-3 py-3.5">{patient.warningSigns.length ? <span className="inline-flex items-center gap-1.5 text-xs font-medium text-health-error"><AlertTriangle size={14} />{patient.warningSigns.map((x) => t(x)).join(', ')}</span> : <span className="text-xs text-text-muted">{t('None selected')}</span>}</td>
        <td className="px-3 py-3.5"><Badge variant={priorityTone(patient.demonstrationPriority)} size="sm">{patient.demonstrationPriority}</Badge>{patient.escalated && <span className="ml-1"><Badge variant="error" size="sm">Escalated</Badge></span>}</td>
        <td className="px-3 py-3.5"><Badge variant={patient.assessmentStatus === 'Reviewed' ? 'success' : patient.assessmentStatus === 'Escalated' ? 'error' : 'neutral'} size="sm">{patient.assessmentStatus}</Badge></td>
        <td className="px-3 py-3.5"><Button size="sm" variant="ghost" onClick={() => setSelectedId(patient.id)}>Details</Button></td>
      </tr>)}</tbody></table>{visibleCases.length === 0 && <p className="py-8 text-center text-sm text-text-muted">No patients match this search.</p>}</div></CardContent>
    </Card>

    {selected && <PatientDetailsModal patient={selected} onClose={() => setSelectedId(null)} onBegin={() => begin(selected)} onEscalate={() => escalate(selected)} onUpdateStatus={(status) => statusUpdate(selected, status)} onAddNote={(text, staff) => addNote(selected, text, staff)} onOverride={(data) => override(selected, data)} />}
  </div>;
}
