# CareBridge AI – Smart Healthcare Coordination & Patient Assistance Platform

CareBridge AI is a patient-centric healthcare workflow coordination platform designed to address critical delays in government and public hospitals: delayed diagnoses, diagnostic test bottlenecks (CT/MRI/blood tests), delayed doctor consultations, and poor departmental coordination.

---

## Current Scope & Completed Phases

### Phase 0 — Design System & Platform Foundation
- **Visual Design System**: Deep Navy theme (`#07111F`, `#0B1728`, `#101F33`, `#142842`), Cyan (`#00D4FF`) and Blue (`#3478F6`) accents, and accessible status colors (`#22C55E`, `#F59E0B`, `#EF4444`).
- **Reusable UI Library**: Button, Card, Input, Badge, Modal, SectionHeader, LoadingSpinner, Toast, EmptyState, and StatusIndicator.
- **Responsive Landing Page**: Interactive 3D Holographic Heart, 6 Core Architecture Feature Cards, 6-Stage Hospital Workflow, and Medical Disclaimer.

### Phase 1 — Multi-Role Architecture & Kannada Localization
- **6 Supported Roles**: Patient, Doctor, Hospital Staff, Laboratory Staff, Radiology Staff, and Hospital Administrator.
- **Language Support**: Comprehensive i18n support for English and Kannada (`kn`).

### Phase 2 — Symptom Check-In & Local Staff Triage
- Patient symptom entry with severity, duration, and red-flag emergency warning signs.
- Staff triage review queue with priority override audit log and clinical notes.

### Phase 3 — Investigation Lifecycle & Delay Monitoring
- 11-stage diagnostic lifecycle from `Requested` ➔ `Sample Collected` / `Scan Scheduled` ➔ `Processing` ➔ `Report Generated` ➔ `Doctor Reviewed`.
- SLA waiting-time delay indicators and department-level work queues.

### Phase 4 — Smart Patient Prioritization & Critical Case Escalation
1. **Smart Patient Prioritization**:
   - Urgent, Moderate, and Routine clinician-entered priority categories.
   - Doctor-role restricted priority assessments requiring explicit clinical justifications.
   - Comprehensive priority history and audit logging.
2. **Critical Case Alerts Panel**:
   - Automated alerts for time-sensitive cases and patient-reported red flags.
   - Multi-role notification targeting and acknowledgement tracking.
3. **Waiting-Time Analytics**:
   - Real-time elapsed wait tracking vs. expected limit (30 minutes default threshold).
   - Department waiting breakdown with bottleneck visual indicators.
   - Separate consultation delay vs. diagnostic test delay metrics.
4. **Emergency Escalation Timeline**:
   - Full 4-stage escalation lifecycle: `Pending acknowledgement` ➔ `Acknowledged` ➔ `Responded` ➔ `Resolved`.
   - Multi-recipient routing to Doctors, Hospital Staff, and Hospital Administrators.
5. **Interactive Doctor Availability & Schedules**:
   - Real-time availability toggling (`Available`, `In consultation`, `On rounds`, `Off duty`).
   - Active pending consultation workload balancing and shift tracking.
6. **Patient-Facing Queue Visibility**:
   - Safe, transparent queue status, estimated wait time, and assigned clinician in the Patient Dashboard.
7. **Architectural Improvements**:
   - Reusable `Sidebar` layout component.
   - Extracted `PatientPriorityDetails` component.

### Phase 5 — CareBridge AI Smart Assistant, Medical Image Analysis & Voice Integration (Completed)
1. **Floating AI Assistant**:
   - Floating interactive assistant button across the entire platform with pulsing holographic glow and online status indicator.
   - Expandable, draggable chat drawer with 3D-styled AI avatar, message history, suggested questions, and minimize/close controls.
2. **Medical Image & Document Upload**:
   - Drag-and-drop & file browser supporting JPG, JPEG, PNG, and PDF (up to 10MB).
   - Real-time thumbnail preview, file validation, progress state, and replace/remove controls.
   - Explicit user consent check acknowledging non-diagnostic informational use before processing.
