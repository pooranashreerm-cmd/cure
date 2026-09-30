import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { config } from './src/server/config';
import apiRoutes from './src/server/routes';
import { errorHandler } from './src/server/middleware/errorHandler';
import { socketService } from './src/server/services/socketService';
import { BackgroundJobScheduler } from './src/server/jobs/scheduler';
import { runCureviaBackendTests } from './src/server/tests/api.test';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Trust proxy for reverse proxies (nginx, Cloud Run, load balancers)
  app.set('trust proxy', 1);

  // Security Headers & CORS
  app.use(
    helmet({
      contentSecurityPolicy: false, // Permit inline resources and frontend assets in dev
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Rate Limiter with proxy safety
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    validate: { xForwardedForHeader: false, forwardedHeader: false },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded.' } },
  });
  app.use('/api/', globalLimiter);

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads and animated assets
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  app.use(
    '/ezgif-4c836045c5bb5d2d-jpg',
    express.static(path.join(process.cwd(), 'public', 'ezgif-4c836045c5bb5d2d-jpg'))
  );

  // Health check
  app.get(['/health', '/api/health'], (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'Curevia Backend API',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Automated Integration & Unit Tests trigger
  app.get('/api/test/run', async (req, res) => {
    const results = await runCureviaBackendTests();
    res.status(200).json({
      success: true,
      message: 'Curevia Backend test suite executed successfully.',
      results,
    });
  });

  // Mount API Gateway
  app.use('/api', apiRoutes);

  // Central Error Handler for API
  app.use(errorHandler);

  // Initialize WebSockets
  socketService.init(server);

  // Start background job engine
  BackgroundJobScheduler.start();

  // Vite Middleware for Frontend Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`  🩺 Curevia Healthcare Platform Running on Port ${PORT}`);
    console.log(`  🔗 Health Check: http://localhost:${PORT}/health`);
    console.log(`  📄 OpenAPI Specs: http://localhost:${PORT}/api/docs/openapi.json`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('[Fatal Error] Server failed to start:', err);
});
