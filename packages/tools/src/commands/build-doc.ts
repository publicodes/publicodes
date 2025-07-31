import * as p from '@clack/prompts'
import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { PackageJson } from '../utils/pjson'
import { toArray } from '../utils/toArray'
import { fileURLToPath } from 'url'
import path from 'path'
import buildDoc, { ViteBuildOptions } from '../buildQuickDoc'
import {
	DEFAULT_QUICKDOC_BUILD_DIR,
	DEFAULT_QUICKDOC_SITUATION_PATH,
	DEFAULT_RULES_PATH,
} from '../commons'

export default class BuildDoc extends Command {
	static override args = {
		files: Args.file({ description: 'Files to compile' }),
	}

	static override strict = false

	static override summary = 'Build static publicodes documentation'

	static override description = `
This command will generate a static build of the publicodes auto-generated documentation.

You can specify different situations to use in the documentation in separated publicodes files, with the 'contexte' mechanism.

By default, the build will use the publicodes files in the 'src/' directory and the situations in the 'situations/' directory.

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
			description: `Build the publicodes documentation with default options.`,
		},
		{
			command: '<%= config.bin %> <%= command.id %> -s test/ model/',
			description:
				'Build the documentation for publicodes files in the `model/` directory, and use the situations in the `test/` directory.',
		},
	]

	static override flags = {
		outDir: Flags.string({
			char: 'd',
			summary: 'Output directory for the static build',
		}),
		situations: Flags.string({
			char: 's',
			multiple: true,
			summary:
				'Specify the directory containing the situations files, default is situations/',
		}),
	}

	public async run(): Promise<void> {
		const { argv, flags } = await this.parse(BuildDoc)

		p.intro(chalk.bgHex('#2975d1')(' publicodes build-doc '))
		const pjson: Partial<PackageJson> = this.config.pjson

		const filesToCompile =
			argv.length === 0 ?
				toArray(pjson?.publicodes?.files ?? DEFAULT_RULES_PATH)
			:	(argv as string[])

		const situationFiles: string[] =
			!flags.situations?.length ?
				toArray(
					pjson?.publicodes?.situations ?? DEFAULT_QUICKDOC_SITUATION_PATH,
				)
			:	flags.situations

		const quickDocPath = path.join(
			path.dirname(
				import.meta.url ? fileURLToPath(import.meta.url) : __filename,
			),
			'..',
			'..',
			'quick-doc',
		)

		const outDir = path.resolve(flags.outDir ?? DEFAULT_QUICKDOC_BUILD_DIR)

		const buildOptions: ViteBuildOptions = {
			outDir,
		}

		await buildDoc(filesToCompile, situationFiles, quickDocPath, buildOptions)

		p.outro(chalk.bgHex('#2975d1')(' publicodes build complete '))
	}
}
