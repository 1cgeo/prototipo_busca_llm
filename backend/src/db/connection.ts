import pgPromise from 'pg-promise';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const pgp = pgPromise({
  error: (err, e) => {
    logger.error('Database error:', { error: err, context: e.query });
  },
});

export const db = pgp({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: 30,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
