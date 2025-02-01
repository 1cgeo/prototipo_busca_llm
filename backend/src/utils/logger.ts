import { pino } from 'pino';
import { type Logger } from 'pino';

// Criamos o transport como antes
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
      options: { destination: './logs/app.log' },
      level: 'info',
    },
  ],
});

// Declaramos explicitamente o tipo Logger
export const logger: Logger = pino(
  {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
  transports,
);
