import React, { useState } from 'react';
import {
  ArrowLeft, BellRing, CheckCircle2, ClipboardCheck, Clock3,
  HeartPulse, History, ShieldAlert, Stethoscope, UserRound, AlertTriangle
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Modal from '../ui/Modal';
import { useLanguage } from '../../i18n/LanguageContext';

const priorityStyle = {
  Urgent: 'error',
  Moderate: 'warning',
  Routine: 'blue',
  'Needs Assessment': 'neutral',
};

const coordinatorRoles = ['Doctor', 'Hospital Staff', 'Hospital Administrator'];

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

function HistoryList({ title, events }) {
  const { t, language } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History size={17} className="text-accent-cyan" />
          {t(title)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {events.length ? (
          events.map((event) => (
            <div key={event.id} className="flex gap-3 border-l border-cyan-300/20 pl-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-cyan" />
              <div>
                <p className="text-sm text-text-secondary">{t(event.text)}</p>
                <p className="mt-1 text-[10px] text-text-muted">
                  {t(event.actor || event.staff || '')} ·{' '}
                  {new Date(event.time).toLocaleString(language === 'kn' ? 'kn-IN' : 'en-IN')}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-text-muted">{t('No activity has been recorded.')}</p>
        )}
      </CardContent>
    </Card>
  );
}

const waitDisplay = (minutes) =>
  minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;

export default function PatientPriorityDetails({
  item,
  snapshot,
  role,
  busy,
  onBack,
  onPriority,
  onAssignment,
  onAssessment,
  onEscalate,
}) {
  const { t, language } = useLanguage();
  const [priority, setPriority] = useState(
    item.priority === 'Needs Assessment' ? 'Moderate' : item.priority
  );
  const [reason, setReason] = useState('');
  const [doctorId, setDoctorId] = useState(item.assignedDoctorId || '');
  const [assessment, setAssessment] = useState(item.assessmentStatus);
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [targetRole, setTargetRole] = useState('Doctor');
  const [targetName, setTargetName] = useState(
    snapshot.doctors.find((d) => d.availability !== 'Off duty')?.name || 'Dr. Kavita Menon'
  );
  const [escalationReason, setEscalationReason] = useState('');

  const elapsedWait = Math.max(
    item.waitingMinutes || 0,
    Math.floor((Date.now() - new Date(item.waitSince).getTime()) / 60_000)
  );

  const history = [
    ...(item.history || []),
    ...(item.priorityHistory || []).map((entry) => ({
      ...entry,
      type: 'priority',
      text: entry.reason || `Priority set to ${entry.priority}`,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  const relatedEscalations = snapshot.escalations.filter((entry) => entry.caseId === item.id);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} /> {t('Back to priority dashboard')}
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="sm">
            {t('Case ID')}: {item.id}
          </Badge>
          <Badge variant={priorityStyle[item.priority]} size="md" dot pulse={item.priority === 'Urgent'}>
            {t(item.priority)}
          </Badge>
        </div>
      </div>

      {/* Patient Profile Card */}
      <Card variant="elevated">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-accent-cyan shadow-[0_0_20px_rgba(0,212,255,0.15)]">
            <UserRound size={26} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-white">{item.patientName}</h2>
              {item.waitingExceeded && (
                <Badge variant="error" size="sm" dot>
                  {t('Wait threshold exceeded')}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              {item.patientId} · {item.age ? `${item.age} ${t('years')}` : t('Age not provided')} ·{' '}
              {t(item.department)}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {t('Wait duration')}: <span className={item.waitingExceeded ? 'font-semibold text-health-error' : 'text-white'}>{waitDisplay(elapsedWait)}</span> ·{' '}
              {t('Target limit')}: {item.expectedWaitMinutes} {t('minutes')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:self-center">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setEscalationOpen(true)}
              leftIcon={BellRing}
              disabled={!coordinatorRoles.includes(role)}
            >
              {t('Emergency Escalation')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Priority Assessment & Consultation/Investigation Management */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Clinician Priority Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Clinician Priority Assessment')}</CardTitle>
            <p className="mt-1 text-sm text-text-muted">
              {t('Priority decisions are entered by a qualified clinician; no automated classification is performed.')}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {/* Symptoms list */}
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase text-text-muted tracking-wide">
                {t('Presenting symptoms')}
              </p>
              <div className="flex flex-wrap gap-2">
                {item.symptoms.map((symptom, index) => (
                  <Badge key={`${symptom}-${index}`} variant="neutral" size="sm">
                    {t(symptom)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Assessment info */}
            <div className="rounded-xl border border-white/5 bg-[#07111F]/45 p-3 text-xs text-text-secondary space-y-1">
              <p>
                <span className="text-text-muted">{t('Assessed by')}:</span>{' '}
                <strong className="text-white">{item.priorityAssessedBy || t('Not yet assessed')}</strong>
              </p>
              <p>
                <span className="text-text-muted">{t('Assessment timestamp')}:</span>{' '}
                {item.priorityAssessedAt
                  ? new Date(item.priorityAssessedAt).toLocaleString(language === 'kn' ? 'kn-IN' : 'en-IN')
                  : '—'}
              </p>
            </div>

            {/* Doctor assessment form */}
            {role === 'Doctor' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onPriority(priority, reason);
                  setReason('');
                }}
                className="space-y-3 pt-2 border-t border-white/5"
              >
                <label className="block text-xs font-medium text-text-secondary">
                  {t('Set clinician priority')}
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="form-control mt-1.5 w-full rounded-xl border border-white/10 bg-[#0B1728] p-2.5 text-sm text-white"
                  >
                    {['Urgent', 'Moderate', 'Routine'].map((level) => (
                      <option key={level} value={level}>
                        {t(level)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-medium text-text-secondary">
                  {t('Clinical review justification')}
                  <textarea
                    required
                    maxLength={500}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="form-control mt-1.5 w-full rounded-xl border border-white/10 bg-[#0B1728] p-2.5 text-sm text-white"
                    placeholder={t('Document the clinical rationale for priority level')}
                  />
                </label>
                <Button size="sm" type="submit" isLoading={busy} leftIcon={ClipboardCheck}>
                  {t('Save clinician assessment')}
                </Button>
              </form>
            ) : (
              <div className="rounded-xl border border-amber-300/15 bg-amber-300/5 p-3 text-xs text-text-secondary flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0 text-health-warning" />
                <span>{t('Only the Doctor demo role can assign or alter clinical priority.')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consultation and Investigation Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Consultation and Investigation Status')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              <Readout label="Consultation status" value={t(item.consultationStatus)} />
              <Readout label="Investigation status" value={t(item.investigationStatus)} />
              <Readout
                label="Consultation waiting"
                value={waitDisplay(item.consultationWaitingMinutes ?? elapsedWait)}
                alert={item.consultationWaitingExceeded}
              />
              <Readout
                label="Investigation waiting"
                value={
                  item.investigationStatus === 'No pending investigation'
                    ? t('No pending investigation')
                    : waitDisplay(item.investigationWaitingMinutes ?? elapsedWait)
                }
                alert={item.investigationWaitingExceeded}
              />
            </div>

            {/* Doctor Assignment */}
            <div className="pt-2 border-t border-white/5">
              <label className="block text-xs font-medium text-text-secondary">
                {t('Assigned doctor')}
                <select
                  value={doctorId}
                  onChange={(e) => {
                    setDoctorId(e.target.value);
                    if (e.target.value) onAssignment(e.target.value);
                  }}
                  disabled={!coordinatorRoles.includes(role) || busy}
                  className="form-control mt-1.5 w-full rounded-xl border border-white/10 bg-[#0B1728] p-2.5 text-sm text-white disabled:opacity-50"
                >
                  <option value="">{t('Unassigned')}</option>
                  {snapshot.doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id} disabled={doctor.availability === 'Off duty'}>
                      {doctor.name} · {t(doctor.availability)} ({doctor.pendingConsultations} {t('pending')})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Assessment Status Update (Doctor role) */}
            {role === 'Doctor' && (
              <div>
                <label className="block text-xs font-medium text-text-secondary">
                  {t('Assessment status')}
                  <div className="mt-1.5 flex gap-2">
                    <select
                      value={assessment}
                      onChange={(e) => setAssessment(e.target.value)}
                      className="form-control flex-1 rounded-xl border border-white/10 bg-[#0B1728] p-2.5 text-sm text-white"
                    >
                      {[
                        'Awaiting clinician review',
                        'Clinician reviewed',
                        'Consultation started',
                        'Reviewed',
                        'Referred for further assessment',
                      ].map((value) => (
                        <option key={value} value={value}>
                          {t(value)}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onAssessment(assessment)}
                      disabled={busy}
                    >
                      {t('Update')}
                    </Button>
                  </div>
                </label>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs & Escalation History */}
      <div className="grid gap-5 xl:grid-cols-2">
        <HistoryList title="Priority and Case History" events={history} />

        <Card>
          <CardHeader>
            <CardTitle>{t('Escalation History')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {relatedEscalations.length ? (
              relatedEscalations.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-white/5 bg-[#07111F]/40 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge
                      variant={entry.status === 'Resolved' ? 'success' : 'warning'}
                      size="sm"
                      dot
                    >
                      {t(entry.status)}
                    </Badge>
                    <span className="text-[10px] text-text-muted">
                      {new Date(entry.createdAt).toLocaleString(language === 'kn' ? 'kn-IN' : 'en-IN')}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white">
                    {entry.targetName} · <span className="text-accent-cyan">{t(entry.targetRole)}</span>
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">{entry.reason}</p>
                  <div className="mt-2 border-t border-white/5 pt-2 space-y-1">
                    {entry.history.map((event) => (
                      <p key={event.id} className="text-[11px] text-text-muted">
                        • {t(event.status)} by {event.actor} (
                        {new Date(event.time).toLocaleTimeString(language === 'kn' ? 'kn-IN' : 'en-IN')})
                      </p>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-muted">{t('No escalation history for this patient.')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Escalation Dialog Modal */}
      <Modal
        isOpen={escalationOpen}
        onClose={() => setEscalationOpen(false)}
        title={t('Emergency Escalation')}
        description={t(
          'Send this coordination alert to the designated hospital role. This does not make a clinical decision.'
        )}
        maxWidth="lg"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onEscalate({ targetRole, targetName, reason: escalationReason });
            setEscalationOpen(false);
            setEscalationReason('');
          }}
        >
          <label className="block text-sm text-text-secondary">
            {t('Recipient role')}
            <select
              value={targetRole}
              onChange={(e) => {
                setTargetRole(e.target.value);
                setTargetName(
                  e.target.value === 'Doctor'
                    ? snapshot.doctors.find((d) => d.availability !== 'Off duty')?.name || ''
                    : e.target.value === 'Hospital Staff'
                    ? 'Duty Coordinator'
                    : 'Hospital Administrator on duty'
                );
              }}
              className="form-control mt-1.5 w-full rounded-xl border border-white/10 bg-[#0B1728] p-2.5 text-sm text-white"
            >
              {coordinatorRoles.map((value) => (
                <option key={value} value={value}>
                  {t(value)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-text-secondary">
            {t('Designated recipient')}
            <select
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              className="form-control mt-1.5 w-full rounded-xl border border-white/10 bg-[#0B1728] p-2.5 text-sm text-white"
            >
              {(targetRole === 'Doctor'
                ? snapshot.doctors.filter((d) => d.availability !== 'Off duty').map((d) => d.name)
                : targetRole === 'Hospital Staff'
                ? ['Duty Coordinator', 'Hospital Operations Desk']
                : ['Hospital Administrator on duty']
              ).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-text-secondary">
            {t('Escalation reason')}
            <textarea
              required
              maxLength={500}
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              rows={3}
              className="form-control mt-1.5 w-full rounded-xl border border-white/10 bg-[#0B1728] p-2.5 text-sm text-white"
              placeholder={t('Describe the urgent coordination bottleneck or delay')}
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEscalationOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button type="submit" variant="danger" isLoading={busy} leftIcon={BellRing}>
              {t('Create Escalation')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
