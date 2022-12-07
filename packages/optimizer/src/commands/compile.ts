/*
	The [compile] command definition.
*/

import { writeFileSync } from 'fs'
import path from 'path'
import type { Arguments, CommandBuilder } from 'yargs'
import { getRawNodes, readRawRules } from '../commons'
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

function consumeMsg(_: string): void {}

export function handler(argv: Arguments<Options>) {
	const { model, json: jsonPath, ignore } = argv
	const modelPath = path.join(path.resolve(model), '**/*.yaml')

	console.log(`Parsing rules from ${modelPath}...`)
	const rules = readRawRules(modelPath, ignore ?? [])
	const engine = new Engine(rules, {
		logger: { log: consumeMsg, warn: consumeMsg, error: consumeMsg },
	})

	console.log('Constant folding pass...')
	const foldedRules = constantFolding(engine)

	console.log(`Writing in '${jsonPath}'...`)
	writeFileSync(jsonPath, JSON.stringify(getRawNodes(foldedRules)))

	console.log(`DONE.`)
	process.exit(0)
}
