/*
	The [compile] command definition.
*/

import { writeFileSync } from 'fs'
import path from 'path'
import type { Arguments, CommandBuilder } from 'yargs'
import { rulesToJSON } from '../lib'

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
	const { model, json: jsonPath, ignore, markdown } = argv
	const json = rulesToJSON(path.join(path.resolve(model), '**/*.yaml'), ignore)

	try {
		// new Engine(baseRules).evaluate('bilan')

		if (markdown) {
			console.log('| Task | Status | Message |')
			console.log('|:-----|:------:|:-------:|')
		}
		console.log(
			markdown
				? `| Rules evaluation | :heavy_check_mark: | Ø |`
				: ' ✅ Les règles ont été évaluées sans erreur !'
		)

		writeJSON(json, jsonPath, markdown)

		// destLangs.forEach((destLang) => {
		// 	const destPath = path.join(outputJSONPath, `co2-${destLang}.json`)
		// 	const translatedRuleAttrs =
		// 		utils.readYAML(
		// 			path.resolve(`data/translated-rules-${destLang}.yaml`)
		// 		) ?? {}
		// 	const translatedRules = addTranslationToBaseRules(
		// 		baseRules,
		// 		translatedRuleAttrs
		// 	)
		// 	writeRules(translatedRules, destPath, destLang)
		// })
	} catch (err) {
		if (markdown) {
			console.log(
				`| Rules evaluation | ❌ | <details><summary>See error:</summary><br /><br /><code>${err}</code></details> |`
			)
			console.log(err)
		} else {
			console.log(
				' ❌ Une erreur est survenue lors de la compilation des règles:\n'
			)
			let lines = err.message.split('\n')
			for (let i = 0; i < 9; ++i) {
				if (lines[i]) {
					console.log('  ', lines[i])
				}
			}
			console.log()
		}
	}
	process.exit(0)
}

function writeJSON(
	json: string,
	path: string,
	markdown: boolean,
	destLang = 'fr'
) {
	try {
		writeFileSync(path, json)
	} catch (err) {
		if (markdown) {
			console.log(
				`| Rules compilation to JSON for _${destLang}_ | ❌ | <details><summary>See error:</summary><br /><br /><code>${err}</code></details> |`
			)
		} else {
			console.log(' ❌ An error occured while writting rules in:', path)
			console.log(err.message)
		}
		process.exit(-1)
	}
	console.log(
		markdown
			? `| Rules compilation to JSON for _${destLang}_ | :heavy_check_mark: | Ø |`
			: ` ✅ The rules have been correctly written in JSON in: ${path}`
	)
}
