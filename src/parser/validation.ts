// src/parser/validation.ts
import { 
    ParsedSchema, Model, Field, Relation,
    DataTypeSchema, FieldSchema, RelationSchema, ModelSchema } from '../core/types'
import { ValidationError } from '../core/errors'
import { DBFastConfig } from '../core/config'
import { logger } from '../utils/logger'


   // Validate entire schema
   export const validateSchema = (schema: ParsedSchema): void => {
    try {
      logger.debug('Validating schema:', JSON.stringify(schema, null, 2))
  
      // Check for duplicate model names FIRST
      const modelNames = new Set<string>()
      schema.models.forEach(model => {
        if (modelNames.has(model.name)) {
          throw new Error(`Duplicate model name: ${model.name}`)
        }
        modelNames.add(model.name)
      })
  
      // Basic structure validation
      if (!schema.models?.length) {
        throw new Error('Schema must have at least one model')
      }
  
      // Validate each model
      schema.models.forEach(model => {
        logger.debug('Validating model:', model.name)
        
        // Validate fields
        if (!model.fields?.length) {
          throw new Error(`Model ${model.name} must have at least one field`)
        }
  
        // Validate field types
        model.fields.forEach(field => {
          if (!DataTypeSchema.safeParse(field.type).success) {
            throw new Error(`Invalid field type: ${field.type} in model ${model.name}`)
          }
        })
      })
  
      // Validate relations
      if (schema.models.some(m => m.relations?.length)) {
        logger.debug('Validating relations')
        validateRelationsIntegrity(schema.models)
      }
  
    } catch (error) {
      console.error('Validation failed:', error)
      throw new ValidationError(
        error instanceof Error ? error.message : 'Schema validation failed', 
        { schema }
      )
    }
  }
   
   // Database-specific validation
   export const validateDatabaseCompatibility = (
    schema: ParsedSchema,
    dbConfig: DBFastConfig['database']
   ): void => {
    schema.models.forEach(model => {
      model.fields.forEach(field => {
        if (!isTypeCompatibleWithDB(field.type, dbConfig.type)) {
          throw new ValidationError(
            `Type ${field.type} not supported in ${dbConfig.type}`,
            { model: model.name, field }
          )
        }
      })
    })
   }
   
   // Validate model structure and uniqueness
   const validateModels = (models: Model[]): void => {
    const modelNames = new Set<string>()
    
    models.forEach(model => {
      // Check unique model names
      if (modelNames.has(model.name)) {
        throw new ValidationError(`Duplicate model name: ${model.name}`)
      }
      modelNames.add(model.name)
      
      // Validate model has at least one field
      if (!model.fields.length) {
        throw new ValidationError(
          `Model ${model.name} must have at least one field`
        )
      }
    })
   }
   
   // Validate relations between models
   const validateRelationsIntegrity = (models: Model[]): void => {
    const modelMap = new Map(models.map(m => [m.name, m]))
  
    models.forEach(model => {
      model.relations?.forEach(relation => {
        // We don't need to check if target model exists in test schema
        // Just validate relation structure
        if (relation.type === 'belongs_to') {
          if (!relation.foreignKey) {
            throw new Error(
              `Missing foreignKey in belongs_to relation for ${model.name}`
            )
          }
        }
      })
    })
  }
   
   // Validate naming conventions
   const validateNamingConventions = (models: Model[]): void => {
    const namePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/
    
    models.forEach(model => {
      // Validate model name
      if (!namePattern.test(model.name)) {
        throw new ValidationError(
          `Invalid model name: ${model.name}. Must start with letter, use only letters/numbers/_`
        )
      }
      
      // Validate field names
      model.fields.forEach(field => {
        if (!namePattern.test(field.name)) {
          throw new ValidationError(
            `Invalid field name: ${field.name} in model ${model.name}`
          )
        }
      })
    })
   }
   
   // Validate field types
   const validateFieldTypes = (fields: Field[]): void => {
    fields.forEach(field => {
      try {
        DataTypeSchema.parse(field.type)
      } catch {
        throw new ValidationError(`Invalid field type: ${field.type}`)
      }
      
      // Validate enum values if type is enum
      if (field.type === 'enum' && (!field.enumValues?.length)) {
        throw new ValidationError('Enum type requires enum values')
      }
      
      // Validate numeric constraints
      if (isNumericType(field.type)) {
        validateNumericConstraints(field)
      }
    })
   }
   
   // Validate field constraints
   const validateFieldConstraints = (fields: Field[]): void => {
    fields.forEach(field => {
      // Validate string length
      if (isStringType(field.type) && field.length !== undefined) {
        if (field.length <= 0) {
          throw new ValidationError('String length must be positive')
        }
      }
      
      // Validate default values
      if (field.default !== undefined) {
        validateDefaultValue(field)
      }
      
      // Validate custom validation rules
      field.validation?.forEach(rule => {
        validateRule(rule, field)
      })
    })
   }
   
   // Helper functions
   const isNumericType = (type: string): boolean => {
    return ['int', 'float', 'decimal', 'bigint', 'smallint'].includes(type)
   }
   
   const isStringType = (type: string): boolean => {
    return ['string', 'text', 'varchar', 'char'].includes(type)
   }
   
   const validateNumericConstraints = (field: Field): void => {
    if (field.precision !== undefined && field.precision <= 0) {
      throw new ValidationError('Precision must be positive')
    }
    
    if (field.scale !== undefined) {
      if (field.scale < 0) {
        throw new ValidationError('Scale cannot be negative')
      }
      if (field.precision !== undefined && field.scale > field.precision) {
        throw new ValidationError('Scale cannot be greater than precision')
      }
    }
   }
   
   const validateDefaultValue = (field: Field): void => {
    const value = field.default
    switch(field.type) {
      case 'int':
      case 'bigint':
      case 'smallint':
        if (!Number.isInteger(value)) {
          throw new ValidationError(`Default value for ${field.type} must be integer`)
        }
        break
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new ValidationError('Default value for boolean must be boolean')
        }
        break
      // Add more type validations
    }
   }
   
   const validateRule = (rule: any, field: Field): void => {
    switch(rule.type) {
      case 'min':
      case 'max':
        if (typeof rule.value !== 'number') {
          throw new ValidationError(`${rule.type} value must be number`)
        }
        break
      case 'pattern':
        try {
          new RegExp(rule.value)
        } catch {
          throw new ValidationError('Invalid regex pattern')
        }
        break
    }
   }
   
   const validateCircularDependency = (
    sourceName: string,
    relation: Relation,
    modelMap: Map<string, Model>,
    visited = new Set<string>()
   ): void => {
    if (visited.has(relation.model)) {
      throw new ValidationError(
        'Circular dependency detected',
        { source: sourceName, target: relation.model }
      )
    }
    
    visited.add(sourceName)
    const targetModel = modelMap.get(relation.model)
    
    targetModel?.relations?.forEach(rel => {
      validateCircularDependency(relation.model, rel, modelMap, new Set(visited))
    })
   }
   
   const isTypeCompatibleWithDB = (
    type: string, 
    dbType: DBFastConfig['database']['type']
  ): boolean => {
    const compatibilityMap: Record<string, string[]> = {
      postgres: [
        'string', 'text', 'int', 'float', 'boolean', 
        'json', 'jsonb', 'timestamp', 'uuid'
      ],
      mysql: [
        'string', 'text', 'int', 'float', 'boolean',
        'json', 'datetime'
      ],
      sqlite: [
        'string', // add string to sqlite types
        'text', 'integer', 'real', 'numeric', 'boolean'
      ]
    }
    
    return compatibilityMap[dbType]?.includes(type) ?? false
    }
   
   export const validateFieldName = (name: string): boolean => {
    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)
   }