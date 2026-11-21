const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, { role, patientId, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(role ? { 'x-demo-role': role } : {}),
      ...(patientId ? { 'x-demo-patient-id': patientId } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `CareBridge API request failed (${response.status}).`);
  return payload;
}

const jsonBody = (body) => JSON.stringify(body);

export function checkBackendHealth() {
  return request('/health').catch((error) => {
    console.warn('[CareBridge Service] Backend not reached or offline:', error.message);
    return { status: 'offline', error: error.message };
  });
}

export const getPrioritySnapshot = (role, patientId) => request('/phase4/snapshot', { role, patientId });
export const createPriorityCase = (caseData, role) => request('/phase4/cases', { role, method: 'POST', body: jsonBody(caseData) });
export const updateCasePriority = (id, body, role) => request(`/phase4/cases/${encodeURIComponent(id)}/priority`, { role, method: 'PATCH', body: jsonBody(body) });
export const assignPriorityCase = (id, body, role) => request(`/phase4/cases/${encodeURIComponent(id)}/assignment`, { role, method: 'PATCH', body: jsonBody(body) });
export const updatePriorityAssessment = (id, body, role) => request(`/phase4/cases/${encodeURIComponent(id)}/assessment`, { role, method: 'PATCH', body: jsonBody(body) });
export const createEmergencyEscalation = (id, body, role) => request(`/phase4/cases/${encodeURIComponent(id)}/escalations`, { role, method: 'POST', body: jsonBody(body) });
export const acknowledgeCriticalAlert = (id, body, role) => request(`/phase4/alerts/${encodeURIComponent(id)}/acknowledge`, { role, method: 'PATCH', body: jsonBody(body) });
export const updateEmergencyEscalation = (id, body, role) => request(`/phase4/escalations/${encodeURIComponent(id)}/status`, { role, method: 'PATCH', body: jsonBody(body) });
export const updateDoctorAvailability = (id, body, role) => request(`/phase4/doctors/${encodeURIComponent(id)}/availability`, { role, method: 'PATCH', body: jsonBody(body) });

// Phase 5 Smart Assistant & Document Analysis
export const sendChatMessage = ({ message, history, language = 'en', role = 'Patient' }) =>
  request('/phase5/chat', { role, method: 'POST', body: jsonBody({ message, history, language }) });

export const analyzeMedicalDocument = ({ fileData, fileName, fileType, language = 'en', role = 'Patient' }) =>
  request('/phase5/analyze-document', { role, method: 'POST', body: jsonBody({ fileData, fileName, fileType, language }) });

export const getHospitalNavigation = (language = 'en') =>
  request(`/phase5/navigation?lang=${encodeURIComponent(language)}`);
