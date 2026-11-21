import { createAssistantService } from './assistantService.js';

export const PRIORITIES = ['Urgent', 'Moderate', 'Routine'];
export const STAFF_ROLES = ['Doctor', 'Hospital Staff', 'Hospital Administrator'];
export const ALL_DEMO_ROLES = ['Patient', ...STAFF_ROLES, 'Laboratory Staff', 'Radiology Staff'];
export const ASSESSMENT_STATUSES = ['Awaiting clinician review', 'Clinician reviewed', 'Consultation started', 'Reviewed', 'Referred for further assessment'];

export class ServiceError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const requireRole = (role) => {
  if (!ALL_DEMO_ROLES.includes(role)) throw new ServiceError(401, 'A recognized demo role is required.');
};
const requireCoordinator = (role) => {
  requireRole(role);
  if (!STAFF_ROLES.includes(role)) throw new ServiceError(403, 'This demo role cannot coordinate priority or escalation actions.');
};
const requireDoctor = (role) => {
  requireRole(role);
  if (role !== 'Doctor') throw new ServiceError(403, 'Priority assessment is reserved for the Doctor demo role.');
};
const requireText = (value, field, max = 300) => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new ServiceError(400, `${field} is required and must be no longer than ${max} characters.`);
  return value.trim();
};
const pushHistory = (item, event) => {
  item.history ||= [];
  item.history.push({ id: event.id, type: event.type, text: event.text, actor: event.actor, time: event.time });
};

