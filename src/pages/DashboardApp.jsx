import React, { useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowRight, ArrowUpRight, Bell, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Clock3,
  FileClock, FileText, FlaskConical, HeartPulse, LayoutDashboard, Menu, MessageSquareText,
  PanelLeftClose, PanelLeftOpen, Search, ScanLine, Settings, ShieldAlert,
  Users, X,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatusIndicator from '../components/ui/StatusIndicator';
import { Card, CardContent, CardHeader, CardTitle as BaseCardTitle } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';
import SymptomCheckIn from '../components/triage/SymptomCheckIn';
import TriageQueue from '../components/triage/TriageQueue';
import { createDemoTriageCases } from '../utils/triageRules';
import InvestigationTracking, { createDemoInvestigations } from '../components/investigations/InvestigationTracking';
import PatientPriorityDashboard from '../components/priority/PatientPriorityDashboard';
import Sidebar from '../layouts/Sidebar';
import { createPriorityCase } from '../services/api';

function CardTitle({ children, ...props }) {
  const { t } = useLanguage();
  return <BaseCardTitle {...props}>{typeof children === 'string' ? t(children) : children}</BaseCardTitle>;
}

const ROLES = ['Patient', 'Doctor', 'Hospital Staff', 'Laboratory Staff', 'Radiology Staff', 'Hospital Administrator'];
const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, roles: ROLES },
  { label: 'Symptom Check-In', icon: HeartPulse, roles: ['Patient', 'Hospital Staff'] },
  { label: 'Patient Priority Dashboard', icon: ShieldAlert, roles: ['Patient', 'Doctor', 'Hospital Staff', 'Hospital Administrator'] },
  { label: 'Patient Urgency & Triage Queue', icon: ShieldAlert, roles: ['Doctor', 'Hospital Staff', 'Hospital Administrator'] },
  { label: 'Patient Management', icon: Users, roles: ['Doctor', 'Hospital Staff', 'Hospital Administrator'] },
  { label: 'Consultation Queue', icon: MessageSquareText, roles: ['Doctor', 'Hospital Staff', 'Hospital Administrator'] },
  { label: 'Laboratory Tests', icon: FlaskConical, roles: ['Doctor', 'Hospital Staff', 'Laboratory Staff', 'Hospital Administrator'] },
  { label: 'Radiology / CT / MRI', icon: ScanLine, roles: ['Doctor', 'Hospital Staff', 'Radiology Staff', 'Hospital Administrator'] },
  { label: 'Appointments', icon: CalendarDays, roles: ['Patient', 'Doctor', 'Hospital Staff', 'Hospital Administrator'] },
  { label: 'Report Tracking', icon: FileClock, roles: ['Patient', 'Doctor', 'Laboratory Staff', 'Radiology Staff', 'Hospital Administrator'] },
  { label: 'Investigation Tracking', icon: ClipboardList, roles: ROLES },
  { label: 'Patient Journey', icon: Activity, roles: ['Patient', 'Doctor', 'Hospital Staff', 'Hospital Administrator'] },
  { label: 'Notifications', icon: Bell, roles: ROLES },
  { label: 'Analytics', icon: Activity, roles: ['Doctor', 'Hospital Staff', 'Laboratory Staff', 'Radiology Staff', 'Hospital Administrator'] },
  { label: 'Settings', icon: Settings, roles: ROLES },
];

const journey = [
  ['Registration', 'Completed'], ['Consultation', 'Completed'], ['Diagnostic Tests', 'In Progress'],
  ['Reports', 'Delayed'], ['Treatment', 'Pending'], ['Follow-up', 'Pending'],
];
const tests = [
  { name: 'Complete Blood Count', dept: 'Laboratory', date: '21 Nov 2026', status: 'In Progress', eta: 'Today, 3:30 PM', delayed: false },
  { name: 'Liver Function Test', dept: 'Laboratory', date: '20 Nov 2026', status: 'Delayed', eta: 'Awaiting update', delayed: true },
  { name: 'Chest CT Scan', dept: 'Radiology', date: '19 Nov 2026', status: 'Scheduled', eta: '24 Nov, 10:00 AM', delayed: false },
];
const queue = [
  { id: 'CB-1042', name: 'Ananya Rao', wait: '18 min', reason: 'Follow-up consultation', status: 'Waiting', urgency: 'Routine' },
  { id: 'CB-1038', name: 'Rohan Das', wait: '42 min', reason: 'Review test results', status: 'Waiting', urgency: 'Priority' },
  { id: 'CB-1031', name: 'Meera Nair', wait: '1 hr 05 min', reason: 'Persistent chest discomfort', status: 'Waiting', urgency: 'Urgent' },
  { id: 'CB-1024', name: 'Arjun Iyer', wait: '1 hr 18 min', reason: 'Initial consultation', status: 'Checked in', urgency: 'Routine' },
];
const labQueue = [
  { id: 'LAB-2081', patient: 'Ananya Rao', test: 'Complete Blood Count', priority: 'Routine', received: '09:12 AM', status: 'Processing' },
  { id: 'LAB-2078', patient: 'Rohan Das', test: 'Liver Function Test', priority: 'Priority', received: '08:45 AM', status: 'Awaiting sample' },
  { id: 'LAB-2072', patient: 'Meera Nair', test: 'Troponin I', priority: 'Urgent', received: '08:30 AM', status: 'Processing' },
];
const radiologyQueue = [
  { id: 'RAD-441', patient: 'Meera Nair', scan: 'CT Chest', modality: 'CT', slot: '10:30 AM', status: 'Ready for scan' },
  { id: 'RAD-438', patient: 'Arjun Iyer', scan: 'MRI Brain', modality: 'MRI', slot: '11:15 AM', status: 'Waiting' },
  { id: 'RAD-432', patient: 'Rohan Das', scan: 'CT Abdomen', modality: 'CT', slot: '12:00 PM', status: 'Report pending' },
];

