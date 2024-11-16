// src/core/__tests__/errors.test.ts
import { DBFastError, ParseError, ValidationError } from '../errors'

describe('Error Handling', () => {
  it('creates base error correctly', () => {
    const error = new DBFastError('test error', 'PARSE_ERROR', { test: true })
    expect(error.name).toBe('DBFastError')
    expect(error.message).toBe('test error')
    expect(error.code).toBe('PARSE_ERROR')
    expect(error.context).toEqual({ test: true })
  })

  it('creates parse error with context', () => {
    const context = { input: 'test input' }
    const error = new ParseError('invalid syntax', context)
    expect(error.name).toBe('ParseError')
    expect(error.code).toBe('PARSE_ERROR')
    expect(error.context).toEqual(context)
  })

  it('creates validation error with context', () => {
    const context = { field: 'test' }
    const error = new ValidationError('invalid field', context)
    expect(error.name).toBe('ValidationError')
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.context).toEqual(context)
  })
})