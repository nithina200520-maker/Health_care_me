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

async function api(path, { role = 'Hospital Administrator', method = 'GET', body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(role ? { 'x-demo-role': role } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}

test('Auth: registers a new patient successfully', async () => {
  const result = await api('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Sunita Sharma',
      email: 'sunita.test@carebridge.ai',
      password: 'mypassword123',
      role: 'Patient',
      phone: '+91 91234 56789',
      age: 40,
      gender: 'Female',
    },
  });
  assert.equal(result.status, 201);
  assert.ok(result.data.user.id.startsWith('CB-'));
  assert.equal(result.data.user.name, 'Sunita Sharma');
  assert.equal(result.data.user.email, 'sunita.test@carebridge.ai');
  assert.equal(result.data.user.password, undefined); // sanitized
});

test('Auth: prevents duplicate email registration', async () => {
  const result = await api('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Duplicate Ananya',
      email: 'ananya@carebridge.ai',
      password: 'pass',
      role: 'Patient',
    },
  });
  assert.equal(result.status, 400);
  assert.ok(result.data.error.includes('already registered'));
});

test('Auth: authenticates patient and doctor login with valid credentials', async () => {
  const patientRes = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'ananya@carebridge.ai', password: 'password123', role: 'Patient' },
  });
  assert.equal(patientRes.status, 200);
  assert.equal(patientRes.data.user.name, 'Ananya Rao');

  const doctorRes = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'kavita.menon@carebridge.ai', password: 'password123', role: 'Doctor' },
  });
  assert.equal(doctorRes.status, 200);
  assert.equal(doctorRes.data.user.licenseNumber, 'KMC-48291');
});

test('Auth: rejects login with invalid password', async () => {
  const result = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'ananya@carebridge.ai', password: 'wrongpassword' },
  });
  assert.equal(result.status, 401);
});

test('Admin CRUD: lists all registered persons and system stats', async () => {
  const result = await api('/api/admin/users');
  assert.equal(result.status, 200);
  assert.ok(Array.isArray(result.data.users));
  assert.ok(result.data.users.length >= 6);
  assert.ok(result.data.stats.totalUsers >= 6);
  assert.ok(result.data.stats.totalDoctors >= 3);
});

test('Admin CRUD: creates, updates, and deletes a registered person', async () => {
  // 1. Create person
  const createRes = await api('/api/admin/users', {
    method: 'POST',
    body: {
      name: 'Dr. Test Surgeon',
      email: 'surgeon.test@carebridge.ai',
      password: 'password123',
      role: 'Doctor',
      licenseNumber: 'KMC-99999',
      department: 'General Surgery',
      status: 'Active',
    },
  });
  assert.equal(createRes.status, 201);
  const createdId = createRes.data.user.id;
  assert.ok(createdId);

  // 2. Update person (Edit)
  const updateRes = await api(`/api/admin/users/${createdId}`, {
    method: 'PATCH',
    body: {
      name: 'Dr. Test Surgeon Senior',
      status: 'Suspended',
      phone: '+91 99999 88888',
    },
  });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.data.user.name, 'Dr. Test Surgeon Senior');
  assert.equal(updateRes.data.user.status, 'Suspended');

  // 3. Delete person
  const deleteRes = await api(`/api/admin/users/${createdId}`, {
    method: 'DELETE',
  });
  assert.equal(deleteRes.status, 200);
  assert.equal(deleteRes.data.success, true);
  assert.equal(deleteRes.data.deleted.id, createdId);
});