const metricSets = {
  Patient: [
    ['Journey progress', '3 of 6 steps', 'In progress', Activity], ['Pending tests', '3', '1 report delayed', FlaskConical],
    ['Next appointment', '24 Nov', 'Radiology · 10:00 AM', CalendarDays], ['Reports ready', '2', 'Latest: 20 Nov', FileText],
  ],
  Doctor: [['Patients today', '24', '+4 from yesterday', Users], ['Waiting for consultation', '8', '3 priority cases', Clock3], ['Urgent attention', '2', 'Review queue', ShieldAlert], ['Pending test reports', '6', '2 delayed', FileClock], ['Follow-up patients', '5', 'Today', CalendarDays]],
  'Hospital Staff': [['Patients checked in', '86', 'Today', Users], ['Consultation queue', '18', 'Across 4 departments', Clock3], ['Diagnostics pending', '32', '7 need follow-up', FlaskConical], ['Escalations', '3', 'Requires coordination', AlertTriangle]],
  'Laboratory Staff': [['Tests received', '142', 'Today', FlaskConical], ['In progress', '28', 'Across 6 panels', Clock3], ['Reports pending', '12', '3 past target', FileClock], ['Urgent samples', '4', 'Prioritize review', ShieldAlert]],
  'Radiology Staff': [['Scans scheduled', '38', 'Today', ScanLine], ['Patients waiting', '7', 'Across CT and MRI', Clock3], ['Reports pending', '9', '2 past target', FileClock], ['Available slots', '5', 'Next: 11:15 AM', CalendarDays]],
  'Hospital Administrator': [['Patients today', '1,284', '+8.2% this week', Users], ['Active queues', '12', 'Across departments', LayoutDashboard], ['Delayed workflows', '23', 'Needs attention', AlertTriangle], ['Reports within target', '91%', '+3% this month', FileCheckIcon]],
};

function FileCheckIcon(props) { return <CheckCircle2 {...props} />; }

const statusVariant = (status) => ({ Completed: 'success', 'In Progress': 'cyan', Delayed: 'error', Pending: 'neutral', Requested: 'neutral', 'Appointment Pending': 'warning', Scheduled: 'blue', 'Patient Arrived': 'cyan', 'Sample Collected': 'cyan', 'Scan Pending': 'warning', Processing: 'cyan', 'Report Pending': 'warning', 'Report Generated': 'blue', 'Verification Pending': 'warning', Verified: 'success', 'Sent to Doctor': 'blue', 'Doctor Reviewed': 'success', Cancelled: 'error', Waiting: 'warning', 'Ready for scan': 'success', 'Report pending': 'warning', 'Awaiting sample': 'neutral', 'Checked in': 'blue' }[status] || 'neutral');

function MetricCard({ title, value, note, icon: Icon }) {
  const { t } = useLanguage();
  return <Card variant="default"><CardContent className="p-4 sm:p-5"><div className="mb-4 flex items-start justify-between gap-2"><p className="text-sm text-text-secondary">{t(title)}</p><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-accent-cyan"><Icon size={18} /></span></div><p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{value}</p><p className="mt-1 text-xs text-text-muted">{t(note)}</p></CardContent></Card>;
}

function SectionTitle({ title, action, onAction }) {
  const { t } = useLanguage();
  return <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-white sm:text-lg">{t(title)}</h2>{action && <button onClick={onAction} className="inline-flex items-center gap-1 text-xs font-medium text-accent-cyan hover:text-white">{t(action)}<ArrowRight size={14} /></button>}</div>;
}

function DataTable({ columns, rows, searchable = '' }) {
  const { t } = useLanguage();
  return <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr className="border-b border-white/10 text-xs uppercase tracking-wide text-text-muted">{columns.map((c) => <th key={c.key} className="px-4 py-3 font-medium">{t(c.label)}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, i) => <tr key={row.id || i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.025]">{columns.map((c) => <td key={c.key} className="px-4 py-3.5 text-text-secondary">{c.render ? c.render(row[c.key], row) : typeof row[c.key] === 'string' ? t(row[c.key]) : row[c.key]}</td>)}</tr>) : <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-text-muted">{t('No results for search')}: {searchable}</td></tr>}</tbody></table></div>;
}

