import glob from 'glob'
import { readFileSync } from 'fs'
import yaml from 'yaml'

import type { ParsedRules, RawPublicodes, RuleNode } from 'publicodes'

export type RuleName = string

export function getRawNodes(
	parsedRules: Record<RuleName, RuleNode<RuleName>>
): RawPublicodes<RuleName> {
	return Object.fromEntries(
		Object.values(parsedRules).reduce((acc, rule: RuleNode<RuleName>) => {
			const { nom, ...rawNode } = rule.rawNode
			acc.push([nom, rawNode])
			return acc
		}, [])
	)
}

export function constantFolding(
	baseRules: ParsedRules<RuleName>
): ParsedRules<RuleName> {
	return baseRules
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
