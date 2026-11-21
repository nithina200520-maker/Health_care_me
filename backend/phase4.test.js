import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createCareBridgeServer } from './server.js';

let server;
let baseUrl;

before(async () => {
  server = createCareBridgeServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

async function api(path, { role = 'Doctor', method = 'GET', body, patientId } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { ...(role ? { 'x-demo-role': role } : {}), ...(patientId ? { 'x-demo-patient-id': patientId } : {}), ...(body ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}

test('health endpoint identifies the demo backend and storage limits', async () => {
  const result = await api('/api/health', { role: null });
  assert.equal(result.status, 200);
  assert.equal(result.data.phase, 'Phase 4');
  assert.equal(result.data.storage, 'in-memory demo data');
});

test('priority snapshot sorts clinician-assessed categories and reports wait thresholds', async () => {
  const result = await api('/api/phase4/snapshot');
  assert.equal(result.status, 200);
  assert.deepEqual(result.data.cases.slice(0, 3).map((item) => item.priority), ['Urgent', 'Moderate', 'Routine']);
  assert.equal(typeof result.data.cases[0].waitingExceeded, 'boolean');
  assert.ok(result.data.doctors.length > 0);
  assert.ok(result.data.alerts.some((alert) => alert.status === 'New'));
});

test('priority changes require the doctor demo role, a valid priority, and an explanation', async () => {
  const forbidden = await api('/api/phase4/cases/CB-2033/priority', { role: 'Hospital Staff', method: 'PATCH', body: { priority: 'Urgent', reason: 'Review', actorName: 'Demo Staff' } });
  assert.equal(forbidden.status, 403);
  const invalid = await api('/api/phase4/cases/CB-2033/priority', { method: 'PATCH', body: { priority: 'Critical', reason: 'Review', actorName: 'Dr. Kavita Menon' } });
  assert.equal(invalid.status, 400);
  const updated = await api('/api/phase4/cases/CB-2033/priority', { method: 'PATCH', body: { priority: 'Urgent', reason: 'Clinician review requested escalation', actorName: 'Dr. Kavita Menon' } });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.case.priority, 'Urgent');
  assert.ok(updated.data.alert.id);
  assert.equal(updated.data.case.priorityHistory[0].reason, 'Clinician review requested escalation');
});

test('doctor assignment checks availability and updates pending workload', async () => {
  const offDuty = await api('/api/phase4/cases/CB-2029/assignment', { role: 'Hospital Staff', method: 'PATCH', body: { doctorId: 'DR-121', actorName: 'Demo Coordinator' } });
  assert.equal(offDuty.status, 409);
  const assigned = await api('/api/phase4/cases/CB-2029/assignment', { role: 'Hospital Staff', method: 'PATCH', body: { doctorId: 'DR-104', actorName: 'Demo Coordinator' } });
  assert.equal(assigned.status, 200);
  assert.equal(assigned.data.case.assignedDoctorId, 'DR-104');
});

test('patient check-ins stay unprioritized until clinician assessment and create review alerts for warning signs', async () => {
  const created = await api('/api/phase4/cases', { role: 'Patient', method: 'POST', body: { id: 'CB-NEW-1', patientName: 'Demo Patient', age: 30, symptoms: ['Symptom submitted'], warningSigns: ['Patient-reported concern'] } });
  assert.equal(created.status, 201);
  assert.equal(created.data.priority, 'Needs Assessment');
  const snapshot = await api('/api/phase4/snapshot');
  assert.ok(snapshot.data.alerts.some((alert) => alert.caseId === 'CB-NEW-1'));
  const scoped = await api('/api/phase4/snapshot', { role: 'Patient', patientId: 'CB-NEW-1' });
  assert.deepEqual(scoped.data.cases.map((item) => item.id), ['CB-NEW-1']);
  assert.deepEqual(scoped.data.doctors, []);
});

test('critical alerts and escalations keep acknowledgement and response history', async () => {
  const created = await api('/api/phase4/cases/CB-2041/escalations', { role: 'Hospital Staff', method: 'POST', body: { targetRole: 'Doctor', targetName: 'Dr. Kavita Menon', reason: 'Please assess the waiting case', actorName: 'Demo Coordinator' } });
  assert.equal(created.status, 201);
  const acknowledged = await api(`/api/phase4/alerts/${created.data.alert.id}/acknowledge`, { role: 'Doctor', method: 'PATCH', body: { actorName: 'Dr. Kavita Menon' } });
  assert.equal(acknowledged.data.status, 'Acknowledged');
  const responded = await api(`/api/phase4/escalations/${created.data.escalation.id}/status`, { role: 'Doctor', method: 'PATCH', body: { status: 'Responded', actorName: 'Dr. Kavita Menon' } });
  assert.equal(responded.data.status, 'Responded');
  assert.ok(responded.data.acknowledgedAt);
  assert.ok(responded.data.respondedAt);
  assert.ok(responded.data.history.length >= 2);
});

test('doctor availability updates require valid status and coordinator role', async () => {
  const unauth = await api('/api/phase4/doctors/DR-104/availability', { role: 'Patient', method: 'PATCH', body: { availability: 'In consultation' } });
  assert.equal(unauth.status, 403);
  const invalid = await api('/api/phase4/doctors/DR-104/availability', { role: 'Doctor', method: 'PATCH', body: { availability: 'Unknown Status' } });
  assert.equal(invalid.status, 400);
  const updated = await api('/api/phase4/doctors/DR-104/availability', { role: 'Doctor', method: 'PATCH', body: { availability: 'In consultation', shift: '08:00–16:00' } });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.doctor.availability, 'In consultation');
});

test('unknown or unauthorized requests return safe HTTP errors', async () => {
  assert.equal((await api('/api/phase4/snapshot', { role: null })).status, 401);
  assert.equal((await api('/api/phase4/snapshot', { role: 'Patient' })).status, 200);
  assert.equal((await api('/api/phase4/missing')).status, 404);
});
