// src/parser/commands/validate.ts
import { ParsedSchema } from '../../core/types'
import { DBFastConfig } from '../../core/config'
import { ValidationError } from '../../core/errors'

export interface ValidateOptions {
 schema: ParsedSchema
 config: DBFastConfig
}

// Validate schema structure and types
const validateSchema = (schema: ParsedSchema) => {
 // Check model names are unique
 const modelNames = new Set<string>()
 for (const model of schema.models) {
   if (modelNames.has(model.name)) {
     throw new ValidationError(`Duplicate model name: ${model.name}`)
   }
   modelNames.add(model.name)
 }

 // Validate relations
 schema.models.forEach(model => {
   model.relations?.forEach(relation => {
     // Check related model exists
     if (!schema.models.find(m => m.name === relation.model)) {
       throw new ValidationError(
         `Related model ${relation.model} not found`,
         { model: model.name }
       )
     }
   })
 })
}

// Check database compatibility
const validateDatabaseCompatibility = (
 schema: ParsedSchema,
 config: DBFastConfig
) => {
 const dbType = config.database.type

 // Check type compatibility
 schema.models.forEach(model => {
   model.fields.forEach(field => {
     if (!isTypeSupported(field.type, dbType)) {
       throw new ValidationError(
         `Type ${field.type} not supported in ${dbType}`,
         { model: model.name, field: field.name }
       )
     }
   })
 })
}

// Helper to check type support
const isTypeSupported = (
 type: string,
 dbType: DBFastConfig['database']['type']
): boolean => {
 const supportedTypes: Record<string, string[]> = {
   postgres: ['text', 'varchar', 'int', 'float', 'boolean', 'json', 'timestamp'],
   mysql: ['text', 'varchar', 'int', 'float', 'boolean', 'json', 'datetime'],
   sqlite: ['text', 'integer', 'real', 'blob', 'numeric']
 }

 return supportedTypes[dbType]?.includes(type) ?? false
}

export const validateCommand = async (options: ValidateOptions) => {
 try {
   validateSchema(options.schema)
   validateDatabaseCompatibility(options.schema, options.config)
   return true
 } catch (error) {
   throw new ValidationError('Schema validation failed', { error })
 }
}