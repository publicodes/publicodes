import * as p from '@clack/prompts'
import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { watch } from 'chokidar'
import fs from 'fs'
import path from 'path'
import type { RawPublicodes } from 'publicodes'
import Engine from 'publicodes'
import { DEFAULT_BUILD_DIR, RawRules } from '../commons'
import { getModelFromSource, GetModelFromSourceOptions } from '../compilation'
import { resolveRuleTypes, RuleType } from '../compilation/ruleTypes'
import { serializeParsedRules } from '../serializeParsedRules'
import { exitWithError, runWithSpinner } from '../utils/cli'
import { PackageJson, readPackageJson } from '../utils/pjson'
import { toArray } from '../utils/toArray'

export default class Compile extends Command {
	static override args = {
		files: Args.file({ description: 'Files to compile.' }),
	}

	static override strict = false

	static override summary = 'Compile publicodes files.'

	static override description = `
This command will compile all the specified publicodes files into standalone
JSON file importable in any JavaScript along with the TypeScript types
corresponding to the rules.

To avoid passing arguments and flags every time, you can set their values in
the package.json file under the \`publicodes\` key. For example:

    {
      // ...
      "publicodes": {
        "files": ["src/"],
        "output": "${DEFAULT_BUILD_DIR}",
      }
    }
`

	static override examples = [
		{
			command: '<%= config.bin %> <%= command.id %>',
			description: `Compile all publicodes files in the src/ directory into the ${DEFAULT_BUILD_DIR}/ directory.`,
		},
		{
			command: '<%= config.bin %> <%= command.id %> src/**/*.publicodes',
			description: 'Compile all publicodes files in the src/ directory.',
		},
		{
			command:
				'<%= config.bin %> <%= command.id %> src/file1.publicodes src/file2.publicodes -o ../dist',
			description:
				'Compile only the specified files into the ../dist/ directory.',
		},
	]

	static override flags = {
		watch: Flags.boolean({
			char: 'w',
			summary: 'Watch files for changes and recompile.',
		}),

		output: Flags.string({
			char: 'o',
			summary: `Specify the output directory. Default is "./${DEFAULT_BUILD_DIR}".`,
		}),
	}

	public async run(): Promise<void> {
		const { argv, flags } = await this.parse(Compile)
		const pjson: Partial<PackageJson> = this.config.pjson
		p.intro(chalk.bgHex('#2975d1')(' publicodes compile '))
		const filesToCompile =
			argv.length === 0 ?
				// TODO: test with production package
				toArray(pjson?.publicodes?.files ?? 'src')
			:	(argv as string[])

		const outputDir = path.resolve(
			flags.output ?? pjson?.publicodes?.output ?? DEFAULT_BUILD_DIR,
		)

		const pkgName = readPackageJson()?.name ?? path.basename(process.cwd())

		// Create output directory if it doesn't exist
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true })
		}

		let compilationCount = 0
		const compile = async () => {
			const rawRules = (await parseFiles(filesToCompile, {
				verbose: false,
			})) as RawPublicodes<string>

			try {
				const engine = await initEngine(rawRules)

				const startTime = Date.now()
				compilationCount++

				await this.generateDTS(engine, outputDir)

				await generateBaseFiles(
					serializeParsedRules(engine.getParsedRules()),
					outputDir,
					pkgName,
				)

				const endTime = Date.now()
				const timestamp = new Date().toLocaleTimeString()

				p.log.success(
					`${chalk.dim(timestamp)} ${chalk.green('✓')} rules compiled in ${chalk.bold(
						`${Math.round(endTime - startTime)}ms`,
					)} ${chalk.dim(`#${compilationCount}`)}`,
				)
			} catch (error) {
				if (!flags.watch || !(error instanceof Error)) {
					throw error
				}
				p.log.message(chalk.dim(error.message.trim()))
			}
		}

		await compile()

		if (flags.watch) {
			const watcher = watch(filesToCompile, {
				persistent: true,
				ignoreInitial: true,
			}).on('all', (event) => {
				const timestamp = new Date().toLocaleTimeString()

				p.log.info(
					`${chalk.dim(timestamp)} ${chalk.green('⚡')} ${chalk.blue('publicodes')} ${
						event === 'add' ? 'detected new file' : 'recompiling'
					}`,
				)

				void compile()
			})
			function cleanup() {
				void watcher.close()
				p.outro('Compilation watcher stopped.')
			}
			process.on('SIGINT', () => {
				void cleanup()
			})
			process.on('SIGTERM', () => {
				void cleanup()
			})
		} else {
			p.outro('Compilation done.')
		}
	}

	async generateDTS(engine: Engine, outputDir: string): Promise<void> {
		return runWithSpinner('Generating types', 'Types generated.', () => {
			const ruleTypes = resolveRuleTypes(engine)
			const typesEntries = Object.entries(ruleTypes)
			const serializedRuleTypes = typesEntries
				.map(([name, type]) => `  "${name}": ${serializeType(type)}`)
				.join(',\n')
			const serializedRulesValue = typesEntries
				.map(([name, type]) => {
					const title = engine.getRule(name)?.rawNode?.titre
					return `${title ? `  /** ${title} */\n` : ''}  "${name}": ${serializeJSType(type)}`
				})
				.join(',\n')
			// TODO: could be little bit more optimized
			const serializedQuestionsRuleTypes = typesEntries
				.filter(([name]) => engine.getRule(name).rawNode.question)
				.map(([name, type]) => {
					const title = engine.getRule(name)?.rawNode?.titre
					return `${title ? `  /** ${title} */\n` : ''}  "${name}": ${serializeJSType(type)}`
				})
				.join(',\n')

			const dts = `/** THIS FILE WAS GENERATED BY ${this.config.pjson.name} (v${this.config.pjson.version}). PLEASE, DO NOT EDIT IT MANUALLY. */

import { Rule } from 'publicodes'

/**
 * String representing a date in the format 'DD/MM/YYYY' or 'MM/YYYY'.
 */
export type PDate = string

/**
 * Publicodes boolean type.
 */
export type PBoolean = 'oui' | 'non'

/**
 * String constant are enclosed in single quotes to differentiate them from
 * references.
 */
export type PString = \`'\${string}'\`

/**
 * Corresponding Publicodes situation with types inferred for each rule.
 *  
 * @note
 * This represents the situation as needed by the 'setSituation' method of the
 * {@link Engine} class with raw values (i.e. string constants are enclosed in
 * "''" and boolean values are 'oui' or 'non').
 */
export type Situation = Partial<{
${serializedRuleTypes}
}>

/**
 * Associates for each rule name its corresponding value type (in JavaScript
* form) that will be returned by the {@link Engine.evaluate} method.
 */
export type RuleValue = Partial<{
${serializedRulesValue}
}>

/**
 * Subset of the {@link Situation} with only the rules that are questions
 * (i.e. input rules).
 *
 * @note
 * This represents the input rules expected to be provided by the user.
 * Therefore the values are in their JavaScript form (i.e. string constants are
 * enclosed in '' and boolean values are 'true' or 'false').
 */
export type Questions = Partial<{
${serializedQuestionsRuleTypes}
}>

/**
 * All rule names available in the model.
 */
export type RuleName = keyof Situation

declare let rules: Record<RuleName, Rule>

export default rules
`
			fs.writeFileSync(path.join(outputDir, 'index.d.ts'), dts)
		})
	}
}

