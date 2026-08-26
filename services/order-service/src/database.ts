import { Pool } from 'pg';
import { createLogger } from '@shared/utils';

const logger = createLogger('order-service:db');

export const pool = new Pool({
  host: process.env.ORDER_DB_HOST || 'localhost',
  port: parseInt(process.env.ORDER_DB_PORT || '5432'),
  database: process.env.ORDER_DB_NAME || 'microservices_order',
  user: process.env.ORDER_DB_USER || 'postgres',
  password: process.env.ORDER_DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query error', { text, error });
    throw error;
  }
};
