import { pino } from 'pino';
import { type Logger } from 'pino';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Ensure logs directory exists
const logsDir = join(process.cwd(), 'logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

// Create transports
const transports = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
      level: 'debug',
    },
    {
      target: 'pino/file',
      options: { destination: join(logsDir, 'app.log') },
      level: 'info',
    },
  ],
});

// Create and export logger
export const logger: Logger = pino(
  {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
  transports,
);