export function createPriorityService(store) {
  const time = () => new Date(store.now()).toISOString();
  const assistant = createAssistantService(store);
  const getCase = (id) => {
    const item = store.cases.find((entry) => entry.id === id);
    if (!item) throw new ServiceError(404, 'Patient priority case not found.');
    return item;
  };
  const alertForUrgentCase = (item, actor) => {
    const active = store.alerts.find((alert) => alert.caseId === item.id && alert.status !== 'Acknowledged');
    if (active) return active;
    const alert = { id: store.makeId('AL'), caseId: item.id, patientId: item.patientId, patientName: item.patientName, targetDoctorId: item.assignedDoctorId, recipients: ['Doctor', 'Hospital Staff'], kind: 'Urgent clinician priority', message: 'A clinician marked this case urgent. Please coordinate prompt assessment.', status: 'New', createdAt: time(), acknowledgedBy: null, acknowledgedAt: null };
    store.alerts.unshift(alert);
    pushHistory(item, { id: store.makeId('EV'), type: 'alert', text: 'Critical alert created for urgent priority.', actor, time: alert.createdAt });
    return alert;
  };
  const log = (item, type, text, actor) => pushHistory(item, { id: store.makeId('EV'), type, text, actor, time: time() });

  return {
    snapshot(role, patientId = 'CB-2050') {
      requireRole(role);
      if (role === 'Patient') {
        return { cases: store.cases.filter((item) => item.patientId === patientId).map((item) => store.serializeCase(item)), alerts: [], escalations: [], doctors: [], waitingThresholdMinutes: store.waitingThresholdMinutes, demoOnly: true };
      }
      const cases = store.cases.map((item) => store.serializeCase(item)).sort((a, b) => {
        const rank = { Urgent: 0, Moderate: 1, Routine: 2, 'Needs Assessment': 3 };
        return (rank[a.priority] ?? 4) - (rank[b.priority] ?? 4) || b.waitingMinutes - a.waitingMinutes;
      });
      return { cases, alerts: store.alerts.map((alert) => ({ ...alert })), escalations: store.escalations.map((entry) => ({ ...entry, history: [...entry.history] })), doctors: store.doctors.map((doctor) => ({ ...doctor })), waitingThresholdMinutes: store.waitingThresholdMinutes, demoOnly: true };
    },

    updatePriority(id, { priority, reason, actorName }, role) {
      requireDoctor(role);
      if (!PRIORITIES.includes(priority)) throw new ServiceError(400, `Priority must be one of: ${PRIORITIES.join(', ')}.`);
      const item = getCase(id);
      const actor = requireText(actorName || 'Demo Doctor', 'actorName', 80);
      const explanation = requireText(reason, 'reason', 500);
      const previous = item.priority;
      item.priority = priority;
      item.priorityAssessedBy = actor;
      item.priorityAssessedAt = time();
      item.updatedAt = item.priorityAssessedAt;
      item.priorityHistory.unshift({ id: store.makeId('PH'), priority, previousPriority: previous, reason: explanation, staff: actor, time: item.priorityAssessedAt });
      log(item, 'priority', `Priority changed from ${previous} to ${priority}: ${explanation}`, actor);
      const alert = priority === 'Urgent' ? alertForUrgentCase(item, actor) : null;
      return { case: store.serializeCase(item), alert };
    },

    assignDoctor(id, { doctorId, actorName }, role) {
      requireCoordinator(role);
      const item = getCase(id);
      const doctor = store.doctors.find((entry) => entry.id === doctorId);
      if (!doctor) throw new ServiceError(404, 'Doctor not found.');
      if (doctor.availability === 'Off duty') throw new ServiceError(409, 'Cannot assign a doctor who is off duty.');
      const previous = item.assignedDoctorId;
      item.assignedDoctorId = doctor.id;
      item.updatedAt = time();
      doctor.pendingConsultations += previous === doctor.id ? 0 : 1;
      if (previous && previous !== doctor.id) {
        const oldDoctor = store.doctors.find((entry) => entry.id === previous);
        if (oldDoctor) oldDoctor.pendingConsultations = Math.max(0, oldDoctor.pendingConsultations - 1);
      }
      const actor = requireText(actorName || role, 'actorName', 80);
      log(item, 'assignment', `Assigned to ${doctor.name}.`, actor);
      return { case: store.serializeCase(item), doctor: { ...doctor } };
    },

    updateDoctorAvailability(doctorId, { availability, shift, actorName }, role) {
      requireCoordinator(role);
      const doctor = store.doctors.find((entry) => entry.id === doctorId);
      if (!doctor) throw new ServiceError(404, 'Doctor not found.');
      const validStatuses = ['Available', 'In consultation', 'On rounds', 'Off duty'];
      if (!validStatuses.includes(availability)) {
        throw new ServiceError(400, `Doctor availability must be one of: ${validStatuses.join(', ')}.`);
      }
      doctor.availability = availability;
      if (shift && typeof shift === 'string' && shift.trim()) {
        doctor.shift = shift.trim();
      }
      doctor.lastUpdated = time();
      return { doctor: { ...doctor } };
    },

    updateAssessment(id, { status, actorName }, role) {
      requireDoctor(role);
      if (!ASSESSMENT_STATUSES.includes(status)) throw new ServiceError(400, 'Assessment status is not recognized.');
      const item = getCase(id);
      const actor = requireText(actorName || 'Demo Doctor', 'actorName', 80);
      item.assessmentStatus = status;
      item.consultationStatus = status === 'Consultation started' ? 'In consultation' : status === 'Reviewed' ? 'Reviewed' : item.consultationStatus;
      item.updatedAt = time();
      log(item, 'assessment', `Assessment status set to ${status}.`, actor);
      return store.serializeCase(item);
    },

    createCase(input, role) {
      requireRole(role);
      if (role === 'Patient' || STAFF_ROLES.includes(role)) {
        const id = requireText(input.id, 'id', 40);
        if (store.cases.some((item) => item.id === id)) throw new ServiceError(409, 'A case with this patient ID already exists.');
        const patientName = requireText(input.patientName, 'patientName', 120);
        const department = requireText(input.department || 'Registration', 'department', 100);
        const arrival = input.waitSince ? new Date(input.waitSince) : new Date(store.now());
        if (Number.isNaN(arrival.getTime()) || arrival.getTime() > store.now()) throw new ServiceError(400, 'waitSince must be a valid time in the past.');
        const waitSince = arrival.toISOString();
        const item = { id, patientId: id, patientName, age: Number.isInteger(input.age) ? input.age : null, department, symptoms: Array.isArray(input.symptoms) ? input.symptoms.slice(0, 12).map((s) => String(s).slice(0, 100)) : [], priority: 'Needs Assessment', priorityAssessedBy: null, priorityAssessedAt: null, assessmentStatus: 'Awaiting clinician review', consultationStatus: 'Pending assignment', investigationStatus: 'Not assessed', assignedDoctorId: null, expectedWaitMinutes: store.waitingThresholdMinutes, waitSince, consultationWaitSince: waitSince, investigationWaitSince: waitSince, createdAt: time(), updatedAt: time(), priorityHistory: [], history: [] };
        store.cases.unshift(item);
        if (input.warningSigns?.length) {
          const alert = { id: store.makeId('AL'), caseId: item.id, patientId: item.patientId, patientName: item.patientName, recipients: ['Doctor', 'Hospital Staff'], kind: 'Patient-reported warning sign', message: 'The patient reported a warning sign. A qualified staff member should review this check-in promptly.', status: 'New', createdAt: time(), acknowledgedBy: null, acknowledgedAt: null };
          store.alerts.unshift(alert);
          log(item, 'alert', 'A critical review alert was created from a patient-submitted warning sign.', 'System (demo workflow)');
        }
        return store.serializeCase(item);
      }
      throw new ServiceError(403, 'This role cannot submit a patient check-in.');
    },

    createEscalation(id, { targetRole, targetName, reason, actorName }, role) {
      requireCoordinator(role);
      if (!['Doctor', 'Hospital Staff', 'Hospital Administrator'].includes(targetRole)) throw new ServiceError(400, 'Escalation target role is not recognized.');
      const item = getCase(id);
      const actor = requireText(actorName || role, 'actorName', 80);
      const escalation = { id: store.makeId('ES'), caseId: item.id, patientId: item.patientId, patientName: item.patientName, targetRole, targetName: requireText(targetName, 'targetName', 100), reason: requireText(reason, 'reason', 500), status: 'Pending acknowledgement', createdBy: actor, createdAt: time(), acknowledgedBy: null, acknowledgedAt: null, respondedBy: null, respondedAt: null, history: [] };
      escalation.history.push({ id: store.makeId('EH'), status: escalation.status, actor, text: `Escalated to ${escalation.targetName} (${targetRole}).`, time: escalation.createdAt });
      store.escalations.unshift(escalation);
      log(item, 'escalation', `Escalated to ${escalation.targetName}.`, actor);
      const alert = { id: store.makeId('AL'), caseId: item.id, patientId: item.patientId, patientName: item.patientName, targetRole, targetName: escalation.targetName, recipients: [targetRole, 'Hospital Staff'], kind: 'Emergency escalation', message: escalation.reason, status: 'New', createdAt: time(), acknowledgedBy: null, acknowledgedAt: null, escalationId: escalation.id };
      store.alerts.unshift(alert);
      return { escalation: { ...escalation, history: [...escalation.history] }, alert };
    },

    acknowledgeAlert(id, { actorName }, role) {
      requireCoordinator(role);
      const alert = store.alerts.find((entry) => entry.id === id);
      if (!alert) throw new ServiceError(404, 'Critical alert not found.');
      if (alert.status === 'Acknowledged') return { ...alert };
      alert.status = 'Acknowledged';
      alert.acknowledgedBy = requireText(actorName || role, 'actorName', 80);
      alert.acknowledgedAt = time();
      if (alert.escalationId) {
        const escalation = store.escalations.find((entry) => entry.id === alert.escalationId);
        if (escalation && escalation.status === 'Pending acknowledgement') {
          escalation.status = 'Acknowledged';
          escalation.acknowledgedBy = alert.acknowledgedBy;
          escalation.acknowledgedAt = alert.acknowledgedAt;
          escalation.history.unshift({ id: store.makeId('EH'), status: 'Acknowledged', actor: alert.acknowledgedBy, text: 'Escalation acknowledged.', time: alert.acknowledgedAt });
        }
      }
      const item = getCase(alert.caseId);
      log(item, 'alert-acknowledged', `Alert ${alert.id} acknowledged.`, alert.acknowledgedBy);
      return { ...alert };
    },

    updateEscalation(id, { status, actorName }, role) {
      requireCoordinator(role);
      if (!['Acknowledged', 'Responded', 'Resolved'].includes(status)) throw new ServiceError(400, 'Escalation status is not recognized.');
      const entry = store.escalations.find((item) => item.id === id);
      if (!entry) throw new ServiceError(404, 'Escalation not found.');
      const actor = requireText(actorName || role, 'actorName', 80);
      const stamp = time();
      const order = { 'Pending acknowledgement': 0, Acknowledged: 1, Responded: 2, Resolved: 3 };
      if (order[status] < order[entry.status]) throw new ServiceError(409, 'Escalation status cannot move backward.');
      if (order[status] >= 1 && !entry.acknowledgedAt) {
        entry.acknowledgedAt = stamp;
        entry.acknowledgedBy = actor;
        entry.history.unshift({ id: store.makeId('EH'), status: 'Acknowledged', actor, text: 'Escalation acknowledged.', time: stamp });
        const linkedAlert = store.alerts.find((alert) => alert.escalationId === entry.id);
        if (linkedAlert && linkedAlert.status !== 'Acknowledged') {
          linkedAlert.status = 'Acknowledged';
          linkedAlert.acknowledgedBy = actor;
          linkedAlert.acknowledgedAt = stamp;
        }
      }
      if (order[status] >= 2 && !entry.respondedAt) {
        entry.respondedAt = stamp;
        entry.respondedBy = actor;
        entry.history.unshift({ id: store.makeId('EH'), status: 'Responded', actor, text: 'Escalation response recorded.', time: stamp });
      }
      if (status === 'Acknowledged' && !entry.acknowledgedAt) { entry.acknowledgedAt = stamp; entry.acknowledgedBy = actor; }
      entry.status = status;
      entry.history.unshift({ id: store.makeId('EH'), status, actor, text: `Escalation ${status.toLowerCase()}.`, time: stamp });
      const item = getCase(entry.caseId);
      log(item, 'escalation-status', `Escalation status: ${status}.`, actor);
      return { ...entry, history: [...entry.history] };
    },
    chat(body, role) {
      return assistant.handleChat({ ...body, role });
    },
    analyzeDocument(body, role) {
      return assistant.analyzeDocument({ ...body, role });
    },
    navigation(language) {
      return assistant.getNavigationSummary(language);
    },
  };
}

export { createAssistantService };
