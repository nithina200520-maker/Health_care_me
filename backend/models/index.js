const minute = 60_000;

const demoDoctors = [
  { id: 'DR-104', name: 'Dr. Kavita Menon', department: 'General Medicine', availability: 'Available', shift: '08:00–16:00', pendingConsultations: 2, lastUpdated: new Date().toISOString() },
  { id: 'DR-108', name: 'Dr. Arjun Shah', department: 'Emergency Medicine', availability: 'In consultation', shift: '08:00–16:00', pendingConsultations: 1, lastUpdated: new Date().toISOString() },
  { id: 'DR-116', name: 'Dr. Nisha Rao', department: 'General Medicine', availability: 'Available', shift: '10:00–18:00', pendingConsultations: 3, lastUpdated: new Date().toISOString() },
  { id: 'DR-121', name: 'Dr. Vivek Rao', department: 'Neurology', availability: 'Off duty', shift: '16:00–00:00', pendingConsultations: 0, lastUpdated: new Date().toISOString() },
];

export function createPriorityStore({ now = () => Date.now() } = {}) {
  const start = now();
  const cases = [
    { id: 'CB-2041', patientId: 'CB-2041', patientName: 'Meera Nair', age: 42, department: 'Emergency Desk', symptoms: ['Chest pain or discomfort', 'Dizziness'], priority: 'Urgent', priorityAssessedBy: 'Dr. Kavita Menon', priorityAssessedAt: new Date(start - 50 * minute).toISOString(), assessmentStatus: 'Awaiting clinician review', consultationStatus: 'Waiting', investigationStatus: 'Troponin I pending', assignedDoctorId: 'DR-108', expectedWaitMinutes: 20, waitSince: new Date(start - 52 * minute).toISOString(), createdAt: new Date(start - 52 * minute).toISOString(), updatedAt: new Date(start - 52 * minute).toISOString(), priorityHistory: [{ id: 'PH-2041-1', priority: 'Urgent', reason: 'Demo clinician reviewed initial case', staff: 'Dr. Kavita Menon', time: new Date(start - 50 * minute).toISOString() }] },
    { id: 'CB-2038', patientId: 'CB-2038', patientName: 'Rohan Das', age: 35, department: 'General Medicine', symptoms: ['Difficulty breathing', 'High fever'], priority: 'Moderate', priorityAssessedBy: 'Dr. Kavita Menon', priorityAssessedAt: new Date(start - 37 * minute).toISOString(), assessmentStatus: 'Clinician reviewed', consultationStatus: 'Waiting', investigationStatus: 'No pending investigation', assignedDoctorId: 'DR-104', expectedWaitMinutes: 30, waitSince: new Date(start - 38 * minute).toISOString(), createdAt: new Date(start - 38 * minute).toISOString(), updatedAt: new Date(start - 38 * minute).toISOString(), priorityHistory: [{ id: 'PH-2038-1', priority: 'Moderate', reason: 'Demo clinician reviewed initial case', staff: 'Dr. Kavita Menon', time: new Date(start - 37 * minute).toISOString() }] },
    { id: 'CB-2033', patientId: 'CB-2033', patientName: 'Ananya Rao', age: 29, department: 'General Medicine', symptoms: ['Abdominal pain', 'Vomiting'], priority: 'Routine', priorityAssessedBy: 'Dr. Nisha Rao', priorityAssessedAt: new Date(start - 23 * minute).toISOString(), assessmentStatus: 'Clinician reviewed', consultationStatus: 'Waiting', investigationStatus: 'Blood glucose scheduled', assignedDoctorId: 'DR-116', expectedWaitMinutes: 45, waitSince: new Date(start - 24 * minute).toISOString(), createdAt: new Date(start - 24 * minute).toISOString(), updatedAt: new Date(start - 24 * minute).toISOString(), priorityHistory: [{ id: 'PH-2033-1', priority: 'Routine', reason: 'Demo clinician reviewed initial case', staff: 'Dr. Nisha Rao', time: new Date(start - 23 * minute).toISOString() }] },
    { id: 'CB-2029', patientId: 'CB-2029', patientName: 'Arjun Iyer', age: 61, department: 'Neurology', symptoms: ['Severe headache'], priority: 'Needs Assessment', priorityAssessedBy: null, priorityAssessedAt: null, assessmentStatus: 'Awaiting clinician review', consultationStatus: 'Pending assignment', investigationStatus: 'MRI appointment pending', assignedDoctorId: null, expectedWaitMinutes: 30, waitSince: new Date(start - 16 * minute).toISOString(), createdAt: new Date(start - 16 * minute).toISOString(), updatedAt: new Date(start - 16 * minute).toISOString(), priorityHistory: [] },
  ];
  const alerts = [{ id: 'AL-2041-1', caseId: 'CB-2041', patientId: 'CB-2041', patientName: 'Meera Nair', targetDoctorId: 'DR-108', recipients: ['Doctor', 'Hospital Staff'], kind: 'Clinician marked urgent', message: 'Urgent clinician-reviewed case is waiting beyond its expected time.', status: 'New', createdAt: new Date(start - 32 * minute).toISOString(), acknowledgedBy: null, acknowledgedAt: null }];
  const escalations = [];

  return {
    now,
    cases,
    alerts,
    escalations,
    doctors: demoDoctors.map((doctor) => ({ ...doctor })),
    waitingThresholdMinutes: 30,
    makeId(prefix) { return `${prefix}-${now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; },
    serializeCase(item) {
      const currentTime = now();
      const consultationWaitSince = item.consultationWaitSince || item.waitSince;
      const investigationWaitSince = item.investigationWaitSince || item.waitSince;
      const waitingMinutes = Math.max(0, Math.floor((currentTime - new Date(item.waitSince).getTime()) / minute));
      const consultationWaitingMinutes = Math.max(0, Math.floor((currentTime - new Date(consultationWaitSince).getTime()) / minute));
      const investigationWaitingMinutes = Math.max(0, Math.floor((currentTime - new Date(investigationWaitSince).getTime()) / minute));
      return { ...item, symptoms: [...item.symptoms], priorityHistory: [...item.priorityHistory], history: [...(item.history || [])], waitingMinutes, waitingExceeded: waitingMinutes > item.expectedWaitMinutes, consultationWaitingMinutes, consultationWaitingExceeded: consultationWaitingMinutes > item.expectedWaitMinutes, investigationWaitingMinutes, investigationWaitingExceeded: item.investigationStatus !== 'No pending investigation' && investigationWaitingMinutes > item.expectedWaitMinutes };
    },
  };
}
