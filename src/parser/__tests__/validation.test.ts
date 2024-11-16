// src/parser/__tests__/validation.test.ts
import { validateSchema, validateDatabaseCompatibility } from '../validation'
import { ValidationError } from '../../core/errors'
import { ParsedSchema } from '../../core/types'

describe('Schema Validation', () => {
  const validSchema: ParsedSchema = {
    version: '1.0',
    models: [{
      name: 'User',
      fields: [{
        name: 'email',
        type: 'string',
        required: true,
        unique: false
      }]
    }]
  }

  describe('Basic Schema Validation', () => {
    it('validates correct schema', () => {
      expect(() => validateSchema(validSchema)).not.toThrow()
    })

    it('catches duplicate model names', () => {
      const invalidSchema: ParsedSchema = {
        version: '1.0',
        models: [
          {
            name: 'User',
            fields: [{
              name: 'email', type: 'string', required: true,
              unique: false
            }]
          },
          {
            name: 'User',
            fields: [{
              name: 'name', type: 'string', required: true,
              unique: false
            }]
          }
        ]
      }
      expect(() => validateSchema(invalidSchema)).toThrow(ValidationError)
    })

    it('catches empty models', () => {
      const emptyModelSchema: ParsedSchema = {
        version: '1.0',
        models: [{
          name: 'Empty',
          fields: []
        }]
      }
      expect(() => validateSchema(emptyModelSchema)).toThrow(ValidationError)
    })

    it('validates model with relations', () => {
      const schemaWithRelations: ParsedSchema = {
        version: '1.0',
        models: [{
          name: 'Post',
          fields: [{
            name: 'title',
            type: 'string',
            required: true,
            unique: false
          }],
          relations: [{
            type: 'belongs_to',
            model: 'User',
            foreignKey: 'userId'
          }]
        }]
      }
      expect(() => validateSchema(schemaWithRelations)).not.toThrow()
    })
  })

  describe('Database Compatibility', () => {
    const dbConfig = {
      type: 'postgres' as const,
      database: 'test',
      ssl: false
    }

    it('validates database compatibility', () => {
      expect(() => 
        validateDatabaseCompatibility(validSchema, dbConfig)
      ).not.toThrow()
    })

    it('catches unsupported types', () => {
      const schemaWithInvalidType: ParsedSchema = {
        version: '1.0',
        models: [{
          name: 'Test',
          fields: [{
            name: 'field',
            type: 'unsupported' as any,
            required: true,
            unique: false
          }]
        }]
      }

      expect(() => 
        validateDatabaseCompatibility(schemaWithInvalidType, dbConfig)
      ).toThrow(ValidationError)
    })

    it('validates postgres-specific types', () => {
      const postgresSchema: ParsedSchema = {
        version: '1.0',
        models: [{
          name: 'Test',
          fields: [
            {
              name: 'jsonField',
              type: 'json',
              required: true,
              unique: false
            },
            {
              name: 'uuidField',
              type: 'uuid',
              required: true,
              unique: false
            }
          ]
        }]
      }
      expect(() => 
        validateDatabaseCompatibility(postgresSchema, dbConfig)
      ).not.toThrow()
    })

    it('validates with different database types', () => {
      const schema: ParsedSchema = {
        version: '1.0',
        models: [{
          name: 'Test',
          fields: [{
            name: 'field',
            type: 'string',
            required: true,
            unique: false
          }]
        }]
      }

      // Test with different DB types
      const configs = [
        { type: 'postgres' as const, database: 'test', ssl: false },
        { type: 'mysql' as const, database: 'test', ssl: false },
        { type: 'sqlite' as const, database: 'test', ssl: false }
      ]

      configs.forEach(config => {
        expect(() => 
          validateDatabaseCompatibility(schema, config)
        ).not.toThrow()
      })
    })
  })

  describe('Field Validation', () => {
    it('validates field constraints', () => {
      const schemaWithConstraints: ParsedSchema = {
        version: '1.0',
        models: [{
          name: 'User',
          fields: [{
            name: 'email',
            type: 'string',
            required: true,
            unique: true,
            validation: [{
              type: 'pattern',
              value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
              message: 'Invalid email format'
            }]
          }]
        }]
      }
      expect(() => validateSchema(schemaWithConstraints)).not.toThrow()
    })
  })
})