3. **AI Document & Image Analysis**:
   - Structured parameter and value extraction for laboratory blood reports (CBC, glucose, creatinine, etc.).
   - Prescription extraction parsing medication names, dosing schedules, and consumption instructions.
   - Plain-language patient explanation, medical terminology definitions, and recommended questions to ask treating clinicians.
   - **Strict Clinical Guardrail**: Medical scans (CT, MRI, X-ray) are strictly prohibited from receiving autonomous AI diagnosis, displaying mandatory notices directing patients to certified radiologists.
4. **Multilingual Voice Assistant**:
   - Text-to-speech engine supporting spoken replies in **English**, **Kannada (`kn`)**, and **Hindi (`hi`)**.
   - Integrated playback controls: Play, Pause, Replay, and Stop.
   - Speech-to-text voice input via microphone for conversational question asking.
5. **Smart Healthcare Navigation**:
   - Direct patient assistance for checking doctor availability, lab investigation tracking status, and CT/MRI schedule milestones.
6. **Backend & Test Suite**:
   - REST endpoints: `POST /api/phase5/chat`, `POST /api/phase5/analyze-document`, `GET /api/phase5/navigation`.
   - 15 total unit tests passing across Phase 4 and Phase 5 (`npm test`).

---

## Safety & Clinical Protocol Boundary

- **Clinical Oversight**: CareBridge AI does **not** provide autonomous medical diagnoses or replace licensed clinical decision-making. Priority classifications are assigned and verified exclusively by qualified clinicians.
- **Synthetic Data**: All displayed patients, numbers, and test records are demonstrative dummy data.
- **Privacy & Role Scoping**: Role headers (`x-demo-role`, `x-demo-patient-id`) demonstrate role boundaries for prototyping and must be paired with production JWT/OAuth authentication in deployed environments.

---

## Technology Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS 3, Lucide React icons
- **Backend**: Node.js HTTP Server (`backend/server.js`), REST endpoints under `/api/phase4/*` and `/api/phase5/*`
- **Testing**: Node.js native test runner (`node --test backend/phase4.test.js backend/phase5.test.js`) — 15 passing tests

---

## How to Run the Project

### 1. Unified Launch (Recommended)
Starts both the backend API (port 5000) and frontend Vite server (port 5173) concurrently:
```sh
npm start
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser. All `/api` requests are automatically proxied to the backend.

### 2. Manual Terminal Launch
- **Terminal 1 (Backend API)**:
  ```sh
  node backend/server.js
  ```
- **Terminal 2 (Frontend Web App)**:
  ```sh
  npm run dev
  ```

### 3. Automated Tests & Build
- **Run Backend Tests (15 tests)**:
  ```sh
  npm test
  ```
- **Production Build Check**:
  ```sh
  npm run build
  ```

---

## Project Structure

```text
src/
  assets/           Static graphics and brand SVGs
  components/
    ui/             Reusable design system components (Button, Card, Input, Modal, etc.)
    triage/         Phase 2 symptom check-in and staff review queue
    investigations/ Phase 3 investigation lifecycle and delay tracking
    priority/       Phase 4 priority queues, details, alerts, and doctor availability
    assistant/      Phase 5 FloatingAssistant, VoiceControls, ImageUploadZone, DocumentAnalysisCard
  layouts/          Navbar, Footer, and Sidebar layouts
  pages/            LandingPage and role-based DashboardApp
  services/         API client for Phase 4 & Phase 5 endpoints
  styles/           Tailwind CSS configuration and design tokens
  i18n/             LanguageContext, English, Kannada, and Hindi translation dictionaries
  utils/            Theme constants and clinical triage rules
backend/
  server.js         HTTP server with reverse-proxy support (Phase 4 & Phase 5)
  models/           In-memory priority store, demo records, and wait calculators
  services/         Business logic, escalation engine, assistant service, and role validation
  controllers/      API route controllers (Priority & AI Assistant)
  routes/           REST router (/api/health, /api/phase4/*, /api/phase5/*)
  phase4.test.js    Automated test suite for Phase 4 (8 tests)
  phase5.test.js    Automated test suite for Phase 5 (7 tests)
```
