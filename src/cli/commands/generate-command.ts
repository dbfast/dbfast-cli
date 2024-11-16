// src/cli/commands/generate-command.ts
import { Command } from 'commander'
import { generateCommand, GenerateOptions } from '../../generator/commands/generate'
import { logger } from '../../utils/logger'

export const createGenerateCommand = (): Command => {
  const command = new Command('generate')
    .description('Generate schema files')
    .option('-t, --type <type>', 'type to generate (prisma/types/migration)')
    .action(async (options: GenerateOptions) => {
      try {
        await generateCommand(options)
        logger.debug(`✨ Generated ${options.type} successfully!`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        console.error('❌ Generation failed:', errorMessage)
        process.exit(1)
      }
    })

  return command
}