import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertOctagon, AlertTriangle, ArrowRight, BellRing,
  Check, CheckCircle2, Clock3, ClipboardCheck, HeartPulse,
  RefreshCw, Stethoscope, Users,
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useLanguage } from '../../i18n/LanguageContext';
import PatientPriorityDetails from './PatientPriorityDetails';
import {
  acknowledgeCriticalAlert, assignPriorityCase, createEmergencyEscalation,
  getPrioritySnapshot, updateCasePriority, updateDoctorAvailability,
  updateEmergencyEscalation, updatePriorityAssessment,
} from '../../services/api';

const priorityStyle = {
  Urgent: 'error',
  Moderate: 'warning',
  Routine: 'blue',
  'Needs Assessment': 'neutral',
};

const coordinatorRoles = ['Doctor', 'Hospital Staff', 'Hospital Administrator'];

function createFallbackSnapshot() {
  const now = Date.now();
  const minutesAgo = (minutes) => new Date(now - minutes * 60_000).toISOString();
  return {
    demoOnly: true,
    waitingThresholdMinutes: 30,
    cases: [
      {
        id: 'CB-2041', patientId: 'CB-2041', patientName: 'Meera Nair', age: 42,
        department: 'Emergency Desk', symptoms: ['Chest pain or discomfort', 'Dizziness'],
        priority: 'Urgent', priorityAssessedBy: 'Dr. Kavita Menon',
        priorityAssessedAt: minutesAgo(50), assessmentStatus: 'Awaiting clinician review',
        consultationStatus: 'Waiting', investigationStatus: 'Troponin I pending',
        assignedDoctorId: 'DR-108', expectedWaitMinutes: 20, waitSince: minutesAgo(52),
        waitingMinutes: 52, consultationWaitingMinutes: 52, investigationWaitingMinutes: 38,
        waitingExceeded: true, consultationWaitingExceeded: true, investigationWaitingExceeded: true,
        priorityHistory: [{ id: 'PH-2041-1', priority: 'Urgent', reason: 'Demo clinician reviewed initial case', staff: 'Dr. Kavita Menon', time: minutesAgo(50) }],
        history: [],
      },
      {
        id: 'CB-2038', patientId: 'CB-2038', patientName: 'Rohan Das', age: 35,
        department: 'General Medicine', symptoms: ['Difficulty breathing', 'High fever'],
        priority: 'Moderate', priorityAssessedBy: 'Dr. Kavita Menon',
        priorityAssessedAt: minutesAgo(37), assessmentStatus: 'Clinician reviewed',
        consultationStatus: 'Waiting', investigationStatus: 'No pending investigation',
        assignedDoctorId: 'DR-104', expectedWaitMinutes: 30, waitSince: minutesAgo(38),
        waitingMinutes: 38, consultationWaitingMinutes: 38, investigationWaitingMinutes: 0,
        waitingExceeded: true, consultationWaitingExceeded: true, investigationWaitingExceeded: false,
        priorityHistory: [], history: [],
      },
      {
        id: 'CB-2033', patientId: 'CB-2033', patientName: 'Ananya Rao', age: 29,
        department: 'General Medicine', symptoms: ['Abdominal pain', 'Vomiting'],
        priority: 'Routine', priorityAssessedBy: 'Dr. Nisha Rao',
        priorityAssessedAt: minutesAgo(23), assessmentStatus: 'Clinician reviewed',
        consultationStatus: 'Waiting', investigationStatus: 'Blood glucose scheduled',
        assignedDoctorId: 'DR-116', expectedWaitMinutes: 45, waitSince: minutesAgo(24),
        waitingMinutes: 24, consultationWaitingMinutes: 24, investigationWaitingMinutes: 8,
        waitingExceeded: false, priorityHistory: [], history: [],
      },
      {
        id: 'CB-2029', patientId: 'CB-2029', patientName: 'Arjun Iyer', age: 61,
        department: 'Neurology', symptoms: ['Severe headache'],
        priority: 'Needs Assessment', priorityAssessedBy: null, priorityAssessedAt: null,
        assessmentStatus: 'Awaiting clinician review', consultationStatus: 'Pending assignment',
        investigationStatus: 'MRI appointment pending', assignedDoctorId: null,
        expectedWaitMinutes: 30, waitSince: minutesAgo(16), waitingMinutes: 16,
        consultationWaitingMinutes: 16, investigationWaitingMinutes: 16,
        waitingExceeded: false, priorityHistory: [], history: [],
      },
    ],
    alerts: [
      {
        id: 'AL-2041-1', caseId: 'CB-2041', patientId: 'CB-2041', patientName: 'Meera Nair',
        kind: 'Clinician marked urgent',
        message: 'Urgent clinician-reviewed case is waiting beyond its expected time.',
        status: 'New', createdAt: minutesAgo(32), acknowledgedBy: null, acknowledgedAt: null,
      },
    ],
    escalations: [],
    doctors: [
      { id: 'DR-104', name: 'Dr. Kavita Menon', department: 'General Medicine', availability: 'Available', shift: '08:00–16:00', pendingConsultations: 2 },
      { id: 'DR-108', name: 'Dr. Arjun Shah', department: 'Emergency Medicine', availability: 'In consultation', shift: '08:00–16:00', pendingConsultations: 1 },
      { id: 'DR-116', name: 'Dr. Nisha Rao', department: 'General Medicine', availability: 'Available', shift: '10:00–18:00', pendingConsultations: 3 },
      { id: 'DR-121', name: 'Dr. Vivek Rao', department: 'Neurology', availability: 'Off duty', shift: '16:00–00:00', pendingConsultations: 0 },
    ],
  };
}

