export function createPriorityController(service) {
  return {
    snapshot: (role, patientId) => service.snapshot(role, patientId),
    createCase: (body, role) => service.createCase(body, role),
    updatePriority: (id, body, role) => service.updatePriority(id, body, role),
    assignDoctor: (id, body, role) => service.assignDoctor(id, body, role),
    updateAssessment: (id, body, role) => service.updateAssessment(id, body, role),
    createEscalation: (id, body, role) => service.createEscalation(id, body, role),
    acknowledgeAlert: (id, body, role) => service.acknowledgeAlert(id, body, role),
    updateEscalation: (id, body, role) => service.updateEscalation(id, body, role),
    updateDoctorAvailability: (id, body, role) => service.updateDoctorAvailability(id, body, role),
  };
}
