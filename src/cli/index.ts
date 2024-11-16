#!/usr/bin/env node
import { Command } from 'commander'
import { createInitCommand } from './commands/init-command'

const program = new Command()
  .name('dbfast')
  .description('Fast database schema generator')
  .version('0.1.0')

program.addCommand(createInitCommand())

program.on('command:*', () => {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '))
  process.exit(1)
})

program.parseAsync(process.argv).catch((err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})