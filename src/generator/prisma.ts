// src/generator/prisma.ts
import { ParsedSchema } from '../core/types'
import { Relation } from '../core/types'

export const generatePrisma = (schema: ParsedSchema): string => {
    return `
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  
  generator client {
    provider = "prisma-client-js"
  }
  
  ${schema.models.map(model => `model ${model.name} {
    id Int @id @default(autoincrement())
    ${model.fields.map(field => `${field.name} ${mapToPrismaType(field.type)}${field.unique ? ' @unique' : ''}`).join('\n  ')}
    ${model.relations?.map(relation => generateRelation(relation)).join('\n  ') || ''}
  }`).join('\n\n')}
  `
  }
  
  const mapToPrismaType = (type: string): string => {
    const typeMap: Record<string, string> = {
      string: 'String',
      text: 'String',
      int: 'Int',
      float: 'Float',
      boolean: 'Boolean',
      datetime: 'DateTime',
      // add more types
    }
    return typeMap[type] || 'String'
  }
  
  const generateRelation = (relation: Relation): string => {
    if (relation.type === 'belongs_to') {
      return `${relation.model.toLowerCase()}Id Int
    ${relation.model.toLowerCase()} ${relation.model} @relation(fields: [${relation.model.toLowerCase()}Id], references: [id])`
    }
    return ''
  }

