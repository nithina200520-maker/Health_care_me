import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createPriorityController } from './controllers/index.js';
import { createPriorityStore } from './models/index.js';
import { createPriorityRouter } from './routes/index.js';
import { createPriorityService, ServiceError } from './services/index.js';

const MAX_BODY_BYTES = 10 * 1024 * 1024;

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new ServiceError(413, 'Request body is too large.');
    chunks.push(chunk);
  }
  if (!size) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new ServiceError(400, 'Request body must contain valid JSON.'); }
}

function send(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

export function createCareBridgeServer({ store = createPriorityStore() } = {}) {
  const router = createPriorityRouter(createPriorityController(createPriorityService(store)));
  return createServer(async (request, response) => {
    response.setHeader('access-control-allow-origin', 'http://127.0.0.1:5173');
    response.setHeader('access-control-allow-headers', 'content-type,x-demo-role,x-demo-patient-id');
    response.setHeader('access-control-allow-methods', 'GET,POST,PATCH,OPTIONS');
    if (request.method === 'OPTIONS') { response.writeHead(204); response.end(); return; }

    const url = new URL(request.url || '/', 'http://127.0.0.1');
    if (request.method === 'GET' && url.pathname === '/api/health') {
      send(response, 200, { status: 'ok', service: 'CareBridge AI Demo API', version: '0.3.0', phase: 'Phase 4', activePhases: ['Phase 0', 'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5'], storage: 'in-memory demo data', timestamp: new Date().toISOString() });
      return;
    }
    if (!url.pathname.startsWith('/api/phase4') && !url.pathname.startsWith('/api/phase5')) {
      send(response, 404, { error: 'Route not found.' });
      return;
    }

    try {
      const body = ['POST', 'PATCH', 'PUT'].includes(request.method) ? await readJson(request) : {};
      const prefix = url.pathname.startsWith('/api/phase5') ? '/api/phase5' : '/api/phase4';
      const path = url.pathname.slice(prefix.length) || '/';
      const queryLang = url.searchParams.get('lang');
      if (queryLang) body.lang = queryLang;
      const result = await router({ method: request.method, path, body, role: request.headers['x-demo-role'], patientId: request.headers['x-demo-patient-id'] || 'CB-2050' });
      send(response, result.status, result.body);
    } catch (error) {
      const status = error instanceof ServiceError ? error.status : 500;
      if (status >= 500) console.error('[CareBridge demo API]', error);
      send(response, status, { error: status >= 500 ? 'The demo API could not complete this request.' : error.message });
    }
  });
}

// Imported by tests without opening a port; run directly for local backend development.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5000);
  createCareBridgeServer().listen(port, '127.0.0.1', () => {
    console.log(`[CareBridge AI] Phase 4 & Phase 5 demo API listening at http://127.0.0.1:${port}`);
  });
}

export default createCareBridgeServer;
