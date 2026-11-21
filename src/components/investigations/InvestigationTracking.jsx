import React, { useMemo } from 'react';
import {
  AlertTriangle, CalendarClock, Check, Clock3,
  FileCheck2, FlaskConical, ScanLine, Stethoscope,
} from 'lucide-react';
import Badge from '../ui/Badge';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useLanguage } from '../../i18n/LanguageContext';

export const INVESTIGATION_STATUSES = [
  'Requested', 'Appointment Pending', 'Scheduled', 'Patient Arrived',
  'Sample Collected', 'Scan Pending', 'Processing', 'Report Pending',
  'Report Generated', 'Verification Pending', 'Verified', 'Sent to Doctor',
  'Doctor Reviewed', 'Cancelled',
];

const statusStyles = {
  Requested: 'neutral', 'Appointment Pending': 'warning', Scheduled: 'blue',
  'Patient Arrived': 'cyan', 'Sample Collected': 'cyan', 'Scan Pending': 'warning',
  Processing: 'cyan', 'Report Pending': 'warning', 'Report Generated': 'blue',
  'Verification Pending': 'warning', Verified: 'success', 'Sent to Doctor': 'blue',
  'Doctor Reviewed': 'success', Cancelled: 'error',
};

const finalStatuses = ['Doctor Reviewed', 'Cancelled'];
const canManageRecord = (role, record) => role === 'Doctor' || role === 'Hospital Staff' || role === 'Hospital Administrator'
  || (role === 'Laboratory Staff' && record.department === 'Laboratory')
  || (role === 'Radiology Staff' && record.department === 'Radiology');
const timelineSteps = [
  'Doctor Requested', 'Appointment Scheduled', 'Patient Arrived',
  'Sample Collected / Scan Performed', 'Investigation Processing',
  'Report Generated', 'Report Verified', 'Report Sent to Doctor', 'Doctor Reviewed',
];

export function createDemoInvestigations() {
  const now = Date.now();
  const ago = (hours) => new Date(now - hours * 60 * 60 * 1000).toISOString();
  const ahead = (hours) => new Date(now + hours * 60 * 60 * 1000).toISOString();
  return [
    { id: 'INV-5101', patientId: 'CB-2050', patientName: 'Ananya Rao', name: 'Complete Blood Count', department: 'Laboratory', doctor: 'Dr. Kavita Menon', requestedAt: ago(3), appointmentAt: ago(1), status: 'Processing', expectedAt: ahead(2), actualAt: '', priority: 'Routine', assignedDepartment: 'Hematology Lab', modality: 'Blood test' },
    { id: 'INV-5102', patientId: 'CB-1038', patientName: 'Rohan Das', name: 'Liver Function Test', department: 'Laboratory', doctor: 'Dr. Arjun Shah', requestedAt: ago(28), appointmentAt: ago(25), status: 'Report Pending', expectedAt: ago(5), actualAt: '', priority: 'Priority', assignedDepartment: 'Biochemistry Lab', modality: 'Blood test' },
    { id: 'INV-5103', patientId: 'CB-1031', patientName: 'Meera Nair', name: 'CT Chest', department: 'Radiology', doctor: 'Dr. Kavita Menon', requestedAt: ago(6), appointmentAt: ahead(3), status: 'Scheduled', expectedAt: ahead(8), actualAt: '', priority: 'Urgent', assignedDepartment: 'CT Imaging' },
    { id: 'INV-5104', patientId: 'CB-1024', patientName: 'Arjun Iyer', name: 'MRI Brain', department: 'Radiology', doctor: 'Dr. Nisha Rao', requestedAt: ago(20), appointmentAt: ago(14), status: 'Verification Pending', expectedAt: ago(2), actualAt: '', priority: 'Priority', assignedDepartment: 'MRI Imaging' },
    { id: 'INV-5105', patientId: 'CB-1042', patientName: 'Ananya Rao', name: 'Blood Glucose', department: 'Laboratory', doctor: 'Dr. Nisha Rao', requestedAt: ago(1), appointmentAt: ahead(1), status: 'Appointment Pending', expectedAt: ahead(5), actualAt: '', priority: 'Routine', assignedDepartment: 'Biochemistry Lab', modality: 'Blood test' },
    { id: 'INV-5106', patientId: 'CB-1031', patientName: 'Meera Nair', name: 'Troponin I', department: 'Laboratory', doctor: 'Dr. Kavita Menon', requestedAt: ago(4), appointmentAt: ago(2), status: 'Verified', expectedAt: ago(1), actualAt: ago(1.5), priority: 'Urgent', assignedDepartment: 'Cardiac Lab', modality: 'Blood test' },
    { id: 'INV-5107', patientId: 'CB-2050', patientName: 'Ananya Rao', name: 'Liver Function Test', department: 'Laboratory', doctor: 'Dr. Kavita Menon', requestedAt: ago(18), appointmentAt: ago(16), status: 'Report Pending', expectedAt: ago(3), actualAt: '', priority: 'Priority', assignedDepartment: 'Biochemistry Lab', modality: 'Blood test' },
  ];
}

