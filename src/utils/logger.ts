// src/utils/logger.ts
/* eslint-disable no-console */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogColor = '\x1b[34m' | '\x1b[32m' | '\x1b[33m' | '\x1b[31m'

interface Logger {
 debug: (...args: unknown[]) => void
 info: (...args: unknown[]) => void
 warn: (...args: unknown[]) => void
 error: (...args: unknown[]) => void
}

const COLORS: Record<LogLevel, LogColor> = {
 debug: '\x1b[34m', // blue
 info: '\x1b[32m',  // green
 warn: '\x1b[33m',  // yellow
 error: '\x1b[31m'  // red
}

const RESET = '\x1b[0m'

const formatMessage = (level: LogLevel, ...args: unknown[]): unknown[] => {
 const timestamp = new Date().toISOString()
 const color = COLORS[level]
 return [
   `${color}[${timestamp}] [${level.toUpperCase()}]${RESET}`,
   ...args
 ]
}

export const logger: Logger = {
 debug: (...args: unknown[]): void => {
   if (process.env.NODE_ENV !== 'production') {
     console.log(...formatMessage('debug', ...args))
   }
 },
 info: (...args: unknown[]): void => {
   if (process.env.NODE_ENV !== 'production') {
     console.info(...formatMessage('info', ...args))
   }
 },
 warn: (...args: unknown[]): void => 
   console.warn(...formatMessage('warn', ...args)),
 error: (...args: unknown[]): void => 
   console.error(...formatMessage('error', ...args))
}