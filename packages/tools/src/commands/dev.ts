import * as p from '@clack/prompts'
import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import createViteDevServer, {
	ViteDevServerOptions,
} from '../devServer/createViteDevServer'
import { PackageJson } from '../utils/pjson'
import { toArray } from '../utils/toArray'

export default class Compile extends Command {
	static override args = {
		files: Args.file({ description: 'Files to compile.' }),
	}

	static override strict = false

	static override summary = 'Launch publicodes documentation dev server'

	static override description = `
This command will start a local server to serve the publicodes auto-generated documentation of the model. 

It will open a browser window with the documentation. The server will automatically reload the page when the documentation is updated. 

You can specify different situations to use in the documentation in separated publicodes files, with the 'contexte' mechanism.

By default, the server will serve the publicodes files in the 'src/' directory and the situations in the 'situations/' directory

To avoid passing arguments and flags every time, you can set their values in the package.json file under the \`publicodes\` key. For example:

	{
	  // ...
	  "publicodes": {
		"files": ["src/"],
		"situations": ["test/"],
	  }
	}
`

	static override examples = [
		{
			command: '<%= config.bin %> <%= command.id %>',
			description: `Launch the publicodes documentation dev server on the default port.`,
		},
		{
			command: '<%= config.bin %> <%= command.id %> -s test/ model/',
			description:
				'Launch the documentation for publicodes files in the `model/` directory, and use the situations in the `test/` directory.',
		},

		{
			command: '<%= config.bin %> <%= command.id %> -p 3000 -h 0.0.0.0 --open',
			description:
				'Launch the documentation on port 3000 and open the browser window automatically.',
		},
	]

	static override flags = {
		host: Flags.string({
			char: 'h',
			summary:
				'Specify which IP addresses the server should listen on. Set this to 0.0.0.0 or true to listen on all addresses, including LAN and public addresses.',
		}),

		port: Flags.string({
			char: 'p',
			summary:
				'Specify server port. Note if the port is already being used, Vite will automatically try the next available port so this may not be the actual port the server ends up listening on.',
		}),

		open: Flags.boolean({
			char: 'o',
			summary:
				'Open the browser window automatically.  If you want to open the server in a specific browser you like, you can set the env process.env.BROWSER (e.g. firefox).',
		}),

		situations: Flags.string({
			char: 's',
			multiple: true,
			summary:
				'Specify the directory containing the situations files, default is situations/',
		}),
	}

	public async run(): Promise<void> {
		const { argv, flags } = await this.parse(Compile)

		p.intro(chalk.bgHex('#2975d1')(' publicodes dev '))
		const pjson: Partial<PackageJson> = this.config.pjson

		const filesToCompile =
			argv.length === 0 ?
				// TODO: test with production package
				toArray(pjson?.publicodes?.files ?? 'src/')
			:	(argv as string[])

		const situationFiles: string[] =
			!flags.situations?.length ?
				// TODO: test with production package
				toArray(pjson?.publicodes?.situations ?? 'situations/')
			:	flags.situations

		// quickDoc is in the current package (@publicodes/tools) under the folder /quick-doc

		const quickDocPath = (import.meta.url ?? __dirname)
			.replace('file://', '')
			.replace('dist/commands/dev.js', 'quick-doc')

		const server = await createViteDevServer(
			filesToCompile,
			situationFiles,
			quickDocPath,
			flags as ViteDevServerOptions,
		)
		// Handle process termination
		let isShuttingDown = false
		const cleanup = async (): Promise<void> => {
			if (isShuttingDown) return
			isShuttingDown = true
			p.outro(chalk.bgHex('#2975d1')(' shutting down publicodes dev server '))
			await server.close()
			process.exit(0)
		}

		process.on('SIGINT', () => {
			void cleanup()
		})
		process.on('SIGTERM', () => {
			void cleanup()
		})
	}
}