async function parseFiles(
	files: string[],
	// TODO: manage options
	options: GetModelFromSourceOptions,
): Promise<RawRules> {
	return runWithSpinner('Resolving imports', 'Imports resolved.', (spinner) => {
		try {
			return getModelFromSource(files, {
				...options,
				logger: {
					log: p.log.info,
					error: p.log.error,
					warn: p.log.warn,
				},
			})
		} catch (error) {
			exitWithError({
				ctx: 'An error occurred while parsing files:',
				msg: error instanceof Error ? error.message : '',
				spinner,
			})
		}
	})
}

async function initEngine(rawRules: RawPublicodes<string>): Promise<Engine> {
	return runWithSpinner(
		'Checking rules',
		`No errors found in ${chalk.bold(Object.keys(rawRules).length)} rules.`,
		(spinner) => {
			try {
				return new Engine(rawRules)
			} catch (err) {
				spinner.stop('Errors found in the rules!:\n', 1)
				throw err
			}
		},
	)
}

async function generateBaseFiles(
	rawRules: RawRules,
	outputDir: string,
	pkgName: string,
): Promise<void> {
	return runWithSpinner('Emitting files', 'Files emitted.', (spinner) => {
		try {
			// Extract package name without scope
			const basePkgName = pkgName.replace(/@.*\//, '')

			// Generate JSON file
			const jsonPath = path.join(outputDir, `${basePkgName}.model.json`)
			fs.writeFileSync(jsonPath, JSON.stringify(rawRules))

			generateIndexFile(outputDir, jsonPath)
		} catch (error) {
			if (error instanceof Error) {
				exitWithError({
					ctx: 'An error occurred while generating files:',
					msg: error.message,
					spinner,
				})
			}
		}
	})
}

function generateIndexFile(outputDir: string, jsonPath: string): void {
	fs.writeFileSync(
		path.join(outputDir, 'index.js'),
		`import rules from './${path.basename(jsonPath)}' assert { type: 'json' }

export default rules`,
	)
}

function serializeType(type: RuleType): string {
	const nullable = type.isNullable ? ' | null' : ''
	switch (type.type) {
		case 'string': {
			return `PString${nullable}`
		}
		case 'number': {
			return `number${nullable}`
		}
		case 'boolean': {
			return `PBoolean${nullable}`
		}
		case 'date': {
			return `PDate${nullable}`
		}
		case 'enum': {
			return (
				type.options.map((option) => `"'${option}'"`).join(' | ') + nullable
			)
		}
	}
}

function serializeJSType(type: RuleType): string {
	const nullable = type.isNullable ? ' | null' : ''
	switch (type.type) {
		case 'string': {
			return `string${nullable}`
		}
		case 'number': {
			return `number${nullable}`
		}
		case 'boolean': {
			return `boolean${nullable}`
		}
		case 'date': {
			return `string${nullable}`
		}
		case 'enum': {
			return type.options.map((option) => `"${option}"`).join(' | ') + nullable
		}
	}
}
