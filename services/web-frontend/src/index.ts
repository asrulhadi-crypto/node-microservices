import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { createLogger } from '@shared/utils';

const logger = createLogger('web-frontend');

const app: Application = express();
const PORT = Number(process.env.FRONTEND_PORT || 8080);
const HOST = process.env.FRONTEND_HOST || '0.0.0.0';
// Browser-reachable gateway URL. Override per environment
// (compose: http://localhost:3000, k3s/Devtron: gateway ingress URL).
const GATEWAY_PUBLIC_URL = process.env.GATEWAY_PUBLIC_URL || 'http://localhost:3000';
const GATEWAY_INTERNAL_URL =
  process.env.GATEWAY_INTERNAL_URL || process.env.GATEWAY_PUBLIC_URL || 'http://api-gateway:3000';

// Static assets live in dist/public (docker) or src/public (dev).
const candidates = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '..', 'services', 'web-frontend', 'src', 'public'),
  path.join(process.cwd(), 'services', 'web-frontend', 'src', 'public'),
];
const publicDir = candidates.find((p) => fs.existsSync(p)) ?? candidates[0];

app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Runtime config for the browser (no rebuild needed per environment).
app.get('/config.js', (_req: Request, res: Response) => {
  res.type('application/javascript');
  res.send(`window.__GATEWAY_URL__=${JSON.stringify(GATEWAY_PUBLIC_URL)};`);
});

// Health check for compose / k8s probes. Also reports gateway reachability.
app.get('/health', async (_req: Request, res: Response) => {
  let gateway = false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const r = await fetch(`${GATEWAY_INTERNAL_URL}/health`, { signal: ctrl.signal });
    gateway = r.ok;
    clearTimeout(t);
  } catch {
    gateway = false;
  }
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'web-frontend',
    version: '1.0.0',
    checks: { gateway },
  });
});

app.use(express.static(publicDir));

// SPA-style fallback to index for any non-API path.
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
app.listen(PORT, HOST, () => {
  logger.info(`🛍️ Web Frontend running on http://${HOST}:${PORT}`);
  logger.info(`🔗 Gateway (browser): ${GATEWAY_PUBLIC_URL}`);
});

export default app;
