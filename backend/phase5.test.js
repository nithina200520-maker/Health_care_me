import test, { before, after } from 'node:test';
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

async function api(path, { role = 'Patient', method = 'GET', body, patientId } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(role ? { 'x-demo-role': role } : {}),
      ...(patientId ? { 'x-demo-patient-id': patientId } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}

test('Phase 5 chat: provides friendly greeting and navigation overview', async () => {
  const result = await api('/api/phase5/chat', {
    method: 'POST',
    body: { message: 'Hello, what can you do?', language: 'en' },
  });
  assert.equal(result.status, 200);
  assert.ok(result.data.reply.includes('CareBridge AI'));
  assert.ok(result.data.spokenText.length > 0);
  assert.equal(result.data.language, 'en');
});

test('Phase 5 chat: safely routes medical emergencies to emergency desk', async () => {
  const result = await api('/api/phase5/chat', {
    method: 'POST',
    body: { message: 'I have severe chest pain and trouble breathing', language: 'en' },
  });
  assert.equal(result.status, 200);
  assert.ok(result.data.reply.includes('EMERGENCY ALERT'));
  assert.ok(result.data.reply.includes('108'));
  assert.equal(result.data.actionSuggestion?.label, 'Emergency Protocol');
});

test('Phase 5 chat: reports doctor availability and schedules in Kannada and Hindi', async () => {
  const resultKn = await api('/api/phase5/chat', {
    method: 'POST',
    body: { message: 'ಯಾವ ವೈದ್ಯರು ಲಭ್ಯವಿದ್ದಾರೆ?', language: 'kn' },
  });
  assert.equal(resultKn.status, 200);
  assert.ok(resultKn.data.reply.includes('ವೈದ್ಯರು'));
  assert.equal(resultKn.data.language, 'kn');

  const resultHi = await api('/api/phase5/chat', {
    method: 'POST',
    body: { message: 'उपलब्ध डॉक्टर कौन हैं?', language: 'hi' },
  });
  assert.equal(resultHi.status, 200);
  assert.ok(resultHi.data.reply.includes('डॉक्टर'));
  assert.equal(resultHi.data.language, 'hi');
});

test('Phase 5 document analysis: extracts CBC parameters and reference ranges with non-diagnostic disclaimer', async () => {
  const result = await api('/api/phase5/analyze-document', {
    method: 'POST',
    body: {
      fileName: 'blood_test_cbc.jpg',
      fileType: 'image/jpeg',
      fileData: 'data:image/jpeg;base64,demoImageData',
      language: 'en',
    },
  });
  assert.equal(result.status, 200);
  assert.ok(result.data.documentType.includes('Blood'));
  assert.ok(result.data.parameters.length >= 3);
  assert.ok(result.data.parameters.some((p) => p.name.includes('Hemoglobin')));
  assert.ok(result.data.disclaimer.includes('does not diagnose'));
  assert.ok(result.data.questionsForDoctor.length > 0);
});

test('Phase 5 document analysis: prescription extraction parses medicines and directions', async () => {
  const result = await api('/api/phase5/analyze-document', {
    method: 'POST',
    body: {
      fileName: 'dr_prescription_rx.png',
      fileType: 'image/png',
      fileData: 'data:image/png;base64,demoPrescriptionData',
      language: 'en',
    },
  });
  assert.equal(result.status, 200);
  assert.equal(result.data.documentType, 'Outpatient Medical Prescription');
  assert.ok(result.data.parameters.some((p) => p.name.includes('Metformin')));
  assert.ok(result.data.summary.includes('glycemic'));
});

test('Phase 5 document analysis: radiology scan note enforces strict non-diagnostic guardrails', async () => {
  const result = await api('/api/phase5/analyze-document', {
    method: 'POST',
    body: {
      fileName: 'chest_ct_scan.png',
      fileType: 'image/png',
      fileData: 'data:image/png;base64,demoScanData',
      language: 'en',
    },
  });
  assert.equal(result.status, 200);
  assert.equal(result.data.documentType, 'Radiology / Imaging Document Note');
  assert.ok(result.data.summary.includes('CareBridge AI does not perform autonomous diagnosis on medical scans'));
});

test('Phase 5 navigation: delivers hospital department locations and queue counts', async () => {
  const result = await api('/api/phase5/navigation?lang=en');
  assert.equal(result.status, 200);
  assert.ok(result.data.departments.length >= 4);
  assert.ok(result.data.departments.some((dept) => dept.name === 'Emergency Desk'));
  assert.ok(result.data.departments.some((dept) => dept.name === 'Diagnostic Laboratory'));
});