function PatientJourney({ investigations = [] }) {
  const { t } = useLanguage();
  const patientItems = investigations.filter((item) => item.patientId === 'CB-2050');
  const isDelayed = (item) => !['Doctor Reviewed', 'Cancelled'].includes(item.status) && new Date(item.expectedAt).getTime() < Date.now();
  const diagnosticsStatus = patientItems.length && patientItems.every((item) => item.status === 'Doctor Reviewed')
    ? 'Completed' : patientItems.some(isDelayed) ? 'Delayed' : 'In Progress';
  const reportStates = patientItems.map((item) => item.status);
  const reportsStatus = reportStates.some((status) => ['Report Pending', 'Verification Pending'].includes(status)) && patientItems.some(isDelayed)
    ? 'Delayed' : reportStates.some((status) => ['Report Generated', 'Verification Pending', 'Verified', 'Sent to Doctor', 'Doctor Reviewed'].includes(status))
      ? reportStates.every((status) => ['Verified', 'Sent to Doctor', 'Doctor Reviewed', 'Cancelled'].includes(status)) ? 'Completed' : 'In Progress'
      : 'Pending';
  const steps = journey.map(([step, status]) => step === 'Diagnostic Tests' ? [step, diagnosticsStatus] : step === 'Reports' ? [step, reportsStatus] : [step, status]);
  return <Card><CardHeader><CardTitle>My healthcare journey</CardTitle><p className="mt-1 text-sm text-text-muted">{t('Track progress across your care')}</p></CardHeader><CardContent className="pt-0"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{steps.map(([step, status], i) => <div key={step} className={`flex items-center gap-3 rounded-xl border p-3 ${status === 'Delayed' ? 'border-red-400/20 bg-red-400/5' : 'border-white/5 bg-[#07111F]/40'}`}><div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${status === 'Completed' ? 'bg-emerald-400/10 text-health-success' : status === 'In Progress' ? 'bg-cyan-300/10 text-accent-cyan' : status === 'Delayed' ? 'bg-red-400/10 text-health-error' : 'bg-white/5 text-text-muted'}`}>{status === 'Completed' ? <Check size={16} /> : <span className="text-xs font-semibold">{i + 1}</span>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-white">{t(step)}</p><Badge variant={statusVariant(status)} size="sm">{t(status)}</Badge></div></div>)}</div></CardContent></Card>;
}

function PatientDashboard({ search, onAction, latestCheckIn, onGoCheckIn, onGoPriority, investigations }) {
  const { t, language } = useLanguage();
  const patientItems = investigations.filter((item) => item.patientId === 'CB-2050');
  const patientTests = patientItems.map((item) => ({ name: item.name, dept: item.department, date: new Date(item.requestedAt).toLocaleDateString(language === 'kn' ? 'kn-IN' : 'en-IN'), status: item.status, eta: new Date(item.expectedAt).toLocaleString(language === 'kn' ? 'kn-IN' : 'en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }), delayed: !['Doctor Reviewed', 'Cancelled'].includes(item.status) && new Date(item.expectedAt).getTime() < Date.now() }));
  const filteredTests = patientTests.filter((x) => `${x.name} ${x.dept} ${x.status}`.toLowerCase().includes(search.toLowerCase()));
  const dashboardMetrics = metricSets.Patient.map((item) => item[0] === 'Pending tests' ? [item[0], String(patientItems.filter((x) => !['Doctor Reviewed', 'Cancelled'].includes(x.status)).length), `${patientItems.filter((x) => !['Doctor Reviewed', 'Cancelled'].includes(x.status) && new Date(x.expectedAt).getTime() < Date.now()).length} delayed`, item[3]] : item);
  return <>
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{dashboardMetrics.map(([title, value, note, icon]) => <MetricCard key={title} title={title} value={value} note={note} icon={icon} />)}</div>
    
    {/* Patient Priority & Live Queue Tracking Card */}
    <div className="mb-5">
      <Card variant="elevated" className="border-cyan-300/20 bg-gradient-to-r from-[#10233d]/90 to-[#0b1728]/90 shadow-[0_0_20px_rgba(0,212,255,0.08)]">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-accent-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                <ShieldAlert size={24} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-white text-base sm:text-lg">
                    {t('My Consultation Priority & Queue Status')}
                  </h3>
                  <Badge variant="blue" size="sm" dot>
                    {t('Routine Priority')}
                  </Badge>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {t('Assigned to')}: <strong className="text-white">Dr. Nisha Rao</strong> · {t('General Medicine Desk')} · {t('Queue Position')}: <span className="text-accent-cyan font-bold">#2</span>
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {t('Estimated wait')}: ~24 {t('minutes')} · {t('Clinician reviewed on')} 21 Nov 2026
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={onGoPriority} rightIcon={ArrowRight} className="shrink-0">
              {t('View priority details')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="mb-5"><PatientJourney investigations={investigations} /></div>
    <div className="grid gap-5 xl:grid-cols-[1.45fr_0.9fr]">
      <Card><CardHeader><SectionTitle title="My Pending Tests" action="View all" onAction={() => onAction('Opening all pending test details')} /></CardHeader><CardContent className="pt-0"><DataTable searchable={search} rows={filteredTests} columns={[
        { key: 'name', label: 'Test name', render: (_, r) => <div><p className="font-medium text-white">{r.name}</p><p className="text-xs text-text-muted">{r.dept}</p></div> },
        { key: 'date', label: 'Request date' }, { key: 'status', label: 'Status', render: (v) => <Badge variant={statusVariant(v)} size="sm">{v}</Badge> },
        { key: 'eta', label: 'Expected completion', render: (v, r) => <span className={r.delayed ? 'text-health-error' : ''}>{r.delayed && <AlertTriangle size={13} className="mr-1 inline" />}{v}</span> },
      ]} /></CardContent></Card>
      <div className="space-y-5"><Card variant="elevated"><CardContent className="p-5"><div className="mb-4 flex items-start justify-between"><div><p className="text-sm text-text-muted">{t('Next appointment')}</p><h3 className="mt-1 text-lg font-semibold text-white">{t('CT Scan')} · {t('Radiology')}</h3></div><CalendarDays className="text-accent-cyan" /></div><p className="text-sm text-text-secondary">{t('24 Nov 2026')} · 10:00 AM</p><p className="mt-1 text-sm text-text-secondary">Dr. Kavita Menon · {t('Imaging Centre, Floor 2')}</p><div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4"><Badge variant="blue" size="sm">Confirmed</Badge><Button size="sm" variant="ghost" onClick={() => onAction('Appointment details opened')}>Details</Button></div></CardContent></Card>
        <Card><CardHeader><SectionTitle title="Recent medical records" action="View all" onAction={() => onAction('Opening recent medical records')} /></CardHeader><CardContent className="space-y-3 pt-0">{[['Consultation summary', 'Dr. Menon · 20 Nov'], ['Blood panel report', 'Laboratory · 18 Nov'], ['Prescription note', 'Dr. Menon · 18 Nov']].map(([name, sub]) => <button key={name} onClick={() => onAction(`${name} preview opened`)} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-white/5"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#142842] text-accent-cyan"><FileText size={17} /></span><span className="min-w-0 flex-1"><span className="block text-sm text-white">{t(name)}</span><span className="text-xs text-text-muted">{t(sub)}</span></span><ChevronRight size={16} className="text-text-muted" /></button>)}</CardContent></Card></div>
    </div>
    <div className="mt-5"><Card><CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-accent-cyan"><HeartPulse size={21} /></span><div className="min-w-0 flex-1"><h2 className="font-semibold text-white">{t('Symptom Check-In')}</h2><p className="mt-1 text-sm text-text-secondary">{latestCheckIn ? `${t('Latest check-in')}: ${t(latestCheckIn.assessmentStatus)}. ${t('Staff review status is shown here.')}` : t('Share your symptoms with hospital staff for review.')}</p>{latestCheckIn && <p className="mt-1 text-xs text-text-muted">{latestCheckIn.id} · {t('Submitted')} {new Date(latestCheckIn.createdAt).toLocaleString(language === 'kn' ? 'kn-IN' : 'en-IN')}</p>}</div><Button variant="secondary" size="sm" onClick={onGoCheckIn}>{t('Open check-in')} <ArrowRight size={14} /></Button></CardContent></Card></div>
    <div className="mt-5"><Card><CardHeader><SectionTitle title="Notifications" action="See all" onAction={() => onAction('Opening notifications')} /></CardHeader><CardContent className="space-y-3 pt-0"><div className="flex gap-3 rounded-xl border border-amber-400/15 bg-amber-400/5 p-3"><AlertTriangle size={18} className="mt-0.5 shrink-0 text-health-warning" /><div><p className="text-sm font-medium text-white">{t('A report is taking longer than expected')}</p><p className="mt-1 text-xs text-text-muted">{t('Your Liver Function Test is awaiting an update. Request date: 20 Nov.')}</p></div><span className="ml-auto whitespace-nowrap text-xs text-text-muted">{t('1h ago')}</span></div><div className="flex gap-3 rounded-xl border border-white/5 p-3"><CalendarDays size={18} className="mt-0.5 shrink-0 text-accent-cyan" /><div><p className="text-sm font-medium text-white">{t('Upcoming radiology appointment')}</p><p className="mt-1 text-xs text-text-muted">{t('CT Scan scheduled for 24 Nov at 10:00 AM.')}</p></div><span className="ml-auto whitespace-nowrap text-xs text-text-muted">{t('Yesterday')}</span></div></CardContent></Card></div>
  </>;
}

function DoctorDashboard({ search, onAction }) {
  const { t } = useLanguage();
  const filtered = queue.filter((x) => `${x.id} ${x.name} ${x.reason}`.toLowerCase().includes(search.toLowerCase()));
  const urgencyColor = { Urgent: 'error', Priority: 'warning', Routine: 'neutral' };
  return <>
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{metricSets.Doctor.map(([title, value, note, icon]) => <MetricCard key={title} title={title} value={value} note={note} icon={icon} />)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.4fr_0.85fr]">
      <Card><CardHeader><SectionTitle title="Consultation waiting queue" action="Full queue" onAction={() => onAction('Full consultation queue opened')} /></CardHeader><CardContent className="pt-0"><DataTable searchable={search} rows={filtered} columns={[
        { key: 'id', label: 'Patient ID', render: (v) => <span className="font-mono text-xs text-accent-cyan">{v}</span> },
        { key: 'name', label: 'Patient', render: (v, r) => <div><p className="font-medium text-white">{v}</p><p className="text-xs text-text-muted">{t(r.reason)}</p></div> },
        { key: 'wait', label: 'Waiting' }, { key: 'urgency', label: 'Urgency', render: (v) => <Badge variant={urgencyColor[v]} size="sm">{v}</Badge> },
        { key: 'status', label: 'Status' }, { key: 'actions', label: '', render: (_, r) => <button onClick={() => onAction(`Consultation started for ${r.name}`)} aria-label={`Start consultation for ${r.name}`} className="rounded-lg bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-accent-cyan hover:bg-cyan-300/20">Start</button> },
      ]} /></CardContent></Card>
      <Card><CardHeader><SectionTitle title="Patient overview" /></CardHeader><CardContent className="pt-0"><div className="mb-4 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-cyan-400/25 to-blue-500/20 font-semibold text-accent-cyan">MN</div><div><h3 className="font-semibold text-white">Meera Nair</h3><p className="text-xs text-text-muted">CB-1031 · 42 {t('years')} · {t('Female')}</p></div><Badge variant="error" size="sm" className="ml-auto">Urgent</Badge></div><div className="space-y-3 text-sm"><div className="border-t border-white/5 pt-3"><p className="mb-1 text-xs uppercase text-text-muted">{t('Medical history summary')}</p><p className="text-text-secondary">{t('Hypertension noted · No known allergies on file')}</p></div><div><p className="mb-1 text-xs uppercase text-text-muted">{t('Current symptoms')}</p><p className="text-text-secondary">{t('Persistent chest discomfort, started this morning')}</p></div><div><p className="mb-1 text-xs uppercase text-text-muted">{t('Pending investigations')}</p><p className="text-text-secondary">Troponin I · {t('ECG review')}</p></div><div><p className="mb-1 text-xs uppercase text-text-muted">{t('Previous reports')}</p><button onClick={() => onAction('Previous report preview opened')} className="inline-flex items-center gap-2 text-accent-cyan hover:text-white"><FileText size={15} /> {t('Blood panel')} · 18 Nov <ArrowUpRight size={13} /></button></div></div><div className="mt-5 flex flex-wrap gap-2"><Button size="sm" onClick={() => onAction('Patient overview opened')}>View Patient</Button><Button size="sm" variant="secondary" onClick={() => onAction('Consultation started for Meera Nair')}>Start Consultation</Button></div></CardContent></Card>
    </div>
  </>;
}

function DepartmentDashboard({ role, search, onAction }) {
  const { t } = useLanguage();
  const isLab = role === 'Laboratory Staff';
  const isRadiology = role === 'Radiology Staff';
  const rows = isLab ? labQueue : isRadiology ? radiologyQueue : queue;
  const filtered = rows.filter((r) => Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase()));
  const columns = isLab ? [
    { key: 'id', label: 'Request ID' }, { key: 'patient', label: 'Patient' }, { key: 'test', label: 'Test' },
    { key: 'priority', label: 'Priority', render: (v) => <Badge variant={v === 'Urgent' ? 'error' : v === 'Priority' ? 'warning' : 'neutral'} size="sm">{v}</Badge> },
    { key: 'received', label: 'Received' }, { key: 'status', label: 'Status', render: (v) => <Badge variant={statusVariant(v)} size="sm">{v}</Badge> },
    { key: 'action', label: '', render: (_, r) => <button onClick={() => onAction(`${r.id} opened`)} className="text-xs text-accent-cyan hover:text-white">Open</button> },
  ] : isRadiology ? [
    { key: 'id', label: 'Request ID' }, { key: 'patient', label: 'Patient' }, { key: 'scan', label: 'Investigation' },
    { key: 'modality', label: 'Modality' }, { key: 'slot', label: 'Appointment' },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={statusVariant(v)} size="sm">{v}</Badge> },
    { key: 'action', label: '', render: (_, r) => <button onClick={() => onAction(`${r.id} opened`)} className="text-xs text-accent-cyan hover:text-white">Open</button> },
  ] : [
    { key: 'id', label: 'Patient ID', render: (v) => <span className="font-mono text-xs text-accent-cyan">{v}</span> },
    { key: 'name', label: 'Patient', render: (v, r) => <div><p className="font-medium text-white">{v}</p><p className="text-xs text-text-muted">{t(r.reason)}</p></div> },
    { key: 'wait', label: 'Waiting' },
    { key: 'urgency', label: 'Urgency', render: (v) => <Badge variant={v === 'Urgent' ? 'error' : v === 'Priority' ? 'warning' : 'neutral'} size="sm">{v}</Badge> },
    { key: 'status', label: 'Status' },
    { key: 'action', label: '', render: (_, r) => <button onClick={() => onAction(`Patient ${r.id} opened`)} className="text-xs text-accent-cyan hover:text-white">Open</button> },
  ];
  const title = isLab ? 'Laboratory work queue' : isRadiology ? 'Radiology schedule' : role === 'Doctor' ? 'Doctor dashboard' : role === 'Hospital Staff' ? 'Hospital operations' : 'Hospital overview';
  return <>
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{(metricSets[role] || metricSets['Hospital Staff']).map(([t, v, n, i]) => <MetricCard key={t} title={t} value={v} note={n} icon={i} />)}</div>
    {role === 'Hospital Administrator' && <div className="mb-5 grid gap-5 lg:grid-cols-2"><Card><CardHeader><CardTitle>Department activity</CardTitle></CardHeader><CardContent className="space-y-4 pt-0">{[['Consultation', 72, '24 pending'], ['Laboratory', 54, '28 in progress'], ['Radiology', 38, '7 waiting']].map(([d, n, s]) => <div key={d}><div className="mb-2 flex justify-between text-sm"><span className="text-white">{t(d)}</span><span className="text-text-muted">{t(s)}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#07111F]"><div className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-blue" style={{ width: `${n}%` }} /></div></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Workflow alerts</CardTitle></CardHeader><CardContent className="space-y-3 pt-0">{['3 laboratory reports past expected time', '2 radiology slots need confirmation', '1 urgent case awaiting department update'].map((x) => <div key={x} className="flex items-center gap-3 rounded-lg border border-amber-400/10 bg-amber-400/5 p-3 text-sm text-text-secondary"><AlertTriangle size={16} className="shrink-0 text-health-warning" />{t(x)}</div>)}</CardContent></Card></div>}
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.75fr]"><Card><CardHeader><SectionTitle title={title} action="Export view" onAction={() => onAction('Export is a demo preview only')} /></CardHeader><CardContent className="pt-0"><DataTable searchable={search} rows={filtered} columns={columns} /></CardContent></Card>
      <Card><CardHeader><SectionTitle title="Department updates" /></CardHeader><CardContent className="space-y-4 pt-0">{[[Clock3, 'Queue status refreshed', 'A new request entered the department queue · 6 min ago'], [CheckCircle2, 'Workflow completed', 'A report was marked ready for review · 18 min ago'], [AlertTriangle, 'Needs attention', 'One item is past its expected completion time · 32 min ago']].map(([Icon, title, detail]) => <div key={title} className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#142842] text-accent-cyan"><Icon size={17} /></span><div><p className="text-sm font-medium text-white">{t(title)}</p><p className="mt-1 text-xs leading-relaxed text-text-muted">{t(detail)}</p></div></div>)}</CardContent></Card></div>
  </>;
}

function GenericSection({ section, role, search, onAction, investigations, onStatusChange }) {
  const { t } = useLanguage();
  if (['Investigation Tracking', 'Report Tracking', 'Laboratory Tests', 'Radiology / CT / MRI'].includes(section)) {
    const scoped = section === 'Laboratory Tests' ? investigations.filter((item) => item.department === 'Laboratory') : section === 'Radiology / CT / MRI' ? investigations.filter((item) => item.department === 'Radiology') : investigations;
    return <InvestigationTracking investigations={scoped} role={role} search={search} onStatusChange={onStatusChange} />;
  }
  if (section === 'Patient Journey' && role === 'Patient') return <PatientJourney investigations={investigations} />;
  let title = section;
  let data = [];
  if (section === 'Consultation Queue') data = queue;
  else if (section === 'Laboratory Tests') data = labQueue;
  else if (section === 'Radiology / CT / MRI') data = radiologyQueue;
  else if (section === 'Patient Management') data = queue;
  else if (section === 'Appointments') data = [{ id: 'APT-924', patient: 'Ananya Rao', type: 'Follow-up consultation', dept: 'General Medicine', time: '09:30 AM', status: 'Confirmed' }, { id: 'APT-921', patient: 'Meera Nair', type: 'CT Scan', dept: 'Radiology', time: '10:30 AM', status: 'Confirmed' }, { id: 'APT-919', patient: 'Rohan Das', type: 'Review consultation', dept: 'Cardiology', time: '11:00 AM', status: 'Waiting' }];
  else if (section === 'Report Tracking') data = [...tests.map((t, i) => ({ id: `RPT-${318 + i}`, patient: ['Ananya Rao', 'Rohan Das', 'Meera Nair'][i], report: t.name, department: t.dept, updated: t.eta, status: t.status }))];
  else if (section === 'Notifications') data = [{ id: 'NTF-14', patient: 'Liver Function Test report delayed', type: 'Laboratory', status: 'Needs attention' }, { id: 'NTF-13', patient: 'CT Scan appointment confirmed', type: 'Radiology', status: 'Read' }, { id: 'NTF-12', patient: 'New patient added to the queue', type: 'Consultation', status: 'Read' }];
  else if (section === 'Analytics') return <DepartmentDashboard role={role} search={search} onAction={onAction} />;
  else if (section === 'Settings') return <Card><CardHeader><CardTitle>Demo preferences</CardTitle></CardHeader><CardContent className="max-w-xl space-y-4 pt-0"><p className="text-sm text-text-secondary">{t('These settings are local to this interface preview and are not saved to an account.')}</p>{[['Display role', role], ['Interface theme', 'Dark · CareBridge'], ['Notification previews', 'Enabled']].map(([k, v]) => <div key={k} className="flex items-center justify-between border-t border-white/5 py-3"><span className="text-sm text-text-secondary">{t(k)}</span><span className="text-sm text-white">{t(v)}</span></div>)}<Button size="sm" variant="secondary" onClick={() => onAction('Demo preferences are already up to date')}>Save demo preferences</Button></CardContent></Card>;
  else if (section === 'Patient Journey') return <Card><CardHeader><CardTitle>Patient journey overview</CardTitle></CardHeader><CardContent className="space-y-4 pt-0">{queue.slice(0, 3).map((p) => <div key={p.id} className="rounded-xl border border-white/5 p-4"><div className="mb-3 flex justify-between"><span className="font-medium text-white">{p.name} · {p.id}</span><Badge variant={statusVariant(p.urgency === 'Urgent' ? 'Delayed' : 'In Progress')} size="sm">{p.urgency}</Badge></div><div className="grid grid-cols-3 gap-2 text-xs text-text-muted sm:grid-cols-6">{journey.map(([s, st]) => <span key={s} className="rounded bg-[#07111F] p-2"><span className="block truncate text-text-secondary">{t(s)}</span><span>{t(st)}</span></span>)}</div></div>)}</CardContent></Card>;
  else data = queue;
  const filtered = data.filter((r) => Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase()));
  const keys = data[0] ? Object.keys(data[0]).filter((k) => k !== 'actions') : [];
  const columns = keys.map((k) => ({ key: k, label: k.replace(/([A-Z])/g, ' $1').replace(/^./, (x) => x.toUpperCase()), render: (v) => k.toLowerCase().includes('status') ? <Badge variant={statusVariant(v)} size="sm">{v}</Badge> : v }));
  return <Card><CardHeader><SectionTitle title={title} action={section === 'Notifications' ? 'Mark all read' : 'Refresh'} onAction={() => onAction(section === 'Notifications' ? 'Notifications marked as read in this preview' : `${section} refreshed`)} /></CardHeader><CardContent className="pt-0"><DataTable searchable={search} rows={filtered} columns={columns} /></CardContent></Card>;
}

function NotificationCenter({ notifications, onMarkRead, onMarkAllRead }) {
  const { language, t } = useLanguage();
  const tone = (severity) => severity === 'Immediate Attention' ? 'error' : severity === 'Urgent Review' ? 'warning' : 'blue';
  return <Card><CardHeader><div className="flex items-center justify-between gap-3"><div><CardTitle>Notification Center</CardTitle><p className="mt-1 text-sm text-text-muted">{t('Local demonstration notifications from this session.')}</p></div><Button size="sm" variant="ghost" onClick={onMarkAllRead}>Mark all read</Button></div></CardHeader><CardContent className="space-y-2 pt-0">{notifications.length ? notifications.map((item) => <button key={item.id} onClick={() => onMarkRead(item.id)} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${item.read ? 'border-white/5 bg-transparent' : 'border-cyan-300/10 bg-cyan-300/[0.035]'}`}><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.read ? 'bg-text-muted/40' : item.severity === 'Immediate Attention' ? 'bg-health-error' : item.severity === 'Urgent Review' ? 'bg-health-warning' : 'bg-accent-cyan'}`} /><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium text-white">{t(item.title)}</span><Badge variant={tone(item.severity)} size="sm">{item.severity}</Badge></span><span className="mt-1 block text-xs text-text-secondary">{t('Patient ID')}: {item.patientId}</span><span className="mt-1 block text-xs text-text-muted">{new Date(item.time).toLocaleString(language === 'kn' ? 'kn-IN' : 'en-IN')}</span></span><span className="text-xs text-text-muted">{t(item.read ? 'Read' : 'Unread')}</span></button>) : <p className="py-8 text-center text-sm text-text-muted">{t('No symptom check-in notifications in this session.')}</p>}</CardContent></Card>;
}

export default function DashboardApp({ onExitDemo }) {
  const [role, setRole] = useState('Patient');
  const [section, setSection] = useState('Dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [triageCases, setTriageCases] = useState(createDemoTriageCases);
  const [investigations, setInvestigations] = useState(createDemoInvestigations);
  const [demoNotifications, setDemoNotifications] = useState([]);
  const { addToast } = useToast();
  const { language, t } = useLanguage();
  const visibleNav = useMemo(() => NAV.filter((item) => item.roles.includes(role)), [role]);
  const notify = (message) => addToast({ title: t('Demo preview'), message: t(message), type: 'info' });
  const addDemoNotification = ({ title, patientId, severity }) => {
    setDemoNotifications((prev) => [{ id: `${Date.now()}-${Math.random()}`, title, patientId, severity, time: new Date().toISOString(), read: false }, ...prev]);
  };
  const canUpdateInvestigation = (item) => role === 'Doctor' || role === 'Hospital Staff' || role === 'Hospital Administrator'
    || (role === 'Laboratory Staff' && item.department === 'Laboratory')
    || (role === 'Radiology Staff' && item.department === 'Radiology');
  const handleSymptomSubmit = (patient) => {
    setTriageCases((prev) => [patient, ...prev.filter((item) => item.id !== patient.id)]);
    createPriorityCase({ id: patient.id, patientName: patient.name, age: patient.age, department: patient.department, symptoms: patient.symptoms, warningSigns: patient.warningSigns, waitSince: patient.arrivalTime }, role).catch((error) => console.warn('[CareBridge Phase 4] Demo API did not save this check-in:', error.message));
    addDemoNotification({ title: 'New patient symptom check-in submitted', patientId: patient.id, severity: patient.demonstrationPriority });
    if (patient.warningSigns.length) addDemoNotification({ title: 'Potential emergency warning signs selected', patientId: patient.id, severity: 'Immediate Attention' });
    addToast({ title: patient.warningSigns.length ? 'Staff notification created' : 'Check-in submitted', message: patient.warningSigns.length ? `Potential emergency warning signs for ${patient.id} were added to the staff notification center.` : `Check-in for ${patient.id} is awaiting staff assessment.`, type: patient.warningSigns.length ? 'warning' : 'success' });
  };
  const updateTriageCase = (id, changes) => setTriageCases((prev) => prev.map((item) => item.id === id ? { ...item, ...changes } : item));
  const updateInvestigationStatus = (id, status) => {
    const item = investigations.find((entry) => entry.id === id);
    if (!item || !canUpdateInvestigation(item)) return;
    setInvestigations((prev) => prev.map((entry) => entry.id === id ? { ...entry, status, actualAt: status === 'Doctor Reviewed' ? new Date().toISOString() : '' } : entry));
    addDemoNotification({ title: 'Investigation status updated', patientId: item.patientId, severity: status === 'Cancelled' ? 'Routine' : 'Workflow Update' });
    addToast({ title: t('Investigation updated'), message: `${item.id}: ${t(status)}`, type: status === 'Cancelled' ? 'warning' : 'success' });
  };
  const latestPatientCheckIn = triageCases.filter((item) => item.name === 'Ananya Rao').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  const markNotificationRead = (id) => setDemoNotifications((prev) => prev.map((item) => item.id === id ? { ...item, read: true } : item));
  const markAllNotificationsRead = () => setDemoNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  const staffNotify = (notification) => addDemoNotification(notification);
  const unreadNotificationCount = demoNotifications.filter((item) => !item.read).length;
  const changeRole = (next) => { setRole(next); setSection('Dashboard'); setRoleOpen(false); setSearch(''); };
  const activeSection = visibleNav.some((item) => item.label === section) ? section : 'Dashboard';
  const greeting = role === 'Patient' ? 'Good morning, Ananya' : `Good morning, ${role === 'Doctor' ? 'Dr. Kavita Menon' : role}`;
  const intro = role === 'Patient' ? 'Here is an update on your care journey.' : `A current overview for the ${role.toLowerCase()} team.`;
  const dashboardInvestigations = role === 'Laboratory Staff' ? investigations.filter((item) => item.department === 'Laboratory') : role === 'Radiology Staff' ? investigations.filter((item) => item.department === 'Radiology') : investigations;
  const delayedInvestigations = dashboardInvestigations.filter((item) => !['Doctor Reviewed', 'Cancelled'].includes(item.status) && new Date(item.expectedAt).getTime() < Date.now()).length;
  const reportsAwaitingFollowup = dashboardInvestigations.filter((item) => ['Report Pending', 'Verification Pending'].includes(item.status)).length;
  return <div className="min-h-screen bg-[#07111F] text-text-primary">
    <Sidebar
      navItems={visibleNav}
      activeSection={activeSection}
      onSelectSection={(label) => {
        setSection(label);
        setMobileOpen(false);
        setSearch('');
      }}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed(!collapsed)}
      mobileOpen={mobileOpen}
      onCloseMobile={() => setMobileOpen(false)}
      onExitDemo={onExitDemo}
      notificationCount={unreadNotificationCount}
    />
    <div className={`min-h-screen transition-[padding] duration-200 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]'}`}>
      <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-white/5 bg-[#07111F]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-text-secondary hover:bg-white/5 lg:hidden" aria-label="Open navigation"><Menu size={20} /></button>
        <button onClick={() => setCollapsed(!collapsed)} className="hidden rounded-lg p-2 text-text-secondary hover:bg-white/5 lg:block" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}</button>
        <div className="relative hidden max-w-md flex-1 sm:block"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Search this dashboard...')} className="h-10 w-full rounded-xl border border-white/5 bg-[#101F33] pl-10 pr-4 text-sm text-white outline-none placeholder:text-text-muted focus:border-cyan-300/30" /></div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3"><span className="hidden text-xs text-text-muted md:block">{t('Demo role')}</span><div className="relative"><button onClick={() => setRoleOpen(!roleOpen)} className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-[#101F33] px-3 text-xs font-medium text-white hover:border-cyan-300/25"><span className="grid h-6 w-6 place-items-center rounded-lg bg-cyan-300/10 text-accent-cyan"><Users size={13} /></span><span className="hidden sm:inline">{t(role)}</span><ChevronDown size={14} className="text-text-muted" /></button>{roleOpen && <div className="absolute right-0 top-12 z-50 w-60 rounded-xl border border-white/10 bg-[#101F33] p-2 shadow-card">{ROLES.map((r) => <button key={r} onClick={() => changeRole(r)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${r === role ? 'bg-cyan-300/10 text-accent-cyan' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}>{t(r)}{r === role && <Check size={15} />}</button>)}</div>}</div><LanguageSwitcher compact />
          <div className="relative"><button onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label={t('Notifications')} className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/5 text-text-secondary hover:bg-white/5 hover:text-white"><Bell size={18} />{unreadNotificationCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-health-warning ring-2 ring-[#07111F]" />}</button>{notificationsOpen && <div className="absolute right-0 top-12 z-50 w-[min(340px,calc(100vw-2rem))] rounded-xl border border-white/10 bg-[#101F33] p-4 shadow-card"><div className="mb-3 flex items-center justify-between"><p className="font-semibold text-white">{t('Notifications')}</p><button onClick={() => setNotificationsOpen(false)} className="text-text-muted hover:text-white" aria-label={t('Close')}><X size={16} /></button></div>{demoNotifications.length ? <div className="space-y-2">{demoNotifications.slice(0, 4).map((item) => <button key={item.id} onClick={() => { markNotificationRead(item.id); setSection('Notifications'); setNotificationsOpen(false); }} className="block w-full rounded-lg border-t border-white/5 py-2 text-left"><span className="block text-sm text-white">{t(item.title)}</span><span className="mt-1 block text-xs text-text-muted">{item.patientId} · {new Date(item.time).toLocaleTimeString(language === 'kn' ? 'kn-IN' : 'en-IN', { hour: 'numeric', minute: '2-digit' })}</span></button>)}</div> : <p className="py-3 text-sm text-text-secondary">{t('No new symptom check-in notifications.')}</p>}<button onClick={() => { setSection('Notifications'); setNotificationsOpen(false); }} className="mt-2 text-xs font-medium text-accent-cyan hover:text-white">{t('Open notification center')}</button></div>}</div>
          <button onClick={() => notify('Demo profile only; account controls are not active.')} className="flex items-center gap-2 rounded-xl p-1.5 pr-2 hover:bg-white/5" title="Demo profile"><span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-cyan-400/25 to-blue-500/25 text-xs font-semibold text-accent-cyan">{role === 'Patient' ? 'AR' : role === 'Doctor' ? 'KM' : 'CB'}</span><span className="hidden text-left md:block"><span className="block text-xs font-medium text-white">{role === 'Patient' ? 'Ananya Rao' : role === 'Doctor' ? 'Dr. Kavita Menon' : 'Demo User'}</span><span className="block text-[10px] text-text-muted">{role}</span></span></button>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2"><Badge variant="cyan" size="sm">{t(role)} · {t('workspace')}</Badge><span className="text-xs text-text-muted">{new Date(2026, 10, 21).toLocaleDateString(language === 'kn' ? 'kn-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div><h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{activeSection === 'Dashboard' ? t(greeting) : t(activeSection)}</h1><p className="mt-1 text-sm text-text-secondary">{t(intro)}</p></div><div className="flex gap-2"><Button variant="secondary" size="sm" onClick={onExitDemo}><ChevronLeft size={15} /> {t('Back to home')}</Button>{role !== 'Patient' && <Button size="sm" onClick={() => notify('This action is a visual demo only.')}>{t('Quick action')} <ArrowRight size={14} /></Button>}</div></div>
        <div className="mb-4 sm:hidden"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Search this dashboard...')} className="h-10 w-full rounded-xl border border-white/5 bg-[#101F33] pl-10 pr-4 text-sm text-white outline-none placeholder:text-text-muted focus:border-cyan-300/30" /></div></div>
        {activeSection === 'Dashboard' && role !== 'Patient' && <Card className="mb-5 border-cyan-300/10"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-accent-cyan"><ClipboardList size={18} /></span><div className="flex-1"><p className="text-sm font-semibold text-white">{t('Investigation coordination')}</p><p className="mt-1 text-xs text-text-secondary">{delayedInvestigations} {t('past expected completion')} <span className="mx-1">·</span> {reportsAwaitingFollowup} {t('reports needing follow-up')}</p></div><Button size="sm" variant="secondary" onClick={() => setSection('Investigation Tracking')}>{t('Open investigation tracking')} <ArrowRight size={14} /></Button></CardContent></Card>}
        {activeSection === 'Dashboard' && role === 'Patient' ? <PatientDashboard search={search} onAction={notify} latestCheckIn={latestPatientCheckIn} onGoCheckIn={() => setSection('Symptom Check-In')} onGoPriority={() => setSection('Patient Priority Dashboard')} investigations={investigations} />
          : activeSection === 'Dashboard' && role === 'Doctor' ? <DoctorDashboard search={search} onAction={notify} />
            : activeSection === 'Dashboard' ? <DepartmentDashboard role={role} search={search} onAction={notify} />
              : activeSection === 'Patient Priority Dashboard' ? <PatientPriorityDashboard role={role} search={search} onNotify={notify} />
              : activeSection === 'Patient Urgency & Triage Queue' ? <TriageQueue cases={triageCases} search={search} onUpdateCase={updateTriageCase} onNotify={staffNotify} />
                : activeSection === 'Symptom Check-In' ? <SymptomCheckIn onSubmit={handleSymptomSubmit} latestCheckIn={role === 'Patient' ? latestPatientCheckIn : null} defaults={role === 'Patient' ? { patientId: 'CB-2050', patientName: 'Ananya Rao', age: 29, gender: 'Female' } : {}} />
                  : activeSection === 'Notifications' ? <NotificationCenter notifications={demoNotifications} onMarkRead={markNotificationRead} onMarkAllRead={markAllNotificationsRead} />
                    : <GenericSection section={activeSection} role={role} search={search} onAction={notify} investigations={investigations} onStatusChange={updateInvestigationStatus} />}
        <p className="mt-8 border-t border-white/5 pt-4 text-center text-xs text-text-muted">CareBridge AI Phase 4 UI demo · {t('Sample data only')} · {t('Not for clinical use')}</p>
      </main>
    </div>
  </div>;
}
