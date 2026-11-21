// start.js - CareBridge AI Unified Server Runner
// Runs both the backend API and frontend Vite dev server concurrently under one unified workflow.

import { spawn } from 'node:child_process';

console.log('\n======================================================');
console.log('  CareBridge AI - Unified Platform Launcher');
console.log('======================================================\n');
console.log('• Backend API:      http://127.0.0.1:5000');
console.log('• Unified Web App:  http://127.0.0.1:5173');
console.log('  (Frontend automatically proxies all /api requests to backend)\n');
console.log('Launching services...\n');

const backend = spawn('node', ['backend/server.js'], {
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', '5173', '--configLoader', 'runner'], {
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  console.log('\n[CareBridge AI] Shutting down services...');
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
