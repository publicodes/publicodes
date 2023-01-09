import glob from 'glob'
import { resolve } from 'path'
import yaml from 'yaml'
import { readFileSync } from 'fs'

import type { RuleNode } from 'publicodes'
import RawPublicodes from 'publicodes'

export type RuleName = string
export type ParsedRules = Record<RuleName, RuleNode<RuleName>>
export type RawRules = RawPublicodes<RuleName>

export function getRawNodes(parsedRules: ParsedRules): RawRules {
	return Object.fromEntries(
		Object.values(parsedRules).reduce((acc: any, rule) => {
			const { nom, ...rawNode } = rule.rawNode
			acc.push([nom, rawNode])
			return acc
		}, [])
	) as RawRules
}

export function readRawRules(path: string, pathToIgnore: string[]): RawRules {
	const files = glob.sync(path, { ignore: pathToIgnore })

	return files.reduce((acc: RawRules, filename: string) => {
		try {
			const rules = yaml.parse(readFileSync(resolve(filename), 'utf-8'))
			return { ...acc, ...rules }
		} catch (err) {
			// TODO: need to determine the error management.
			return {}
		}
	}, {})
}

function consumeMsg(_: string): void {}

export const disabledLogger = {
	log: consumeMsg,
	warn: consumeMsg,
	error: consumeMsg,
}
