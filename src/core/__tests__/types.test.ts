// src/core/__tests__/types.test.ts
import { 
    DataTypeSchema, 
    FieldSchema,
    ModelSchema 
  } from '../types'
  
  describe('Core Types', () => {
    describe('DataTypeSchema', () => {
      it('validates correct types', () => {
        expect(() => DataTypeSchema.parse('string')).not.toThrow()
        expect(() => DataTypeSchema.parse('int')).not.toThrow()
        expect(() => DataTypeSchema.parse('boolean')).not.toThrow()
      })
  
      it('rejects invalid types', () => {
        expect(() => DataTypeSchema.parse('invalid')).toThrow()
      })
    })
  
    describe('FieldSchema', () => {
      it('validates correct field', () => {
        const field = {
          name: 'title',
          type: 'string',
          required: true
        }
        expect(() => FieldSchema.parse(field)).not.toThrow()
      })
  
      it('validates enum field with values', () => {
        const field = {
          name: 'status',
          type: 'enum',
          enumValues: ['DRAFT', 'PUBLISHED']
        }
        expect(() => FieldSchema.parse(field)).not.toThrow()
      })
    })
  })