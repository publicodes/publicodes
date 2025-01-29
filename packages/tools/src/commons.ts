import { basename } from 'path'
import {
	Rule,
	Logger,
	ExprAST,
	reduceAST,
	ASTNode,
	PublicodesExpression,
	BinaryOp,
} from 'publicodes'
import yaml from 'yaml'

/**
 * @packageDocumentation
 *
 * This file contains all the common types and functions used by
 * the publicodes tools.
 *
 *
 * @requires publicodes
 */

/**
 * Represents a rule name, i.e. 'rule . A . B'
 */
export type RuleName = string

export const IMPORT_KEYWORD = 'importer!'

export type RuleImportWithOverridenAttrs = {
	[key: string]: object
}

/**
 * Represents a macro that allows to import rules from another package.
 *
 * @example
 * ```yaml
 * importer!:
 *  depuis:
 *    nom: my-external-package
 *    source: my-external-package.model.yaml
 *  dans: root
 *  les règles:
 *    - règle 1
 *    - règle 2:
 *      question: Quelle est la valeur de la règle 2 ?
 */
export type ImportMacro = {
	depuis: {
		// The name of the package to import the rules from.
		nom: string
		// The path to the file containing the rules to import. If omitted try to
		// found the file in the `node_modules` folders.
		source?: string
		// The URL of the package, used for the documentation.
		url?: string
	}
	// The namespace where to import the rules.
	dans?: string
	// List of rules to import from the package.
	// They could be specified by their name, or by the name and the list of
	// properties to override or add.
	'les règles': (RuleName | RuleImportWithOverridenAttrs)[]
}

/**
 * Represents a non-parsed NGC rule.
 */
export type RawRule =
	| Omit<Rule, 'nom'>
	| ImportMacro
	| PublicodesExpression
	| null

/**
 * Represents a non-parsed NGC model.
 */
export type RawRules = Record<RuleName, RawRule>

function consumeMsg(): void {}

export const disabledLogger: Logger = {
	log: consumeMsg,
	warn: consumeMsg,
	error: consumeMsg,
}

/**
 * Returns the list of all the references in a rule node.
 *
 * @param node - The rule node to explore.
 *
 * @returns The references.
 */
export function getAllRefsInNode(node: ASTNode): RuleName[] {
	return reduceAST<RuleName[]>(
		(refs: RuleName[], node: ASTNode) => {
			if (node === undefined) {
				return refs
			}
			if (
				node.nodeKind === 'reference' &&
				node.dottedName &&
				!refs.includes(node.dottedName)
			) {
				refs.push(node.dottedName)
			}
		},
		[],
		node,
	)
}

const binaryOps = ['+', '-', '*', '/', '>', '<', '>=', '<=', '=', '!='] as const

/**
 * Map a parsed expression into another parsed expression.
 *
 * @param parsedExpr The parsed expression in a JSON format.
 * @param fn The function to apply to each node of the parsed expression.
 *
 * @returns The parsed expression with the function applied to each node.
 */
export function mapParsedExprAST(
	parsedExpr: ExprAST,
	fn: (node: ExprAST) => ExprAST,
): ExprAST {
	if ('variable' in parsedExpr || 'constant' in parsedExpr) {
		return fn(parsedExpr)
	}
	if (binaryOps.some((op) => op in parsedExpr)) {
		for (const key of Object.keys(parsedExpr) as (keyof BinaryOp)[]) {
			return fn({
				[key]: [
					mapParsedExprAST(parsedExpr[key][0], fn),
					mapParsedExprAST(parsedExpr[key][1], fn),
				],
			} as BinaryOp)
		}
	}
	return parsedExpr
}

/**
 * Serialize a parsed expression into its string representation.
 *
 * @param parsedExpr The parsed expression in a JSON format.
 * @param needsParens Whether the expression needs to be wrapped in parentheses.
 *
 * @returns The string representation of the parsed expression.
 *
 * @note Could be clever and remove unnecessary parentheses, for example:
 * 		 `(A + B) + C` -> `A + B + C`
 *
 * @example
 * ```
 * serializeParsedExprAST(
 *   { '+': [{ variable: "A" }, { constant: { type: "number", nodeValue: "10" } }] },
 *   true
 * )
 * // "(A + 10)"
 * ```
 */
export function serializeParsedExprAST(
	parsedExpr: ExprAST,
	needsParens = false,
): string | undefined {
	if ('variable' in parsedExpr) {
		return parsedExpr.variable
	}
	if ('constant' in parsedExpr) {
		return (
			parsedExpr.constant.nodeValue +
			('unité' in parsedExpr ? (parsedExpr.unité ?? '') : '')
		)
	}
	if (binaryOps.some((op) => op in parsedExpr)) {
		for (const key of Object.keys(parsedExpr) as (keyof BinaryOp)[]) {
			return (
				(needsParens ? '(' : '') +
				`${serializeParsedExprAST(
					parsedExpr[key][0],
					true,
					// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				)} ${key} ${serializeParsedExprAST(parsedExpr[key][1], true)}` +
				(needsParens ? ')' : '')
			)
		}
	}
}

/**
 * Replace all occurences [variableName] node with the corresponding [constValue] node.
 *
 * @param parsedExpr The parsed expression in a JSON format.
 * @param variableName The name of the variable to replace.
 * @param constValue The value to replace the variable with.
 *
 * @returns The parsed expression with all occurences of [VariableNode] with
 * the corresponding [ConstantNode].
 *
 * @example
 * ```
 * substituteIn(
 *  { variable: "A" },
 *  "A",
 *  "10",
 *  "ruleA"
 *  )
 *  // { constant: { type: "number", nodeValue: "10" } }
 *  ```
 */
export function substituteInParsedExpr(
	parsedExpr: ExprAST,
	variableName: RuleName,
	constValue: string,
): ExprAST {
	const { type, nodeValue } =
		!isNaN(Number(constValue)) ?
			{ type: 'number', nodeValue: Number.parseFloat(constValue) }
		:	{ type: 'string', nodeValue: constValue }

	// @ts-expect-error FIXME: I don't know why this is not working
	return mapParsedExprAST(parsedExpr, (node: ExprAST) => {
		if ('variable' in node && node?.variable === variableName) {
			return { constant: { type, nodeValue } }
		}
		return node
	})
}

export function getDoubleDefError(
	filePath: string,
	name: string,
	firstDef: RawRule,
	secondDef: RawRule,
): Error {
	return new Error(
		`[${basename(filePath)}] La règle '${name}' est déjà définie

Essaie de remplacer :

${yaml.stringify(firstDef, { indent: 2 })}

Avec :

${yaml.stringify(secondDef, { indent: 2 })}`,
	)
}

/**
 * Unquote a string value.
 *
 * @param value - The value to parse.
 *
 * @returns The value without quotes if it is a string, null otherwise.
 */
export function getValueWithoutQuotes(value: PublicodesExpression | undefined) {
	if (
		typeof value !== 'string' ||
		!value.startsWith("'") ||
		value === 'oui' ||
		value === 'non'
	) {
		return null
	}
	return value.slice(1, -1)
}

/** Used by the CLI */

export const DEFAULT_BUILD_DIR = 'publicodes-build'
