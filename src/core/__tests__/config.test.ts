import { validateConfig, loadConfig, mergeConfigs } from '../config'
import { ConfigError } from '../errors'

describe('Config Validation', () => {
  it('validates correct config', () => {
    const validConfig = {
      version: '1.0.0',
      environment: 'development',
      database: {
        type: 'postgres' as const,
        database: 'test',
        ssl: false
      }
    }
    expect(() => validateConfig(validConfig)).not.toThrow()
  })
})

// src/core/__tests__/errors.test.ts
import { DBFastError, ParseError, ValidationError } from '../errors'

describe('Error Handling', () => {
  it('creates custom error with context', () => {
    const error = new DBFastError('test error', 'PARSE_ERROR', { test: true })
    expect(error.message).toBe('test error')
    expect(error.code).toBe('PARSE_ERROR')
    expect(error.context).toEqual({ test: true })
  })
})