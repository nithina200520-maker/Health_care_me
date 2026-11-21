// backend/config/index.js
// Configuration module stub for database, JWT, and third-party API keys (e.g. Gemini).
export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/carebridge',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-carebridge',
};
