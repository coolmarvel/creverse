import { mkdirSync } from 'fs';
import * as winston from 'winston';
import * as moment from 'moment-timezone';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const { combine, printf } = winston.format;

const timezone = () => moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');

const customFormat = printf(({ level, message, timestamp, ...meta }: { level: string; message: unknown; timestamp?: unknown } & Record<string, unknown>) => {
  let safeTs: string;
  if (typeof timestamp === 'string') safeTs = timestamp;
  else if (timestamp === undefined || timestamp === null) safeTs = '';
  else safeTs = String(timestamp);
  const safeMsg = typeof message === 'string' ? message : JSON.stringify(message);
  const payload = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${safeTs} [${level}]: ${safeMsg}${payload}`;
});

try {
  mkdirSync('logs/error', { recursive: true });
  mkdirSync('logs', { recursive: true });
} catch {
  /* noop */
}

export const fileLogger = winston.createLogger({
  level: 'info',
  format: combine(winston.format.timestamp({ format: timezone }), customFormat),
  transports: [
    new winston.transports.Console({}),
    new DailyRotateFile({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      dirname: 'logs',
      filename: `%DATE%.log`,
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      handleExceptions: true,
    }),
    new DailyRotateFile({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: 'logs/error',
      filename: `%DATE%.error.log`,
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      handleExceptions: true,
    }),
  ],
});

export const logInfo = (message: string, meta?: Record<string, unknown>) => fileLogger.log({ level: 'info', message, ...(meta || {}) });
export const logError = (message: string, meta?: Record<string, unknown>) => fileLogger.log({ level: 'error', message, ...(meta || {}) });
export const logWarn = (message: string, meta?: Record<string, unknown>) => fileLogger.log({ level: 'warn', message, ...(meta || {}) });
