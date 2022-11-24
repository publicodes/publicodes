import glob from 'glob'
import { readFileSync } from 'fs'
import yaml from 'yaml'

import type { RawPublicodes, RuleNode } from 'publicodes'

export type RuleName = string
export type ParsedRules = Record<RuleName, RuleNode<RuleName>>
export type RawRules = RawPublicodes<RuleName>

export function getRawNodes(parsedRules: ParsedRules): RawRules {
	return Object.fromEntries(
		Object.values(parsedRules).reduce((acc, rule: RuleNode<RuleName>) => {
			const { nom, ...rawNode } = rule.rawNode
			acc.push([nom, rawNode])
			return acc
		}, [])
	)
}

export function constantFolding(baseRules: ParsedRules): ParsedRules {
	return Object.fromEntries(
		Object.entries(baseRules).filter(
			([_, rule]) =>
				// at least the 'nom' attribute will be specified
				Object.keys(rule.rawNode).length > 1
		)
	)
}

function readYAML(path: string): object {
	return yaml.parse(readFileSync(path, 'utf-8'))
}

export function getJSONRules(sourcePath: string, ignore?: string[]): object {
	const files = glob.sync(sourcePath, { ignore })
	const baseRules = files.reduce((acc: object, filename: string) => {
		try {
			const rules = readYAML(filename)
			return { ...acc, ...rules }
		} catch (err) {
			process.stderr.write(
				`An error occured while reading the file '${filename}':\n\n${err.message}`
			)
		}
	}, {})

	return baseRules
}
