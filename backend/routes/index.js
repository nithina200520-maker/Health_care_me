import { ServiceError } from '../services/index.js';

export function createPriorityRouter(controller) {
  return async ({ method, path, body, role, patientId }) => {
    if (method === 'GET' && path === '/snapshot') return { status: 200, body: controller.snapshot(role, patientId) };
    if (method === 'POST' && path === '/cases') return { status: 201, body: controller.createCase(body, role) };

    let match = path.match(/^\/cases\/([^/]+)\/(priority|assignment|assessment|escalations)$/);
    if (match) {
      const [, rawId, action] = match;
      const id = decodeURIComponent(rawId);
      if (action === 'priority' && method === 'PATCH') return { status: 200, body: controller.updatePriority(id, body, role) };
      if (action === 'assignment' && method === 'PATCH') return { status: 200, body: controller.assignDoctor(id, body, role) };
      if (action === 'assessment' && method === 'PATCH') return { status: 200, body: controller.updateAssessment(id, body, role) };
      if (action === 'escalations' && method === 'POST') return { status: 201, body: controller.createEscalation(id, body, role) };
    }

    match = path.match(/^\/(alerts|escalations)\/([^/]+)\/(acknowledge|status)$/);
    if (match) {
      const [, collection, rawId, action] = match;
      const id = decodeURIComponent(rawId);
      if (collection === 'alerts' && action === 'acknowledge' && method === 'PATCH') return { status: 200, body: controller.acknowledgeAlert(id, body, role) };
      if (collection === 'escalations' && action === 'status' && method === 'PATCH') return { status: 200, body: controller.updateEscalation(id, body, role) };
    }

    match = path.match(/^\/doctors\/([^/]+)\/availability$/);
    if (match && method === 'PATCH') {
      const id = decodeURIComponent(match[1]);
      return { status: 200, body: controller.updateDoctorAvailability(id, body, role) };
    }
    throw new ServiceError(404, 'API endpoint not found.');
  };
}
