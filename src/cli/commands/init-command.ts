// src/cli/commands/init-command.ts
import { Command } from 'commander'
import { initCommand, InitOptions } from '../../core/commands/init'

export const createInitCommand = (): Command => {
  const command = new Command('init')
    .description('Initialize a new DBFast project')
    .option('-d, --database <type>', 'database type (postgres/mysql/sqlite)')
    .option('-t, --typescript', 'generate typescript types')
    .option('--description <text>', 'schema description in english')
    .action(async (options: InitOptions) => {
      try {
        await initCommand(options)
        console.log('✨ Project initialized successfully!')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        console.error('❌ Init failed:', errorMessage)
        process.exit(1)
      }
    })

  return command
}