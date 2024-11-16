// src/parser/__tests__/schema.test.ts
import { parseSchema } from '../schema'
import { ParseError } from '../../core/errors'

describe('Schema Parser', () => {
    it('parses basic model', () => {
      const input = `Post has:
  - title (text)
  - content (text)`  // removed extra whitespace
  
      const result = parseSchema(input)
      expect(result.models[0].name).toBe('Post')
      expect(result.models[0].fields).toHaveLength(2)
      expect(result.models[0].fields[0]).toEqual({
        name: 'title',
        type: 'text',
        required: true,
        unique: false
      })
      expect(result.models[0].fields[1]).toEqual({
        name: 'content',
        type: 'text',
        required: true,
        unique: false
      })
    })
  })