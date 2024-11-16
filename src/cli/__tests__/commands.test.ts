// src/cli/__tests__/commands.test.ts
import { Command } from 'commander'
import { createInitCommand } from '../commands/init-command'
import { createGenerateCommand } from '../commands/generate-command'
import { createValidateCommand } from '../commands/validate-command'

jest.mock('../../core/commands/init')
jest.mock('../../generator/commands/generate')
jest.mock('../../parser/commands/validate')

describe('CLI Commands', () => {
  describe('Init Command', () => {
    let command: Command

    beforeEach(() => {
      command = createInitCommand()
    })

    it('creates command with correct options', () => {
      expect(command.name()).toBe('init')
      expect(command.options).toHaveLength(3) // database, typescript, description
    })

    it('has required options', () => {
      const options = command.options.map(o => o.flags)
      expect(options).toContain('-d, --database <type>')
      expect(options).toContain('-t, --typescript')
      expect(options).toContain('--description <text>')
    })
  })

  describe('Generate Command', () => {
    let command: Command

    beforeEach(() => {
      command = createGenerateCommand()
    })

    it('creates command with correct options', () => {
      expect(command.name()).toBe('generate')
      expect(command.options).toHaveLength(1) // type
    })

    it('has required type option', () => {
      const options = command.options.map(o => o.flags)
      expect(options).toContain('-t, --type <type>')
    })
  })

  describe('Validate Command', () => {
    let command: Command

    beforeEach(() => {
      command = createValidateCommand()
    })

    it('creates command with correct name', () => {
      expect(command.name()).toBe('validate')
    })
  })
})