import glob from 'glob'
import { readFileSync, writeFileSync } from 'fs'
import yaml from 'yaml'

import Engine, { reduceAST } from 'publicodes'

import type { RawPublicodes, RuleNode, ASTNode } from 'publicodes'

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

// To be fold, a rule needs to be a constant:
// - no question
// - no dependency
const isFoldable = (rule: RuleNode) => {
	const rawNode = rule.rawNode
	return !(rawNode.question || rawNode['par défaut'])
}

const isInParsedRules = (parsedRules: ParsedRules, rule: RuleName) => {
	return Object.keys(parsedRules).includes(rule)
}

const isEmptyRule = (rule: RuleNode) => {
	// There is always a 'nom' attribute.
	return Object.keys(rule.rawNode).length <= 1
}

export function constantFolding(engine): ParsedRules {
	const parsedRules = engine.getParsedRules()
	const preFilteredRules = Object.entries(parsedRules).filter(([_, rule]) =>
		isFoldable(rule)
	)
	preFilteredRules.forEach(([ruleName, rule]) => {
		if (!isInParsedRules(parsedRules, ruleName)) {
			// The [ruleName] rule has already been removed from the [parsedRules]
			return
		}
		if (isEmptyRule(rule)) {
			delete parsedRules[ruleName]
			return
		}

		const { nodeValue, missingVariables, traversedVariables } =
			engine.evaluateNode(rule)

		// The computation could be done a compile time.
		if (Object.keys(missingVariables).length === 0) {
			parsedRules[ruleName].rawNode.valeur = nodeValue
			parsedRules[ruleName].rawNode['est compressée'] = true
			delete parsedRules[ruleName].rawNode.formule

			// Update ref counting
			traversedVariables.forEach((ruleDottedName: RuleName) => {
				parsedRules[ruleDottedName].explanation.parents = parsedRules[
					ruleDottedName
				].explanation.parents.filter(
					({ dottedName }) =>
						isInParsedRules(parsedRules, dottedName) && dottedName !== ruleName
				)

				if (parsedRules[ruleDottedName].explanation.parents.length === 0) {
					delete parsedRules[ruleDottedName]
				}
			})
		}
	})

	return parsedRules
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
