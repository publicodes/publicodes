import type * as Ast from '../ast'

/**
 * A small AST built from a description, so a test says what it exercises and nothing
 * more. Node ids come from the path that reaches them: `total` for the value of the
 * rule `total`, `total.0` for its first term — a trace written by hand then reads as
 * the model does.
 */
export interface Node {
	fields: Record<string, unknown>
	slots: Slot[]
}

interface Slot {
	/** Where the child is written in the parent's JSON, one key per segment. */
	place: readonly (string | number)[]
	/** What the child appends to its parent's id. Empty keeps the parent's. */
	id: string
	child: Node
}

const POSITION: Ast.ASTNodePosition = {
	file: 'test.publicodes',
	start: { index: 0, line: 1, column: 1 },
	end: { index: 1, line: 1, column: 2 },
}

const node = (
	fields: Record<string, unknown> = {},
	slots: Slot[] = [],
): Node => ({ fields, slots })

const slot = (
	place: readonly (string | number)[],
	id: string,
	child: Node,
): Slot => ({ place, id, child })

/** A node is a mechanism when it carries a `kind`; a chained value carries none. */
const isMechanism = (draft: Node): boolean => 'kind' in draft.fields

/** A value, then the mechanisms that hang off it. */
const chained = (value: Node, ...chain: Node[]): Node =>
	node({ chained_mechanisms: [] }, [
		slot(['value_mechanism'], '', value),
		...chain.map((mechanism, index) =>
			slot(
				['chained_mechanisms', index],
				String(mechanism.fields.kind),
				mechanism,
			),
		),
	])

/** The chained value a mechanism's own parameters are: a bare mechanism is wrapped. */
const asChained = (draft: Node): Node =>
	isMechanism(draft) ? chained(draft) : draft

const withKind = (kind: string, slots: Slot[] = []): Node =>
	node({ kind }, slots)

// Expressions, under the `parameters` of the `expr` mechanism.

export const constant = (value: number): Node =>
	node({ kind: 'constant', parameters: { kind: 'const_number', value } })

export const ref = (address: string): Node =>
	node({ kind: 'ref', parameters: address })

export const binary = (
	kind: Ast.BinaryOperationExpression['kind'],
	left: Node,
	right: Node,
): Node =>
	node({ kind }, [
		slot(['parameters', 'left'], 'left', left),
		slot(['parameters', 'right'], 'right', right),
	])

export const neg = (expression: Node): Node =>
	node({ kind: 'neg' }, [slot(['parameters'], 'neg', expression)])

// Value mechanisms.

export const expr = (parameters: Node): Node =>
	withKind('expr', [slot(['parameters'], 'expr', parameters)])

export const notDefined = (): Node => withKind('not_defined')

const list = (kind: string, operands: Node[]): Node =>
	withKind(
		kind,
		operands.map((operand, index) =>
			slot(['parameters', index], String(index), asChained(operand)),
		),
	)

export const sum = (...operands: Node[]): Node => list('sum', operands)
export const product = (...operands: Node[]): Node => list('product', operands)

export interface Branch {
	if: Node
	then: Node
}

export const variations = (conditions: Branch[], otherwise?: Node): Node =>
	node({ kind: 'variations' }, [
		...conditions.flatMap((branch, index) => [
			slot(
				['parameters', 'conditions', index, 'if'],
				`if${index}`,
				asChained(branch.if),
			),
			slot(
				['parameters', 'conditions', index, 'then'],
				`then${index}`,
				asChained(branch.then),
			),
		]),
		...(otherwise === undefined ?
			[]
		:	[slot(['parameters', 'else'], 'else', asChained(otherwise))]),
	])

// Chained mechanisms.

export const context = (bindings: Record<string, Node>): Node =>
	node({ kind: 'context' }, [
		...Object.entries(bindings).map(([name, child]) =>
			slot(['parameters', name], name, asChained(child)),
		),
	])

export const defaultTo = (parameters: Node): Node =>
	withKind('default', [slot(['parameters'], 'value', asChained(parameters))])

/** `applicable si`, et son contraire : la condition qui ouvre ou ferme la règle. */
export const applicableIf = (condition: Node): Node =>
	withKind('applicable_if', [
		slot(['parameters'], 'condition', asChained(condition)),
	])

export const notApplicableIf = (condition: Node): Node =>
	withKind('not_applicable_if', [
		slot(['parameters'], 'condition', asChained(condition)),
	])

export interface RuleSpec {
	value: Node
	chain?: Node[]
	title?: string
	unit?: string
	parameters?: string[]
}

/** The whole model: a rule per address, given by its value or by what it declares. */
export function build(
	rules: Record<string, RuleSpec | Node>,
): Ast.PublicodeAST {
	const ast: Record<string, unknown> = {}
	for (const [address, given] of Object.entries(rules)) {
		const spec: RuleSpec = 'slots' in given ? { value: given } : given
		const unit = spec.unit ?? '€'
		ast[address] = {
			...authored(spec),
			type: 'number',
			unit,
			id: address,
			position: POSITION,
			parameters: spec.parameters ?? [],
			chained_mechanisms: [],
			...stamp(chained(spec.value, ...(spec.chain ?? [])), address, unit),
		}
	}
	return ast as Ast.PublicodeAST
}

/** What the author wrote, without the keys they left out. */
const authored = (spec: RuleSpec): Record<string, unknown> =>
	spec.title === undefined ? {} : { title: spec.title }

/** The JSON of a node, with its id, its position and the unit of its rule. */
const stamp = (
	draft: Node,
	id: string,
	unit: string,
): Record<string, unknown> => {
	const built: Record<string, unknown> = { ...draft.fields }
	if (isMechanism(draft)) {
		Object.assign(built, { type: 'number', unit, id, position: POSITION })
	}
	if (built.kind === 'constant') {
		const parameters = built.parameters as Record<string, unknown>
		if (parameters.kind === 'const_number' && parameters.unit === undefined) {
			built.parameters = { ...parameters, unit }
		}
	}
	for (const { place, id: suffix, child } of draft.slots) {
		placeIn(
			built,
			place,
			stamp(child, suffix === '' ? id : `${id}.${suffix}`, unit),
		)
	}
	return built
}

/** Writes `value` at a path, creating objects and arrays on the way. */
const placeIn = (
	container: Record<string, unknown>,
	place: readonly (string | number)[],
	value: unknown,
): void => {
	let cursor: Record<string, unknown> = container
	for (const [index, key] of place.slice(0, -1).entries()) {
		cursor[key] ??= typeof place[index + 1] === 'number' ? [] : {}
		cursor = cursor[key] as Record<string, unknown>
	}
	cursor[place[place.length - 1]] = value
}
