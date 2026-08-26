import { Request, Response } from 'express';
import { ServiceHealth } from '@shared/utils';
import { pool } from '../database';

export const healthController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const health: ServiceHealth = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'order-service',
    version: '1.0.0',
    checks: {},
  };

  // Check database connection
  try {
    await pool.query('SELECT 1');
    health.checks.database = true;
  } catch (error) {
    health.checks.database = false;
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(health);
};

export const metricsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const promClient = await import('prom-client');
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
};
