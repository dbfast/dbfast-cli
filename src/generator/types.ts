// src/generator/types.ts
import { ParsedSchema } from '../core/types'

export const generateTypes = (schema: ParsedSchema): string => {
  // TODO: Implement proper TypeScript type generation
  return `
    // Generated TypeScript types
    ${schema.models.map(model => `
      export interface ${model.name} {
        id: number;
        // TODO: Add fields and relations
      }
    `).join('\n')}
  `
}