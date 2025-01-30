import { readFileSync, statSync } from 'fs'
import { sync } from 'glob'
import { Logger } from 'publicodes'
import yaml from 'yaml'
import { getDoubleDefError, RawRules, RuleName } from '../commons'
import { resolveImports } from './resolveImports'
import { toArray } from '../utils/toArray'

/**
 * Options for the `getModelFromSource` function.
 */
export type GetModelFromSourceOptions = {
	/** Pattern to match the source files to be ignored in the model. */
	ignore?: string | string[]
	/** Whether to display verbose logs. (default: `false`) */
	verbose?: boolean
	/** Logger object. (default: `console`) */
	logger?: Logger
}

function throwErrorIfDuplicatedRules(
	filePath: string,
	rules: RawRules,
	newRules: RawRules,
) {
	Object.keys(newRules).forEach((rule) => {
		if (rule in rules) {
			throw getDoubleDefError(filePath, rule, rules[rule], newRules[rule])
		}
	})
}

/**
 * Aggregates all rules from the rules folder into a single json object (the model)
 * with the resolved dependencies.
 *
 * @param sourcePaths - Path to the source files, can be a glob pattern or a directory.
 * @param opts - Options.
 *
 * @returns The model with resolved imports in a single JSON object.
 *
 * @throws {Error} If the package name is missing in the macro.
 * @throws {Error} If the rule to import does not exist.
 * @throws {Error} If there is double definition of a rule.
 * @throws {Error} If there is a conflict between an imported rule and a base rule.
 */
export function getModelFromSource(
	sourcePaths: string | string[],
	opts?: GetModelFromSourceOptions,
): RawRules {
	const logger = opts?.logger ?? console

	const { jsonModel, namespaces } = sync(normalizeSourcePaths(sourcePaths), {
		ignore: opts?.ignore,
	}).reduce(
		({ jsonModel, namespaces }, filePath: string) => {
			const rules = yaml.parse(readFileSync(filePath, 'utf-8')) as RawRules
			if (rules == null) {
				logger.warn(`⚠️ ${filePath} is empty, skipping...`)
				return { jsonModel, namespaces }
			}
			const { completeRules, neededNamespaces } = resolveImports(
				filePath,
				rules,
				logger,
				opts?.verbose,
			)
			// PERF: could be smarter?
			throwErrorIfDuplicatedRules(filePath, jsonModel, completeRules)
			return {
				jsonModel: { ...jsonModel, ...completeRules },
				namespaces: new Set([...namespaces, ...neededNamespaces]),
			}
		},
		{ jsonModel: {} as RawRules, namespaces: new Set<RuleName>() },
	)
	namespaces.forEach((namespace: RuleName) => {
		if (jsonModel[namespace] === undefined) {
			jsonModel[namespace] = null
		}
	})

	return jsonModel
}

export function normalizeSourcePaths(sourcePaths: string | string[]): string[] {
	return toArray(sourcePaths).map((pathOrGlob) => {
		try {
			if (statSync(pathOrGlob).isDirectory()) {
				return pathOrGlob + '/**/*.publicodes'
			}
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			// Ignore error, it's a file glob
		}
		return pathOrGlob
	})
}
