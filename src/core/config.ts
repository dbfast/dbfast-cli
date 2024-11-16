// src/core/config.ts
import { z } from 'zod'
import { DataTypeSchema } from './types'

const DatabaseConfigSchema = z.object({
  type: z.enum(['postgres', 'mysql', 'sqlite']),
  url: z.string().url().optional(),
  host: z.string().optional(),
  port: z.number().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  database: z.string(),
  ssl: z.boolean().default(false)
})

const GeneratorConfigSchema = z.object({
  prisma: z.boolean().default(true),
  typescript: z.boolean().default(true),
  documentation: z.boolean().default(false),
  output: z.object({
    schema: z.string().default('prisma/schema.prisma'),
    types: z.string().default('src/generated/types.ts'),
    docs: z.string().default('docs/schema.md')
  }).default({})
})

const FeaturesConfigSchema = z.object({
  patterns: z.boolean().default(false),
  scanner: z.boolean().default(false),
  cache: z.object({
    enabled: z.boolean().default(false),
    storage: z.enum(['memory', 'redis']).default('memory'),
    ttl: z.number().default(3600)
  }).default({})
})

const DBFastConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  environment: z.enum(['development', 'staging', 'production'])
    .default('development'),
  database: DatabaseConfigSchema,
  generators: GeneratorConfigSchema.default({}),
  features: FeaturesConfigSchema.default({}),
  customTypes: z.record(DataTypeSchema).optional()
})

export type DBFastConfig = z.infer<typeof DBFastConfigSchema>

export const validateConfig = (config: unknown): DBFastConfig => {
  const result = DBFastConfigSchema.safeParse(config)
  
  if (!result.success) {
    throw new Error(`Invalid config: ${result.error.message}`)
  }
  
  return result.data
}

export const loadConfig = async (path: string): Promise<DBFastConfig> => {
  try {
    const config = await import(path)
    return validateConfig(config.default || config)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load config: ${error.message}`)
    } else {
      throw new Error('Failed to load config: Unknown error')
    }
  }
}

export const mergeConfigs = (
  base: DBFastConfig,
  override: Partial<DBFastConfig>
): DBFastConfig => {
  return validateConfig({
    ...base,
    ...override,
    database: { ...base.database, ...override.database },
    generators: { ...base.generators, ...override.generators },
    features: { ...base.features, ...override.features }
  })
}