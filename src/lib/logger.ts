// src/lib/logger.ts
import { LogLevel } from './settings';

const LOG_LEVEL_PRIORITIES: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export class Logger {
  private static logLevel: LogLevel = 'info';

  constructor(private context: string) {}

  static setLogLevel(level: LogLevel) {
    Logger.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITIES[level] <= LOG_LEVEL_PRIORITIES[Logger.logLevel];
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog('debug')) {
      console.debug(`[${this.context}] ${message}`, ...args);
    }
  }

  log(message: string, ...args: any[]) {
    if (this.shouldLog('info')) {
      console.log(`[${this.context}] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(`[${this.context}] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(`[${this.context}] ${message}`, ...args);
    }
  }
}