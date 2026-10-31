import path from 'path';
import express from 'express';
import { createApp } from './backend/src/app.js';
import { createServer as createViteServer } from 'vite';

const port = Number(process.env.PORT) || 3000;

async function bootstrap() {
  const app = createApp();

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🏥 Clinic AI Agent Full-Stack System running on port ${port}`);
    console.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
    console.log(`🩺 Health check endpoint: http://localhost:${port}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });

  const shutdown = (signal: string) => {
    console.log(`\nReceived ${signal}. Gracefully closing HTTP server...`);
    server.close(() => {
      console.log('HTTP server closed cleanly. Exiting process.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal error starting Clinic AI Agent server:', err);
  process.exit(1);
});
