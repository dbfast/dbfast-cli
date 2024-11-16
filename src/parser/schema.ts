// src/parser/schema.ts
import { 
    ParsedSchema, DataType, Field, Model, ValidationRuleSchema,
    DataTypeSchema, FieldSchema, ModelSchema 
   } from '../core/types'
import * as z from 'zod'
   import { ParseError, ValidationError } from '../core/errors'
   import { validateRelations, parseRelationLine } from './relations'
   
   // Main parser function
   export const parseSchema = (input: string): ParsedSchema => {
    try {
      const normalized = input
        .replace(/\s+/g, ' ')
        .trim()
  
      console.log('Input:', JSON.stringify(normalized))
      const modelMatch = normalized.match(/(\w+)\s+has:\s*([\s\S]+)/)
      if (!modelMatch) {
        throw new ParseError('Invalid model syntax', { input })
      }
  
      const [_, name, body] = modelMatch
      console.log('Model:', name)
      console.log('Body:', JSON.stringify(body))
  
      // FIX: Split on actual dashes
      const fieldLines = body.split('-')
        .map(line => line.trim())
        .filter(Boolean)  // Remove empty lines
        .map(line => `-${line}`)  // Add dash back
      
      console.log('Field Lines:', fieldLines)
  
      const fields = fieldLines
        .filter(line => line.includes('('))  // Only parse lines with type definitions
        .map(line => parseFieldLine(line))
      
      const relations = fieldLines
        .filter(line => line.includes('connects to'))
        .map(line => parseRelationLine(line))
  
      console.log('Parsed Fields:', fields)
      console.log('Parsed Relations:', relations)
  
      return {
        version: '1.0',
        models: [{
          name,
          fields,
          relations: relations.length > 0 ? relations : undefined
        }]
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new ParseError(error.message, { input })
      }
      throw error
    }
  }
  
   
   // Parse a single model block
   const parseModelBlock = (block: string): Model => {
    // fix regex to handle our test format
    const matches = block.match(/^\s*(\w+)\s+has:\s*([\s\S]+)$/)
    if (!matches) {
      throw new ParseError('Invalid model syntax', { block })
    }
  
    const [_, name, body] = matches
    const lines = body.split('\n').map(l => l.trim()).filter(Boolean)
    
    const fields: Field[] = []
    const relations: any[] = []
  
    lines.forEach(line => {
      if (line.includes('connects to')) {
        relations.push(parseRelationLine(line))
      } else if (line.startsWith('-')) {
        fields.push(parseFieldLine(line))
      }
    })
  
    return { name, fields, relations: relations.length ? relations : undefined }
  }
   
   // Enhanced field parsing
   const parseFieldLine = (line: string): Field => {
    // match: - title (text)
    const matches = line.match(/^\s*-\s*(\w+)\s*\((\w+)\)/)
    if (!matches) {
      throw new ParseError('Invalid field syntax', { line })
    }
  
    const [_, name, type] = matches
    const fieldType = parseFieldType(type)
  
    return {
      name,
      type: fieldType,
      required: true,
      unique: false
    }
  }
  
  const parseFieldType = (type: string): DataType => {
    const normalized = type.toLowerCase()
    try {
      return DataTypeSchema.parse(normalized)
    } catch {
      throw new ParseError(`Invalid field type: ${type}`)
    }
  }
   
  // Parse numeric value
  const parseNumericValue = (value: string): number => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new ParseError(`Invalid numeric value: ${value}`);
    }
    return num;
  }
  
  // Enhanced field options parsing
  const parseFieldOptions = (options?: string) => {
    if (!options) return {}
   
    const parsed: Record<string, any> = {}
    options.split(',').forEach(opt => {
      const [key, value] = opt.split('=').map(s => s.trim())
      switch(key) {
        case 'length':
          parsed.length = parseInt(value)
          break
        case 'required':
          parsed.required = value === 'true'
          break
        case 'unique':
          parsed.unique = value === 'true'
          break
        case 'default':
          parsed.default = parseDefaultValue(value)
          break
        // New options
        case 'min':
        case 'max':
          parsed.validation = parsed.validation || []
          parsed.validation.push({
            type: key,
            value: parseNumericValue(value)
          })
          break
        case 'pattern':
          parsed.validation = parsed.validation || []
          parsed.validation.push({
            type: 'pattern',
            value: value.replace(/^["'](.*)["']$/, '$1')
          })
          break
      }
    })
    return parsed
   }
   
   // Type-specific options parsing
   const parseTypeSpecificOptions = (type: string, options?: string) => {
    if (!options) return {}
    
    const parsed: Record<string, any> = {}
    const normalized = type.toLowerCase()
   
    if (normalized === 'enum') {
      parsed.enumValues = parseEnumValues(options)
    }
   
    if (isNumericType(normalized)) {
      const [precision, scale] = parsePrecisionScale(options)
      if (precision) parsed.precision = precision
      if (scale) parsed.scale = scale
    }
   
    return parsed
   }
   
   // Validation rules parsing
   const parseFieldExtras = (extras: string) => {
    const parsed: Record<string, any> = {}
    
    // Validation rules
    if (extras.includes('@validate')) {
      parsed.validation = parsed.validation || []
      const rules = extras.match(/@validate\s*\((.*?)\)/g) || []
      rules.forEach(rule => {
        const ruleContent = rule.match(/@validate\s*\((.*?)\)/)![1]
        parsed.validation.push(parseValidationRule(ruleContent))
      })
    }
    
    // Documentation
    if (extras.includes('@doc')) {
      const docMatch = extras.match(/@doc\s*"([^"]*)"/)
      if (docMatch) parsed.documentation = docMatch[1]
    }
   
    return parsed
   }
   
   // Helper functions
   const parseValidationRule = (rule: string): z.infer<typeof ValidationRuleSchema> => {
    const matches = rule.match(/(\w+)\((.*)\)/)
    if (!matches) {
      throw new ParseError('Invalid validation rule syntax', { rule })
    }
   
    return {
      type: matches[1] as any,
      value: parseRuleValue(matches[2]),
      message: `Invalid ${matches[1]} value`
    }
   }
   
   const parseRuleValue = (value: string): string | number => {
    if (value.match(/^["'](.*)["']$/)) {
      return value.replace(/^["'](.*)["']$/, '$1')
    }
    const num = parseFloat(value)
    return isNaN(num) ? value : num
   }
   
   const parseEnumValues = (options: string): string[] => {
    return options.split(',')
      .map(v => v.trim())
      .filter(Boolean)
      .map(v => v.replace(/^["'](.*)["']$/, '$1'))
   }
   
   const parsePrecisionScale = (options: string): [number?, number?] => {
    const matches = options.match(/(\d+)(?:,(\d+))?/)
    if (!matches) return []
    return [
      matches[1] ? parseInt(matches[1]) : undefined,
      matches[2] ? parseInt(matches[2]) : undefined
    ]
   }
   
   const validateFieldCompatibility = (field: Field) => {
    // Validate default value type
    if (field.default !== undefined) {
      validateDefaultValue(field.type, field.default)
    }
   
    // Validate enum values
    if (field.type === 'enum' && !field.enumValues?.length) {
      throw new ValidationError('Enum type requires enum values')
    }
   
    // Validate numeric constraints
    if (isNumericType(field.type)) {
      validateNumericConstraints(field)
    }
   
    // Validate string length
    if (isStringType(field.type) && field.length !== undefined) {
      if (field.length <= 0) {
        throw new ValidationError('String length must be positive')
      }
    }
   }
   
   const validateSchemaIntegrity = (models: Model[]) => {
    // Check duplicate models
    const modelNames = new Set<string>()
    models.forEach(model => {
      if (modelNames.has(model.name)) {
        throw new ValidationError(`Duplicate model name: ${model.name}`)
      }
      modelNames.add(model.name)
    })
   
    // Validate relations
    validateRelations(models)
   }
   
   // Type checking helpers
   const isNumericType = (type: string): boolean => {
    return ['int', 'float', 'decimal', 'bigint', 'smallint'].includes(type)
   }
   
   const isStringType = (type: string): boolean => {
    return ['string', 'text', 'varchar', 'char'].includes(type)
   }
   
   const validateDefaultValue = (type: DataType, value: any) => {
    // Add type-specific validation
    switch(type) {
      case 'int':
      case 'bigint':
      case 'smallint':
        if (!Number.isInteger(value)) {
          throw new ValidationError(`Default value for ${type} must be integer`)
        }
        break
      // Add more type validations
    }
   }
   
   const validateNumericConstraints = (field: Field) => {
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
   
   export const parseDefaultValue = (value: string): any => {
    if (value === 'null') return null
    if (value === 'true') return true
    if (value === 'false') return false
    if (value.match(/^\d+$/)) return parseInt(value)
    if (value.match(/^\d*\.\d+$/)) return parseFloat(value)
    return value.replace(/^["'](.*)["']$/, '$1')
   }