// src/core/errors.ts
export type ErrorCode = 
  | 'PARSE_ERROR' 
  | 'VALIDATION_ERROR'
  | 'QUERY_ERROR'
  | 'MIGRATION_ERROR'
  | 'TYPE_ERROR'
  | 'CONFIG_ERROR'
  | 'GENERATION_ERROR'

export class DBFastError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'DBFastError'
  }
}

export class ParseError extends DBFastError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'PARSE_ERROR', context)
    this.name = 'ParseError'
  }
}

export class ValidationError extends DBFastError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context)
    this.name = 'ValidationError' 
  }
}

export class QueryError extends DBFastError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'QUERY_ERROR', context)
    this.name = 'QueryError'
  }
}

export class MigrationError extends DBFastError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'MIGRATION_ERROR', context)
    this.name = 'MigrationError'
  }
}

export class TypeError extends DBFastError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'TYPE_ERROR', context)
    this.name = 'TypeError'
  }
}

export class ConfigError extends DBFastError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIG_ERROR', context)
    this.name = 'ConfigError'
  }
}

export class GenerationError extends DBFastError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'GENERATION_ERROR', context)
    this.name = 'GenerationError'
  }
}