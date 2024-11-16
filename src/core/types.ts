// src/core/types.ts - Type definitions for the schema parser
import { z } from 'zod'

// BASE SCHEMAS
const DataTypeSchema = z.enum([
    'string', 'text', 'int', 'float', 'boolean', 
    'datetime', 'email', 'json', 'decimal',
    'uuid', 'enum', 'array', // Modern types
    'timestamp', 'date', 'time', // Time types
    'bigint', 'smallint', // Integer variants
    'varchar', 'char', // String variants
    'jsonb', // Binary JSON
    'point', 'polygon', // Geometric
    'inet', 'cidr', // Network types
    'xml', 'binary', 'blob', // Complex types
    'money', 'currency' // Financial types
  ])
  
export const ValidationRuleSchema = z.object({
type: z.enum(['min', 'max', 'pattern', 'custom']),
value: z.union([z.string(), z.number()]),
message: z.string().optional()
})
  
const FieldSchema = z.object({
name: z.string()
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
    message: 'field names must start with letter, use only letters/numbers/_'
    }),
type: DataTypeSchema,
required: z.boolean().default(true),
unique: z.boolean().default(false),
length: z.number().optional(),
precision: z.number().optional(),
scale: z.number().optional(),
enumValues: z.array(z.string()).optional(),
validation: z.array(ValidationRuleSchema).optional(),
default: z.any().optional(),
documentation: z.string().optional(),
typeOptions: z.record(z.any()).optional() // For type-specific config
})
// RELATIONS with better validation
const RelationSchema = z.object({
 type: z.enum(['belongs_to', 'has_many', 'many_to_many']),
 model: z.string(),
 foreignKey: z.string().optional(),
 through: z.string().optional(),
 onDelete: z.enum(['cascade', 'set_null', 'restrict']).optional(),
 onUpdate: z.enum(['cascade', 'set_null', 'restrict']).optional()
}).refine(data => {
 if (data.type === 'many_to_many' && !data.through) {
   throw new Error('many_to_many relations require through table')
 }
 return true
})

// MODEL with indexes
const IndexSchema = z.object({
 name: z.string().optional(),
 fields: z.array(z.string()),
 type: z.enum(['unique', 'fulltext', 'normal']).default('normal')
})

const ModelSchema = z.object({
 name: z.string(),
 fields: z.array(FieldSchema),
 relations: z.array(RelationSchema).optional(),
 indexes: z.array(IndexSchema).optional(),
 documentation: z.string().optional()
})

// FINAL SCHEMA
const ParsedSchemaSchema = z.object({
 version: z.string(),
 models: z.array(ModelSchema),
 config: z.record(z.any()).optional(),
 documentation: z.string().optional()
})

// TYPE EXPORTS
export type DataType = z.infer<typeof DataTypeSchema>
export type Field = z.infer<typeof FieldSchema>
export type Relation = z.infer<typeof RelationSchema>
export type Model = z.infer<typeof ModelSchema>
export type ParsedSchema = z.infer<typeof ParsedSchemaSchema>

// SCHEMA EXPORTS
export {
 DataTypeSchema,
 FieldSchema,
 RelationSchema,
 ModelSchema,
 ParsedSchemaSchema
}