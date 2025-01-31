import pino from 'pino';

const transports = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
      level: 'debug'
    },
    {
      target: 'pino/file',
      options: { destination: './logs/app.log' },
      level: 'info'
    }
  ]
});

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}, transports);