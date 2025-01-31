import pgPromise from 'pg-promise';
import { config } from '@/config';
import { logger } from '@/utils/logger';

// Configurações do pg-promise
const pgp = pgPromise({
  // Eventos de log
  error: (err, e) => {
    logger.error('Database error:', { error: err, context: e.query });
  }
});

// Conecta ao banco de dados
export const db = pgp({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  // Configurações adicionais de conexão
  max: 30, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo máximo que uma conexão pode ficar ociosa
  connectionTimeoutMillis: 2000, // tempo máximo para estabelecer uma conexão
});