function formatDate(value, language) {
  if (!value) return '—';
  return new Date(value).toLocaleString(language === 'kn' ? 'kn-IN' : 'en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function formatDuration(ms, language) {
  if (ms <= 0) return language === 'kn' ? '0 ನಿಮಿಷ' : '0 min';
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days) return `${days}d ${hours % 24}h`;
  if (hours) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

function statusIndex(status) {
  if (status === 'Cancelled') return -1;
  if (status === 'Requested') return 0;
  if (status === 'Appointment Pending' || status === 'Scheduled') return 1;
  if (status === 'Patient Arrived') return 2;
  if (status === 'Sample Collected' || status === 'Scan Pending') return 3;
  if (status === 'Processing') return 4;
  if (status === 'Report Pending' || status === 'Report Generated') return 5;
  if (status === 'Verification Pending' || status === 'Verified') return 6;
  if (status === 'Sent to Doctor') return 7;
  return 8;
}

function InvestigationCard({ record, canUpdate, onStatusChange }) {
  const { language, t } = useLanguage();
  const index = statusIndex(record.status);
  const now = Date.now();
  const isDelayed = !finalStatuses.includes(record.status) && new Date(record.expectedAt).getTime() < now;
  const waitingMs = Math.max(0, now - new Date(record.requestedAt).getTime());
  const delayMs = isDelayed ? now - new Date(record.expectedAt).getTime() : 0;
  const isLab = record.department === 'Laboratory';
  const DeptIcon = isLab ? FlaskConical : ScanLine;

  return <Card className={isDelayed ? 'border-amber-400/20' : ''}>
    <CardHeader className="pb-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-accent-cyan"><DeptIcon size={20} /></span>
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-semibold text-white">{t(record.name)}</h2><Badge variant={statusStyles[record.status] || 'neutral'} size="sm" dot>{t(record.status)}</Badge>{isDelayed && <Badge variant="error" size="sm" icon={AlertTriangle}>{t('Delayed')}</Badge>}</div>
            <p className="mt-1 text-xs text-text-muted"><span className="font-mono text-accent-cyan">{record.id}</span> <span className="mx-1">·</span>{t(record.patientName)} <span className="mx-1">·</span>{record.patientId}</p>
          </div>
        </div>
        {canUpdate ? <label className="flex items-center gap-2 text-xs text-text-muted"><span>{t('Update status')}</span><select value={record.status} onChange={(e) => onStatusChange(record.id, e.target.value)} className="h-9 max-w-[220px] rounded-lg border border-white/10 bg-[#0B1728] px-2 text-xs text-white outline-none focus:border-cyan-300/40">{INVESTIGATION_STATUSES.map((status) => <option key={status} value={status}>{t(status)}</option>)}</select></label> : <span className="text-xs text-text-muted">{t('Status updates are available to demo staff roles.')}</span>}
      </div>
    </CardHeader>
    <CardContent className="space-y-5 pt-0">
      {index < 0 ? <div className="rounded-xl border border-red-400/15 bg-red-400/5 p-3 text-sm text-health-error">{t('This investigation was cancelled.')}</div> : <div className="overflow-x-auto pb-1"><div className="flex min-w-[850px] items-start">{timelineSteps.map((step, i) => {
        const done = i < index || (i === index && ['Verified', 'Doctor Reviewed'].includes(record.status));
        const current = i === index && !done;
        return <React.Fragment key={step}><div className="flex w-[105px] shrink-0 flex-col items-center text-center"><span className={`grid h-7 w-7 place-items-center rounded-full border ${done ? 'border-emerald-400/40 bg-emerald-400/10 text-health-success' : current ? 'border-cyan-300/50 bg-cyan-300/10 text-accent-cyan' : 'border-white/10 bg-white/[0.03] text-text-muted'}`}>{done ? <Check size={14} /> : current ? <span className="h-2 w-2 rounded-full bg-accent-cyan" /> : <span className="text-[10px]">{i + 1}</span>}</span><span className={`mt-2 max-w-[95px] text-[10px] leading-snug ${done || current ? 'text-text-secondary' : 'text-text-muted'}`}>{t(step)}</span></div>{i < timelineSteps.length - 1 && <span className={`mt-3 h-px min-w-3 flex-1 ${i < index ? 'bg-emerald-400/40' : 'bg-white/10'}`} />}</React.Fragment>;
      })}</div></div>}
      <div className="grid gap-x-5 gap-y-4 border-t border-white/5 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <Info icon={Stethoscope} label="Requesting doctor" value={record.doctor} />
        <Info icon={CalendarClock} label="Request date and time" value={formatDate(record.requestedAt, language)} />
        <Info icon={CalendarClock} label="Appointment date and time" value={formatDate(record.appointmentAt, language)} />
        <Info icon={Clock3} label="Expected completion time" value={formatDate(record.expectedAt, language)} alert={isDelayed} />
        <Info icon={Clock3} label="Waiting duration" value={formatDuration(waitingMs, language)} />
        <Info icon={AlertTriangle} label="Delay duration" value={isDelayed ? formatDuration(delayMs, language) : t('On schedule')} alert={isDelayed} />
        <Info icon={FileCheck2} label="Actual completion time" value={record.actualAt ? formatDate(record.actualAt, language) : t('Not completed')} />
        <Info icon={DeptIcon} label="Assigned department" value={<>{t(record.assignedDepartment)} · {t(record.department)}</>} />
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-3 text-xs"><span className="text-text-muted">{t('Priority')}</span><Badge variant={record.priority === 'Urgent' ? 'error' : record.priority === 'Priority' ? 'warning' : 'neutral'} size="sm">{t(record.priority)}</Badge><span className="ml-auto text-text-muted">{t('Investigation ID')}: <span className="font-mono text-text-secondary">{record.id}</span></span></div>
    </CardContent>
  </Card>;
}

function Info({ icon: Icon, label, value, alert }) {
  const { t } = useLanguage();
  return <div className="flex min-w-0 gap-2"><Icon size={15} className={`mt-0.5 shrink-0 ${alert ? 'text-health-error' : 'text-accent-cyan'}`} /><div className="min-w-0"><p className="text-[10px] uppercase tracking-wide text-text-muted">{t(label)}</p><p className={`mt-1 break-words text-xs ${alert ? 'font-medium text-health-error' : 'text-text-secondary'}`}>{value}</p></div></div>;
}

export default function InvestigationTracking({ investigations, role, search, onStatusChange }) {
  const { t } = useLanguage();
  const visible = useMemo(() => {
    const scoped = role === 'Patient' ? investigations.filter((item) => item.patientId === 'CB-2050') : investigations;
    const term = search.trim().toLowerCase();
    return scoped.filter((item) => !term || [item.id, item.patientId, item.patientName, item.name, item.department, item.doctor, item.status, item.assignedDepartment].some((field) => field.toLowerCase().includes(term)));
  }, [investigations, role, search]);
  const delayedCount = visible.filter((item) => !finalStatuses.includes(item.status) && new Date(item.expectedAt).getTime() < Date.now()).length;
  const pendingReports = visible.filter((item) => ['Report Pending', 'Verification Pending'].includes(item.status)).length;

  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-3">
      <Summary icon={FlaskConical} label="Active investigations" value={visible.filter((item) => !finalStatuses.includes(item.status)).length} />
      <Summary icon={AlertTriangle} label="Past expected completion" value={delayedCount} alert={delayedCount > 0} />
      <Summary icon={FileCheck2} label="Reports needing follow-up" value={pendingReports} />
    </div>
    <Card variant="glass"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-accent-cyan"><Clock3 size={18} /></span><div><p className="text-sm font-medium text-white">{t('Investigation lifecycle')}</p><p className="mt-1 text-xs leading-relaxed text-text-secondary">{t('Track each request from the doctor order through scheduling, sample or scan, processing, verification, and doctor review.')}</p></div><Badge className="sm:ml-auto" variant="cyan" size="sm">{t('Mock data')}</Badge></CardContent></Card>
    {visible.length ? visible.map((item) => <InvestigationCard key={item.id} record={item} canUpdate={canManageRecord(role, item)} onStatusChange={onStatusChange} />) : <Card><CardContent className="py-10 text-center text-sm text-text-muted">{t('No investigations match this search.')}</CardContent></Card>}
  </div>;
}

function Summary({ icon: Icon, label, value, alert }) {
  const { t } = useLanguage();
  return <Card><CardContent className="flex items-center gap-3 p-4"><span className={`grid h-10 w-10 place-items-center rounded-xl ${alert ? 'bg-red-400/10 text-health-error' : 'bg-cyan-300/10 text-accent-cyan'}`}><Icon size={18} /></span><div><p className="text-xs text-text-muted">{t(label)}</p><p className={`mt-1 text-2xl font-semibold ${alert ? 'text-health-error' : 'text-white'}`}>{value}</p></div></CardContent></Card>;
}
