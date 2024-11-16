import { Command } from 'commander'
import { ParsedSchema } from '../core/types' 
import { DBFastConfig } from '../core/config'
import { initCommand } from '../core/commands/init'
import { generateCommand } from '../generator/commands/generate'
import { validateCommand } from '../parser/commands/validate'

const program = new Command()

program
  .command('init')
  .description('Initialize a new DBFast project')
  .option('-d, --database <type>', 'database type')
  .option('-t, --typescript', 'generate typescript')
  .action(async (options) => {
    const result = await initCommand(options)
    // handle result
  })

program
  .command('generate')
  .description('Generate schema files')
  .option('-t, --type <type>', 'type to generate')
  .action(async (options) => {
    const result = await generateCommand(options)
    // handle result
  })

export { program }