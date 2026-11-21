export const SYMPTOM_OPTIONS = [
  'Chest pain or discomfort',
  'Difficulty breathing',
  'Sudden weakness',
  'Sudden difficulty speaking',
  'Severe headache',
  'Loss of consciousness',
  'Seizures',
  'Severe bleeding',
  'High fever',
  'Vomiting',
  'Dizziness',
  'Abdominal pain',
  'Other',
];

export const WARNING_SYMPTOMS = [
  'Chest pain or discomfort',
  'Difficulty breathing',
  'Sudden weakness',
  'Sudden difficulty speaking',
  'Loss of consciousness',
  'Seizures',
  'Severe bleeding',
];

export const DEMO_PRIORITIES = ['Immediate Attention', 'Urgent Review', 'Routine Review'];

export function evaluateDemonstrationPriority({ symptoms = [], severity = 'Moderate' }) {
  const warningSigns = symptoms.filter((symptom) => WARNING_SYMPTOMS.includes(symptom));
  if (warningSigns.length) return { priority: 'Immediate Attention', warningSigns };

  // Demonstration workflow labels only. These rules are not validated clinical triage.
  if (severity === 'Severe' || symptoms.includes('Severe headache')) {
    return { priority: 'Urgent Review', warningSigns };
  }
  return { priority: 'Routine Review', warningSigns };
}

export function getPriorityRank(priority) {
  return DEMO_PRIORITIES.indexOf(priority) < 0 ? DEMO_PRIORITIES.length : DEMO_PRIORITIES.indexOf(priority);
}

export function formatWait(minutes = 0, language = 'en') {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (language === 'kn') return hours ? `${hours} ಗಂಟೆ ${remainder} ನಿಮಿಷ` : `${minutes} ನಿಮಿಷ`;
  return hours ? `${hours} hr ${String(remainder).padStart(2, '0')} min` : `${minutes} min`;
}

export function createDemoTriageCases() {
  const now = Date.now();
  const makeCase = (data) => {
    const arrivalTime = new Date(now - data.waitMinutes * 60_000).toISOString();
    const assessed = evaluateDemonstrationPriority(data);
    return {
      ...data,
      id: data.id,
      arrivalTime,
      waitingMinutes: data.waitMinutes,
      warningSigns: assessed.warningSigns,
      demonstrationPriority: assessed.priority,
      assessmentStatus: 'Awaiting Staff Assessment',
      staffNotes: [],
      overrides: [],
      escalated: false,
      createdAt: arrivalTime,
    };
  };

  return [
    makeCase({ id: 'CB-2041', name: 'Meera Nair', age: 42, gender: 'Female', symptoms: ['Chest pain or discomfort', 'Dizziness'], duration: 'About 1 hour', severity: 'Severe', details: 'Reports discomfort began this morning.', conditions: 'Hypertension', medications: 'Amlodipine', department: 'Emergency Desk', waitMinutes: 52 }),
    makeCase({ id: 'CB-2038', name: 'Rohan Das', age: 35, gender: 'Male', symptoms: ['Difficulty breathing', 'High fever'], duration: 'Since yesterday', severity: 'Moderate', details: 'Breathing feels difficult while walking.', conditions: 'Asthma', medications: 'None reported', department: 'General Medicine', waitMinutes: 38 }),
    makeCase({ id: 'CB-2033', name: 'Ananya Rao', age: 29, gender: 'Female', symptoms: ['Abdominal pain', 'Vomiting'], duration: '4 hours', severity: 'Moderate', details: 'Pain comes and goes.', conditions: 'None reported', medications: 'None reported', department: 'General Medicine', waitMinutes: 24 }),
    makeCase({ id: 'CB-2029', name: 'Arjun Iyer', age: 61, gender: 'Male', symptoms: ['Severe headache'], duration: 'Since this morning', severity: 'Severe', details: 'Requests assessment.', conditions: 'Type 2 diabetes', medications: 'Metformin', department: 'Neurology', waitMinutes: 16 }),
  ];
}