const stamp = () => new Date().toISOString();
const makeId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;
const assignedName = (doctors, id) => doctors.find((item) => item.id === id)?.name || 'Unassigned';
const elapsedWait = (item) => Math.max(item.waitingMinutes || 0, Math.floor((Date.now() - new Date(item.waitSince).getTime()) / 60_000));
const waitDisplay = (minutes) => (minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`);

function Kpi({ icon: Icon, title, value, tone = 'cyan', detail }) {
  const { t } = useLanguage();
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            tone === 'red'
              ? 'bg-red-400/10 text-health-error'
              : tone === 'amber'
              ? 'bg-amber-400/10 text-health-warning'
              : 'bg-cyan-300/10 text-accent-cyan'
          }`}
        >
          <Icon size={19} />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-text-muted">{t(title)}</p>
          <p className="mt-0.5 text-2xl font-bold text-white">{value}</p>
          {detail && <p className="mt-0.5 truncate text-[11px] text-text-muted">{t(detail)}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function Readout({ label, value, alert = false }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-xl border border-white/5 bg-[#07111F]/40 p-3">
      <p className="text-[10px] uppercase tracking-wide text-text-muted">{t(label)}</p>
      <p className={`mt-1 text-sm ${alert ? 'font-semibold text-health-error' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}

function PriorityQueue({ priority, cases, doctors, onOpen }) {
  const { t } = useLanguage();
  const entries = cases.filter((item) => item.priority === priority);
  const variants = {
    Urgent: 'border-red-400/25',
    Moderate: 'border-amber-400/20',
    Routine: 'border-cyan-300/15',
    'Needs Assessment': 'border-white/10',
  };
  return (
    <Card className={variants[priority] || 'border-white/5'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                priority === 'Urgent'
                  ? 'bg-health-error'
                  : priority === 'Moderate'
                  ? 'bg-health-warning'
                  : priority === 'Routine'
                  ? 'bg-accent-cyan'
                  : 'bg-text-muted'
              }`}
            />
            {t(priority)} {t('queue')}
          </CardTitle>
          <Badge variant={priorityStyle[priority]} size="sm">
            {entries.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {entries.length ? (
          entries.map((item) => (
            <button
              key={item.id}
              onClick={() => onOpen(item.id)}
              className="w-full rounded-xl border border-white/5 bg-[#07111F]/50 p-3 text-left transition-colors hover:border-cyan-300/20 hover:bg-[#07111F]/80 group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white group-hover:text-accent-cyan transition-colors">
                    {item.patientName}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-text-muted">
                    {item.patientId} · {t(item.department)}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-text-secondary font-mono">
                  {waitDisplay(elapsedWait(item))}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant={item.waitingExceeded ? 'error' : 'neutral'}
                  size="sm"
                  dot={item.waitingExceeded}
                >
                  {item.waitingExceeded ? t('Wait limit exceeded') : t(item.consultationStatus)}
                </Badge>
                <span className="text-[10px] text-text-muted">
                  {t('Doctor')}: {assignedName(doctors, item.assignedDoctorId)}
                </span>
              </div>
            </button>
          ))
        ) : (
          <p className="rounded-lg bg-[#07111F]/40 p-4 text-center text-xs text-text-muted">
            {t('No patients in this queue.')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function PatientPriorityDashboard({ role, search = '', onNotify }) {
  const { t, language } = useLanguage();
  const [snapshot, setSnapshot] = useState(createFallbackSnapshot);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [now, setNow] = useState(Date.now());

  const refresh = useCallback(async () => {
    try {
      const data = await getPrioritySnapshot(role);
      setSnapshot(data);
      setConnected(true);
      setError('');
      return true;
    } catch (failure) {
      setConnected(false);
      setError(failure.message);
      return false;
    }
  }, [role]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!connected) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [connected, refresh]);

  const cases = useMemo(() => {
    const term = search.trim().toLowerCase();
    return snapshot.cases.filter(
      (item) =>
        !term ||
        [
          item.id,
          item.patientId,
          item.patientName,
          item.department,
          item.priority,
          item.consultationStatus,
          item.investigationStatus,
        ]
          .join(' ')
          .toLowerCase()
          .includes(term)
    );
  }, [snapshot.cases, search, now]);

  const selected = snapshot.cases.find((item) => item.id === selectedId);
  const selectedWait = (item) => elapsedWait(item);
  const delayed = cases.filter((item) => selectedWait(item) > item.expectedWaitMinutes);
  const delayedConsultations = cases.filter(
    (item) => (item.consultationWaitingMinutes ?? selectedWait(item)) > item.expectedWaitMinutes
  ).length;
  const delayedInvestigations = cases.filter(
    (item) =>
      item.investigationStatus !== 'No pending investigation' &&
      (item.investigationWaitingMinutes ?? 0) > item.expectedWaitMinutes
  ).length;
  const activeAlerts = snapshot.alerts.filter((alert) => alert.status !== 'Acknowledged');
  const pendingConsultations = cases.filter((item) => item.consultationStatus !== 'Reviewed');
  const averageWait = cases.length
    ? Math.round(cases.reduce((sum, item) => sum + selectedWait(item), 0) / cases.length)
    : 0;

  const groupedWait = useMemo(
    () =>
      Object.values(
        cases.reduce((groups, item) => {
          groups[item.department] ||= { department: item.department, total: 0, overLimit: 0, wait: 0 };
          groups[item.department].total += 1;
          groups[item.department].wait += selectedWait(item);
          if (selectedWait(item) > item.expectedWaitMinutes) groups[item.department].overLimit += 1;
          return groups;
        }, {})
      ),
    [cases, now]
  );

  const runMutation = async (remote, local, successMessage) => {
    setBusy(true);
    setError('');
    try {
      if (connected) {
        await remote();
        await refresh();
      } else {
        setSnapshot((previous) => local(previous));
      }
      onNotify?.(successMessage);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  const changePriority = (id, priority, reason) =>
    runMutation(
      () =>
        updateCasePriority(
          id,
          { priority, reason, actorName: role === 'Doctor' ? 'Dr. Kavita Menon' : 'Demo Doctor' },
          role
        ),
      (previous) => {
        const item = previous.cases.find((entry) => entry.id === id);
        if (!item) return previous;
        const event = {
          id: makeId('PH'),
          previousPriority: item.priority,
          priority,
          reason,
          staff: 'Dr. Kavita Menon',
          time: stamp(),
        };
        const alerts =
          priority === 'Urgent'
            ? [
                {
                  id: makeId('AL'),
                  caseId: id,
                  patientId: item.patientId,
                  patientName: item.patientName,
                  kind: 'Urgent clinician priority',
                  message: 'A clinician marked this case urgent. Please coordinate prompt assessment.',
                  status: 'New',
                  createdAt: stamp(),
                },
                ...previous.alerts,
              ]
            : previous.alerts;
        return {
          ...previous,
          cases: previous.cases.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  priority,
                  priorityAssessedBy: event.staff,
                  priorityAssessedAt: event.time,
                  priorityHistory: [event, ...entry.priorityHistory],
                }
              : entry
          ),
          alerts,
        };
      },
      t('Priority assessment saved')
    );

  const changeAssignment = (id, doctorId) =>
    runMutation(
      () =>
        assignPriorityCase(
          id,
          { doctorId, actorName: role === 'Doctor' ? 'Dr. Kavita Menon' : 'Demo Coordinator' },
          role
        ),
      (previous) => ({
        ...previous,
        cases: previous.cases.map((entry) =>
          entry.id === id ? { ...entry, assignedDoctorId: doctorId } : entry
        ),
        doctors: previous.doctors.map((doctor) =>
          doctor.id === doctorId
            ? { ...doctor, pendingConsultations: doctor.pendingConsultations + 1 }
            : doctor
        ),
      }),
      t('Doctor assignment updated')
    );

  const changeDoctorStatus = (doctorId, newStatus) =>
    runMutation(
      () =>
        updateDoctorAvailability(
          doctorId,
          { availability: newStatus, actorName: role === 'Doctor' ? 'Dr. Kavita Menon' : 'Demo Coordinator' },
          role
        ),
      (previous) => ({
        ...previous,
        doctors: previous.doctors.map((doc) =>
          doc.id === doctorId ? { ...doc, availability: newStatus, lastUpdated: stamp() } : doc
        ),
      }),
      t('Doctor schedule and availability updated')
    );

  const changeAssessment = (id, status) =>
    runMutation(
      () => updatePriorityAssessment(id, { status, actorName: 'Dr. Kavita Menon' }, role),
      (previous) => ({
        ...previous,
        cases: previous.cases.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                assessmentStatus: status,
                consultationStatus:
                  status === 'Consultation started'
                    ? 'In consultation'
                    : status === 'Reviewed'
                    ? 'Reviewed'
                    : entry.consultationStatus,
              }
            : entry
        ),
      }),
      t('Assessment status updated')
    );

  const escalateCase = (id, body) =>
    runMutation(
      () =>
        createEmergencyEscalation(
          id,
          { ...body, actorName: role === 'Doctor' ? 'Dr. Kavita Menon' : 'Demo Coordinator' },
          role
        ),
      (previous) => {
        const item = previous.cases.find((entry) => entry.id === id);
        const escalation = {
          id: makeId('ES'),
          caseId: id,
          patientId: item.patientId,
          patientName: item.patientName,
          ...body,
          status: 'Pending acknowledgement',
          createdBy: role,
          createdAt: stamp(),
          history: [
            {
              id: makeId('EH'),
              status: 'Pending acknowledgement',
              actor: role,
              text: `Escalated to ${body.targetName}.`,
              time: stamp(),
            },
          ],
        };
        const alert = {
          id: makeId('AL'),
          caseId: id,
          patientId: item.patientId,
          patientName: item.patientName,
          kind: 'Emergency escalation',
          message: body.reason,
          status: 'New',
          createdAt: stamp(),
          escalationId: escalation.id,
        };
        return {
          ...previous,
          escalations: [escalation, ...previous.escalations],
          alerts: [alert, ...previous.alerts],
          cases: previous.cases.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  history: [
                    { id: makeId('EV'), type: 'escalation', text: `Escalated to ${body.targetName}.`, actor: role, time: stamp() },
                    ...(entry.history || []),
                  ],
                }
              : entry
          ),
        };
      },
      t('Emergency escalation created')
    );

  const acknowledgeAlert = (alertId) =>
    runMutation(
      () =>
        acknowledgeCriticalAlert(
          alertId,
          { actorName: role === 'Doctor' ? 'Dr. Kavita Menon' : 'Demo Coordinator' },
          role
        ),
      (previous) => ({
        ...previous,
        alerts: previous.alerts.map((alert) =>
          alert.id === alertId
            ? { ...alert, status: 'Acknowledged', acknowledgedBy: role, acknowledgedAt: stamp() }
            : alert
        ),
      }),
      t('Alert acknowledged')
    );

  const updateEscalation = (id, status) =>
    runMutation(
      () =>
        updateEmergencyEscalation(
          id,
          { status, actorName: role === 'Doctor' ? 'Dr. Kavita Menon' : 'Demo Coordinator' },
          role
        ),
      (previous) => ({
        ...previous,
        escalations: previous.escalations.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                status,
                history: [
                  { id: makeId('EH'), status, actor: role, text: `Escalation ${status.toLowerCase()}.`, time: stamp() },
                  ...entry.history,
                ],
              }
            : entry
        ),
      }),
      t('Escalation status updated')
    );

  if (selected) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">{t('Patient Priority Details')}</h2>
          <p className="text-sm text-text-secondary">{t('Coordination details and clinician-entered priority history.')}</p>
        </div>
        <PatientPriorityDetails
          key={selected.id}
          item={selected}
          snapshot={snapshot}
          role={role}
          busy={busy}
          onBack={() => setSelectedId(null)}
          onPriority={(priority, reason) => changePriority(selected.id, priority, reason)}
          onAssignment={(doctorId) => changeAssignment(selected.id, doctorId)}
          onAssessment={(status) => changeAssessment(selected.id, status)}
          onEscalate={(body) => escalateCase(selected.id, body)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5" aria-busy={loading}>
      {/* Top Banner */}
      <div className="flex flex-col gap-3 rounded-2xl border border-cyan-300/10 bg-gradient-to-r from-[#10233d] to-[#0b1728] p-4 sm:flex-row sm:items-center">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-accent-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)]">
          <HeartPulse size={22} />
        </span>
        <div className="flex-1">
          <p className="font-semibold text-white">{t('Patient Priority Dashboard')}</p>
          <p className="mt-1 text-xs text-text-secondary">
            {t('Priorities are reviewed and recorded by qualified clinical staff. The system only supports coordination.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={connected ? 'success' : 'warning'} size="sm" dot pulse>
            {connected ? t('Demo API connected') : t('Local demo data')}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setLoading(true);
              refresh().finally(() => setLoading(false));
            }}
            isLoading={loading}
          >
            <RefreshCw size={14} />
            {t('Refresh')}
          </Button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="rounded-xl border border-amber-300/15 bg-amber-300/5 p-3 text-xs leading-relaxed text-text-secondary">
        <strong className="text-white">{t('Safety notice:')}</strong>{' '}
        {t(
          'This interface uses illustrative demo records. It does not diagnose, recommend treatment, or replace a qualified clinician. For an emergency, alert hospital staff directly.'
        )}
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">
          <AlertTriangle size={16} />
          {t(error)}
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi
          icon={AlertOctagon}
          title="Urgent patients"
          value={cases.filter((item) => item.priority === 'Urgent').length}
          tone="red"
          detail="Clinician reviewed"
        />
        <Kpi
          icon={Activity}
          title="Moderate patients"
          value={cases.filter((item) => item.priority === 'Moderate').length}
          tone="amber"
        />
        <Kpi
          icon={Users}
          title="Routine patients"
          value={cases.filter((item) => item.priority === 'Routine').length}
        />
        <Kpi
          icon={ClipboardCheck}
          title="Needs assessment"
          value={cases.filter((item) => item.priority === 'Needs Assessment').length}
        />
        <Kpi
          icon={BellRing}
          title="Unacknowledged alerts"
          value={activeAlerts.length}
          tone={activeAlerts.length ? 'red' : 'cyan'}
        />
      </div>

      {/* Critical Alerts Panel & Waiting-Time Analytics Grid */}
      <div className="grid gap-5 xl:grid-cols-[1.4fr_.85fr]">
        {/* Critical Alerts Panel */}
        <Card className="border-red-400/15">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <BellRing size={18} className="text-health-error" />
                {t('Critical Alerts Panel')}
              </CardTitle>
              <Badge variant={activeAlerts.length ? 'error' : 'success'} size="sm">
                {activeAlerts.length} {t('active')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {snapshot.alerts.length ? (
              snapshot.alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-3.5 transition-all ${
                    alert.status === 'Acknowledged'
                      ? 'border-white/5 bg-[#07111F]/30 opacity-75'
                      : 'border-red-400/20 bg-red-400/5 shadow-[0_0_15px_rgba(239,68,68,0.08)]'
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                    <AlertTriangle
                      size={16}
                      className={`mt-0.5 shrink-0 ${
                        alert.status === 'Acknowledged' ? 'text-text-muted' : 'text-health-error'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {t(alert.kind)} · {alert.patientId} ({alert.patientName})
                        </p>
                        <Badge
                          variant={alert.status === 'Acknowledged' ? 'success' : 'error'}
                          size="sm"
                          dot
                        >
                          {t(alert.status)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">{alert.message}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-text-muted">
                        <span>
                          {t('Notify')}: {(alert.recipients || []).map((recipient) => t(recipient)).join(', ')}
                          {alert.targetName ? ` · ${alert.targetName}` : ''}
                        </span>
                        <span>•</span>
                        <span>{new Date(alert.createdAt).toLocaleString(language === 'kn' ? 'kn-IN' : 'en-IN')}</span>
                      </div>
                    </div>
                    {alert.status !== 'Acknowledged' && coordinatorRoles.includes(role) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => acknowledgeAlert(alert.id)}
                        disabled={busy}
                        leftIcon={Check}
                      >
                        {t('Acknowledge')}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-text-muted">{t('No critical alerts.')}</p>
            )}
          </CardContent>
        </Card>

        {/* Waiting-Time Analytics Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 size={18} className="text-accent-cyan" />
              {t('Waiting-Time Analytics')}
            </CardTitle>
            <p className="mt-1 text-xs text-text-muted">
              {t('Target limit')}: {snapshot.waitingThresholdMinutes} {t('minutes')} ·{' '}
              <span className={delayed.length ? 'text-health-error font-medium' : 'text-health-success'}>
                {delayed.length} {t('cases over limit')}
              </span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <Readout label="Average patient wait" value={waitDisplay(averageWait)} />
              <Readout
                label="Cases past expected time"
                value={delayed.length}
                alert={delayed.length > 0}
              />
              <Readout
                label="Consultation delays"
                value={delayedConsultations}
                alert={delayedConsultations > 0}
              />
              <Readout
                label="Investigation delays"
                value={delayedInvestigations}
                alert={delayedInvestigations > 0}
              />
            </div>

            {/* Department Breakdown */}
            <div className="space-y-3 pt-1">
              <p className="text-xs font-semibold uppercase text-text-muted tracking-wide">
                {t('Department Waiting Breakdown')}
              </p>
              {groupedWait.map((group) => {
                const avgDeptWait = Math.round(group.wait / group.total);
                const pct = Math.min(
                  100,
                  Math.max(10, Math.round((avgDeptWait / snapshot.waitingThresholdMinutes) * 100))
                );
                return (
                  <div key={group.department} className="space-y-1">
                    <div className="flex justify-between gap-2 text-xs">
                      <span className="truncate text-text-secondary">
                        {t(group.department)} ({group.total} {t('patients')})
                      </span>
                      <span className={group.overLimit ? 'font-semibold text-health-error' : 'text-text-muted'}>
                        {group.overLimit} {t('over limit')} · {waitDisplay(avgDeptWait)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#07111F]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          group.overLimit ? 'bg-health-error' : 'bg-gradient-to-r from-accent-cyan to-accent-blue'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Drilldown into Delayed Cases */}
            {delayed.length > 0 && (
              <div className="pt-2 border-t border-white/5 space-y-1.5">
                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                  {t('Immediate Attention Bottlenecks')}:
                </p>
                {delayed.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-red-400/15 bg-red-400/5 px-3 py-2 text-left text-xs hover:border-red-400/30 transition-colors"
                  >
                    <span className="truncate text-white font-medium">
                      {item.patientName} · {item.id}
                    </span>
                    <span className="shrink-0 text-health-error font-mono font-semibold">
                      {waitDisplay(selectedWait(item))}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Priority Queues & Doctor Availability Row */}
      <div className="grid gap-5 xl:grid-cols-[1.25fr_.85fr]">
        {/* Priority Queues */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-white">{t('Priority Queues')}</h3>
            <span className="text-xs text-text-muted">
              {pendingConsultations.length} {t('pending consultations')}
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {['Urgent', 'Moderate', 'Routine'].map((priority) => (
              <PriorityQueue
                key={priority}
                priority={priority}
                cases={cases}
                doctors={snapshot.doctors}
                onOpen={setSelectedId}
              />
            ))}
          </div>
          {cases.some((item) => item.priority === 'Needs Assessment') && (
            <div className="mt-4">
              <PriorityQueue
                priority="Needs Assessment"
                cases={cases}
                doctors={snapshot.doctors}
                onOpen={setSelectedId}
              />
            </div>
          )}
        </div>

        {/* Doctor Availability with Interactive Toggle Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Stethoscope size={18} className="text-accent-cyan" />
                {t('Doctor Availability & Schedules')}
              </CardTitle>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              {coordinatorRoles.includes(role)
                ? t('Click status to toggle or update active duty availability.')
                : t('Live schedules and active consultation workloads.')}
            </p>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {snapshot.doctors.map((doctor) => {
              const isAvailable = doctor.availability === 'Available';
              const isBusy = doctor.availability === 'In consultation';
              const isRounds = doctor.availability === 'On rounds';
              const isOff = doctor.availability === 'Off duty';
              const badgeVariant = isAvailable ? 'success' : isOff ? 'neutral' : 'warning';

              return (
                <div
                  key={doctor.id}
                  className="rounded-xl border border-white/5 bg-[#07111F]/40 p-3.5 transition-all hover:border-cyan-300/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{doctor.name}</p>
                      <p className="mt-0.5 text-[11px] text-text-muted">
                        {t(doctor.department)} · {doctor.shift}
                      </p>
                    </div>
                    {coordinatorRoles.includes(role) ? (
                      <select
                        value={doctor.availability}
                        onChange={(e) => changeDoctorStatus(doctor.id, e.target.value)}
                        disabled={busy}
                        aria-label={`Update availability for ${doctor.name}`}
                        className="rounded-lg border border-white/10 bg-[#101F33] px-2 py-1 text-xs font-medium text-white focus:border-cyan-300/30 outline-none cursor-pointer"
                      >
                        <option value="Available">{t('Available')}</option>
                        <option value="In consultation">{t('In consultation')}</option>
                        <option value="On rounds">{t('On rounds')}</option>
                        <option value="Off duty">{t('Off duty')}</option>
                      </select>
                    ) : (
                      <Badge variant={badgeVariant} size="sm" dot>
                        {t(doctor.availability)}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-text-secondary border-t border-white/5 pt-2">
                    <span>{t('Pending consultations')}</span>
                    <span className="font-semibold text-white">
                      {doctor.pendingConsultations} {t('cases')}
                    </span>
                  </div>
                </div>
              );
            })}
            <p className="text-[10px] leading-relaxed text-text-muted pt-1">
              {t('Doctor schedules and shifts are synchronized with hospital department operations.')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Consultations Awaiting Action & Emergency Escalation Timeline Row */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('Consultations and investigations awaiting action')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {cases
              .filter(
                (item) =>
                  item.consultationStatus !== 'Reviewed' ||
                  !['Complete', 'No pending investigation'].includes(item.investigationStatus)
              )
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className="flex w-full flex-col gap-2 rounded-xl border border-white/5 p-3 text-left hover:border-cyan-300/20 sm:flex-row sm:items-center sm:justify-between group"
                >
                  <span>
                    <span className="block text-sm font-medium text-white group-hover:text-accent-cyan transition-colors">
                      {item.patientName} · {item.patientId}
                    </span>
                    <span className="mt-1 block text-xs text-text-muted">
                      {t(item.consultationStatus)} · {t(item.investigationStatus)}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-xs text-text-secondary font-mono">
                    <Clock3 size={13} />
                    {waitDisplay(selectedWait(item))}
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              ))}
          </CardContent>
        </Card>

        {/* Emergency Escalation Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Emergency Escalation Timeline')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {snapshot.escalations.length ? (
              snapshot.escalations.slice(0, 5).map((entry) => (
                <div key={entry.id} className="rounded-xl border border-white/5 bg-[#07111F]/35 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {entry.patientName} · {entry.patientId}
                    </p>
                    <Badge
                      variant={
                        entry.status === 'Resolved'
                          ? 'success'
                          : entry.status === 'Pending acknowledgement'
                          ? 'error'
                          : 'warning'
                      }
                      size="sm"
                      dot
                    >
                      {t(entry.status)}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-text-secondary">
                    {t('To')}: <strong className="text-white">{entry.targetName}</strong> ({t(entry.targetRole)}) ·{' '}
                    {entry.reason}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                    {entry.status === 'Pending acknowledgement' && coordinatorRoles.includes(role) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateEscalation(entry.id, 'Acknowledged')}
                        disabled={busy}
                      >
                        {t('Acknowledge')}
                      </Button>
                    )}
                    {entry.status === 'Acknowledged' && coordinatorRoles.includes(role) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateEscalation(entry.id, 'Responded')}
                        disabled={busy}
                      >
                        {t('Record response')}
                      </Button>
                    )}
                    {entry.status === 'Responded' && coordinatorRoles.includes(role) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateEscalation(entry.id, 'Resolved')}
                        disabled={busy}
                        leftIcon={CheckCircle2}
                      >
                        {t('Resolve')}
                      </Button>
                    )}
                    <span className="text-[10px] text-text-muted ml-auto">
                      {new Date(entry.createdAt).toLocaleString(language === 'kn' ? 'kn-IN' : 'en-IN')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-text-muted">{t('No emergency escalations recorded.')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-[10px] leading-relaxed text-text-muted text-center pt-2">
        {t('Demo role access is for interface demonstration only and is not a substitute for secure authentication or production patient-data controls.')}
      </p>
    </div>
  );
}
