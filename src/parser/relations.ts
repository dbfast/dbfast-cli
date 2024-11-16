// src/parser/relations.ts
import { Model, Relation } from '../core/types'
import { ValidationError } from '../core/errors'

export const validateRelations = (models: Model[]) : void => {
  const modelMap = new Map(models.map(m => [m.name, m]))

  models.forEach(model => {
    model.relations?.forEach(relation => {
      validateRelation(relation, model.name, modelMap)
    })
  })

  // check for circular dependencies
  checkCircularDependencies(models)
}

export const parseRelationLine = (line: string): Relation => {
  // handle relation syntax: field -> Model or field -> Model through JoinTable
  const matches = line.match(
    /^(\w+)\s*->\s*(\w+)(?:\s+through\s+(\w+))?(?:\s+@(.+))?$/
  )
  
  if (!matches) {
    throw new ValidationError('Invalid relation syntax', { line })
  }

  const [_, fieldName, targetModel, throughTable, options] = matches

  const relation: Partial<Relation> = {
    type: throughTable ? 'many_to_many' : 'belongs_to',
    model: targetModel,
    foreignKey: fieldName
  }

  if (throughTable) {
    relation.through = throughTable
  }

  if (options) {
    parseRelationOptions(relation, options)
  }

  return relation as Relation
}

const validateRelation = (
  relation: Relation,
  sourceModel: string,
  modelMap: Map<string, Model>
) : void => {
  // check target model exists
  if (!modelMap.has(relation.model)) {
    throw new ValidationError(
      `Related model not found: ${relation.model}`,
      { sourceModel, relation }
    )
  }

  // validate through table for m2m
  if (relation.type === 'many_to_many') {
    if (!relation.through) {
      throw new ValidationError(
        'Many-to-many relation requires through table',
        { sourceModel, relation }
      )
    }
    if (!modelMap.has(relation.through)) {
      throw new ValidationError(
        `Through table not found: ${relation.through}`,
        { sourceModel, relation }
      )
    }
  }

  // validate foreign key naming
  if (relation.foreignKey) {
    const targetModel = modelMap.get(relation.model)!
    if (!targetModel.fields.some(f => f.name === 'id')) {
      throw new ValidationError(
        `Target model ${relation.model} must have id field`,
        { sourceModel, relation }
      )
    }
  }
}

const parseRelationOptions = (relation: Partial<Relation>, options: string) : void => {
  options.split('@').filter(Boolean).forEach(opt => {
    const [key, value] = opt.trim().split('=').map(s => s.trim())
    if (key === 'onDelete') relation.onDelete = value as any
    if (key === 'onUpdate') relation.onUpdate = value as any
  })
}

const checkCircularDependencies = (models: Model[]): void => {
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  const dfs = (modelName: string): boolean => {
    if (recursionStack.has(modelName)) {
      return true // circular dependency found
    }
    if (visited.has(modelName)) {
      return false
    }

    visited.add(modelName)
    recursionStack.add(modelName)

    const model = models.find(m => m.name === modelName)!
    for (const relation of model.relations || []) {
      if (dfs(relation.model)) {
        throw new ValidationError(
          `Circular dependency detected: ${modelName} -> ${relation.model}`,
          { model: modelName }
        )
      }
    }

    recursionStack.delete(modelName)
    return false
  }

  models.forEach(model => {
    if (!visited.has(model.name)) {
      dfs(model.name)
    }
  })
}