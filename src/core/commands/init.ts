// src/core/commands/init.ts
import { parseSchema } from '../../parser/schema'
import { ConfigError } from '../errors'
import { DBFastConfig } from '../config'
import { ParsedSchema } from '../types'

export interface InitOptions {
  description: string
  database: DBFastConfig['database']['type']
  typescript?: boolean
}

export interface InitResult {
  schema: ParsedSchema
  config: {
    version: string
    environment: 'development' | 'staging' | 'production'
    database: {
      type: DBFastConfig['database']['type']
      database: string
    }
  }
}

export const initCommand = async (options: InitOptions): Promise<InitResult> => {
  try {
    const schema = parseSchema(options.description)
    return {
      schema,
      config: {
        version: '1.0.0',
        environment: 'development',
        database: {
          type: options.database,
          database: 'dev'
        }
      }
    }
  } catch (error) {
    throw new ConfigError('Failed to initialize', { error })
  }
}