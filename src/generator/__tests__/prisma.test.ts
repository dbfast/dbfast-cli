// src/generator/__tests__/prisma.test.ts
import { generatePrisma } from '../prisma'
import { ParsedSchema } from '../../core/types'

describe('Prisma Generator', () => {
  it('generates valid prisma schema', () => {
    const schema: ParsedSchema = {
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
    
    const result = generatePrisma(schema)
    expect(result).toContain('model User {')
    expect(result).toContain('email String')
  })

  it('handles relations', () => {
    const schema: ParsedSchema = {
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
    
    const result = generatePrisma(schema)
    expect(result).toContain('userId Int')
    expect(result).toContain('@relation')
  })

  it('handles field attributes', () => {
    const schema: ParsedSchema = {
      version: '1.0',
      models: [{
        name: 'User',
        fields: [{
          name: 'email',
          type: 'string',
          required: true,
          unique: true
        }]
      }]
    }
    
    const result = generatePrisma(schema)
    expect(result).toContain('@unique')
  })
})