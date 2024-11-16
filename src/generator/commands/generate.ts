import { ParsedSchema } from '../../core/types'
import { GenerationError } from '../../core/errors'
import { generatePrisma } from '../prisma'
import { generateTypes } from '../types'
import { generateMigration } from '../migrations'

export interface GenerateOptions {
  type: 'prisma' | 'types' | 'migration'
  schema: ParsedSchema
}

export const generateCommand = async (options: GenerateOptions): Promise<string> => {
  try {
    switch (options.type) {
      case 'prisma':
        return generatePrisma(options.schema)
      case 'types':
        return generateTypes(options.schema)
      case 'migration':
        return generateMigration(options.schema)
    }
  } catch (error) {
    throw new GenerationError(`Failed to generate ${options.type}`, { error })
  }
}