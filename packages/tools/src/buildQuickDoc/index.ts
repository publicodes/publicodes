import * as p from '@clack/prompts'
import tailwindcss from '@tailwindcss/vite'
import chalk from 'chalk'
import Engine, { RawPublicodes } from 'publicodes'
import { InlineConfig, build } from 'vite'
import { getModelFromSource } from '../compilation'
import { extractSituations } from '../devServer/extractSituations'

export type ViteBuildOptions = {
	outDir: string
}

const ruleModuleId = '$RULES$'
const situationModuleId = '$SITUATIONS$'

export default async function buildDoc(
	modelFiles: string[],
	situationFiles: string[],
	quickDocPath: string,
	options: ViteBuildOptions,
) {
	const rules = compileModel()
	const situations = await compileSituation()

	const viteConfig: InlineConfig = {
		root: quickDocPath,
		build: {
			outDir: options.outDir,
		},
		plugins: [
			{
				name: 'publicodes-compile',
				resolveId(id) {
					if (id === ruleModuleId) return id
					if (id === situationModuleId) return id
				},
				load(id) {
					if (id === ruleModuleId)
						return `export default ${JSON.stringify(rules)}`
					if (id === situationModuleId)
						return `export default ${JSON.stringify(situations)}`
				},
			},
			tailwindcss(),
		],
	}

	const vite = await build(viteConfig)

	async function compileSituation() {
		const timestamp = new Date().toLocaleTimeString()

		try {
			const situations = await extractSituations(situationFiles)

			p.log.success(
				`${chalk.dim(timestamp)} ${chalk.green('✓')} situations compiled`,
			)

			return situations
		} catch (error) {
			p.log.error(
				`${chalk.dim(timestamp)} ${chalk.red('✗')} reload failed:\n${
					error instanceof Error ? error.message : String(error)
				}`,
			)
		}
	}

	function compileModel() {
		const timestamp = new Date().toLocaleTimeString()

		try {
			const startTime = performance.now()
			const rules = getModelFromSource(modelFiles, {
				logger: {
					log: p.log.info,
					error: p.log.error,
					warn: p.log.warn,
				},
			})
			const endTime = performance.now()

			// Try to compile the rules
			new Engine(rules as RawPublicodes<string>)

			p.log.success(
				`${chalk.dim(timestamp)} ${chalk.green('✓')} rules compiled in ${chalk.bold(
					`${Math.round(endTime - startTime)}ms`,
				)}`,
			)
			return rules
		} catch (error) {
			p.log.error(
				`${chalk.dim(timestamp)} ${chalk.red('✗')} compilation failed:\n${
					error instanceof Error ? error.message : String(error)
				}`,
			)
		}
	}

	return vite
}
