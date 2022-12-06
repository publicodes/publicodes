/*
	The [compile] command definition.
*/

import { writeFileSync } from 'fs'
import path from 'path'
import type { Arguments, CommandBuilder } from 'yargs'
import { getRawNodes } from '../lib'
import Engine from 'publicodes'

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
		.positional('model', { type: 'string', normalize: true })
		.positional('json', { type: 'string', normalize: true })
}

export function handler(argv: Arguments<Options>) {
	// const { model, json: jsonPath, ignore, markdown } = argv
	// const rules = getJSONRules(
	// 	path.join(path.resolve(model), '**/*.yaml'),
	// 	ignore
	// )
	// const engine = new Engine(rules)
	// getRawNodes(engine.getParsedRules)
	process.exit(0)
}
