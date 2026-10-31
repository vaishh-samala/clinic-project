import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏥 Clinic AI Agent Backend running on port ${env.PORT}`);
  console.log(`📖 Interactive API Documentation: http://localhost:${env.PORT}/api/docs`);
  console.log(`🩺 Health check endpoint: http://localhost:${env.PORT}/api/health`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`=======================================================`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Gracefully closing HTTP server...`);
  server.close(() => {
    console.log('HTTP server closed cleanly. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after 10s timeout
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
