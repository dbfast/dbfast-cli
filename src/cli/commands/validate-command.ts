// src/cli/commands/validate-command.ts
import { Command } from 'commander'
import { validateCommand, ValidateOptions } from '../../parser/commands/validate'
import { logger } from '../../utils/logger'

export const createValidateCommand = (): Command => {
  const command = new Command('validate')
    .description('Validate schema and configuration')
    .action(async (options: ValidateOptions) => {
      try {
        await validateCommand(options)
        logger.debug('✅ Validation successful!')
      } catch (error) {
        if (error instanceof Error) {
          console.error('❌ Validation failed:', error.message)
        } else {
          console.error('❌ Validation failed:', error)
        }
        process.exit(1)
      }
    })

  return command
}