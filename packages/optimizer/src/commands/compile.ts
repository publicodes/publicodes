/*
	The [compile] command definition.
*/

import { writeFileSync } from 'fs'
import path from 'path'
import type { Arguments, CommandBuilder } from 'yargs'
import { disabledLogger, getRawNodes, readRawRules } from '../commons'
import Engine from 'publicodes'
import constantFolding from '../constantFolding'

type Options = {
	model: string
	json: string
	markdown: boolean
	ignore?: string[]
}

export const command = 'compile <model> <json>'
export const desc = 'Compiles a Publicodes model into the specified JSON file.'

export function builder(yargs): CommandBuilder<Options, Options> {
	return yargs
		.option('ignore', {
			alias: 'i',
			describe: 'Regexp matching files to ignore from the model tree.',
			default: '**/translated-*.yaml',
			type: 'string',
			array: true,
		})
		.option('markdown', {
			alias: 'm',
			describe: 'Regexp matching files to ignore from the model tree.',
			type: 'boolean',
		})
		.positional('model', {
			type: 'string',
			describe: 'Path to the folder containing the Publicodes files.',
			normalize: true,
		})
		.positional('json', {
			type: 'string',
			describe: 'Path to the JSON file target.',
			normalize: true,
		})
}

export function handler(argv: Arguments<Options>) {
	try {
		const { model, json: jsonPath, ignore } = argv
		const modelPath = path.join(path.resolve(model), '**/*.yaml')

		console.log(`Parsing rules from ${modelPath}...`)
		const rules: any = readRawRules(modelPath, ignore ?? [])
		const engine = new Engine(rules, { logger: disabledLogger })

		console.log('Constant folding pass...')
		// FIXME: not working yet for the with the 'bilan' target
		const foldedRules = constantFolding(engine /* , ['bilan'] */)

		console.log(`Writing in '${jsonPath}'...`)
		writeFileSync(jsonPath, JSON.stringify(getRawNodes(foldedRules)))

		console.log(`DONE.`)
		process.exit(0)
	} catch (error) {
		console.error(error.message)
		process.exit(-1)
	}
}
