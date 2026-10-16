import { describe, it, expect } from 'vitest'
import type { PublicodeAST, RuleDefinition } from './ast'
import type { Trace, TraceValue } from './trace'
import { NotApplicable, NotDefined } from './trace'
import { projectRule } from './projection'
import { capitalizeFirst } from './projection/names'
import astFixture from './fixtures/auto-entrepreneur.autodoc.json'
import traceFixture from './fixtures/auto-entrepreneur.trace.json'

const doc = astFixture as unknown as PublicodeAST
const RULE = 'dirigeant . auto-entrepreneur . revenu net'

type Encoded = string | number | boolean | null | { '@date': string }
const revive = (value: Encoded): TraceValue =>
	value === '@@not_defined' ? NotDefined
	: value === '@@not_applicable' ? NotApplicable
	: value !== null && typeof value === 'object' ? new Date(value['@date'])
	: (value as TraceValue)

const trace = Object.fromEntries(
	Object.entries(traceFixture.trace).map(([id, stacks]) => [
		id,
		Object.fromEntries(
			Object.entries(stacks as Record<string, Encoded>).map(([stack, value]) => [
				stack,
				revive(value),
			]),
		),
	]),
) as Trace

const context = Object.fromEntries(
	Object.entries(traceFixture.context as Record<string, Encoded>).map(([key, value]) => [
		key,
		revive(value),
	]),
) as Record<string, TraceValue>
const evaluated = { evaluation: { trace }, context }

describe('projectRule — names', () => {
	it('names every rule by its title, or the leaf of its address when it has none', () => {
		for (const [name, rule] of Object.entries(doc)) {
			const leaf = name.split(' . ').slice(-1)[0]
			expect(projectRule(doc, name).name).toBe(
				capitalizeFirst((rule as RuleDefinition).title ?? leaf),
			)
		}
	})
})

describe('projectRule — the answer', () => {
	it('reads the rule value from the trace at its own node', () => {
		const view = projectRule(doc, RULE, evaluated)
		expect(view.fill).toBe('evaluated')
		expect(view.equation?.result.state).toBe('value')
		expect(view.equation?.result.text).toBe('13\u202f930 €/an')
	})

	it('shows the structure alone, without a trace', () => {
		const view = projectRule(doc, RULE)
		expect(view.fill).toBe('generic')
		expect(view.equation?.result.state).toBe('absent')
		expect(view.equation?.rows.length).toBeGreaterThan(0)
	})
})

describe('projectRule — branches', () => {
	const variationsIn = (resolved: boolean) =>
		Object.entries(doc).find(([, definition]) => {
			if (definition.value_mechanism.kind !== 'variations') return false
			const stacks = trace[definition.value_mechanism.id]
			if (!stacks) return false
			return Object.values(stacks).some(
				(value) => (typeof value !== 'symbol') === resolved,
			)
		})

	const stackOf = (id: string, resolved: boolean): string =>
		Object.entries(trace[id]).find(
			([, value]) => (typeof value !== 'symbol') === resolved,
		)![0]

	it('marks exactly one branch of a resolved variations as applied', () => {
		const rule = variationsIn(true)
		expect(rule).toBeDefined()
		const [name, definition] = rule!
		const stack = stackOf(definition.value_mechanism.id, true)
		const view = projectRule(doc, name, { ...evaluated, contextStackId: stack })
		const branches = (view.equation?.rows ?? []).filter((row) =>
			['alors', 'sinon'].includes(row.gutter),
		)
		expect(branches.filter((branch) => !branch.inert)).toHaveLength(1)
	})

	it('applies no branch when the mechanism itself did not resolve', () => {
		const [, definition] = variationsIn(true)!
		const id = definition.value_mechanism.id
		const unresolved: Trace = { [id]: { '': NotDefined } }
		const view = projectRule(doc, 'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux', {
			evaluation: { trace: unresolved },
			context,
		})
		expect(view.equation?.result.state).toBe('not_defined')
		expect(
			(view.equation?.rows ?? []).filter((row) => !row.inert),
		).toHaveLength(0)
	})
})

describe('projectRule — a rule with no computation of its own', () => {
	it('projects an equation with nothing to unfold', () => {
		const view = projectRule(
			doc,
			"dirigeant . auto-entrepreneur . chiffre d'affaires",
			evaluated,
		)
		expect(view.equation?.rows).toHaveLength(0)
	})
})

describe('projectRule — the context', () => {
	it('marks a supplied input as fournie, with its value', () => {
		const view = projectRule(doc, RULE, evaluated)
		const bic = view.context.find(
			(entry) => entry.address === "entreprise . chiffre d'affaires . BIC",
		)
		expect(bic?.state).toBe('fournie')
		expect(bic?.value.text).toBe('10\u202f000 €/an')
	})

	it('lists what the computation reached but the context lacks', () => {
		const view = projectRule(doc, RULE, evaluated)
		expect(
			view.context.some((entry) => entry.state === 'non renseignée'),
		).toBe(true)
	})

	it('orders the actionable entries first', () => {
		const view = projectRule(doc, RULE, evaluated)
		const states = view.context.map((entry) => entry.state)
		expect(states).toEqual([...states].sort((a, b) => rank(a) - rank(b)))
	})
})

const rank = (state: string): number =>
	state === 'non renseignée' ? 0 : state === 'par défaut' ? 1 : 2

describe('projectRule — the reverse graph', () => {
	it('lists the rules that consume an input', () => {
		const view = projectRule(doc, "entreprise . chiffre d'affaires . BIC")
		expect(view.usedBy.length).toBeGreaterThan(0)
	})
})

describe('projectRule — parameters', () => {
	it('takes a parameter value from the context, which is where it lives', () => {
		const view = projectRule(doc, "entreprise . chiffre d'affaires . BIC", evaluated)
		expect(view.equation?.result.state).toBe('value')
		expect(view.equation?.result.text).toBe('10\u202f000 €/an')
	})
})

describe('projectRule — what the computation reached', () => {
	it('lists only the parameters the evaluation needed', () => {
		const needed = [
			"entreprise . chiffre d'affaires . BIC",
			'entreprise . date de création',
			'date',
		]
		const view = projectRule(doc, RULE, {
			evaluation: { trace, usedParameters: needed },
			context,
		})
		expect(view.context.map((entry) => entry.address)).toEqual([
			'entreprise . date de création',
			"entreprise . chiffre d'affaires . BIC",
			'date',
		])
	})

	it('says which of them the context does not supply', () => {
		const needed = [
			"entreprise . chiffre d'affaires . BIC",
			'entreprise . date de création',
		]
		const view = projectRule(doc, RULE, {
			evaluation: { trace, usedParameters: needed },
			context,
		})
		expect(
			view.context.filter((entry) => entry.state === 'non renseignée').map((e) => e.address),
		).toEqual(['entreprise . date de création'])
	})
})

describe('a mechanism a row cannot write out', () => {
	const position = { file: 'test.publicodes', start: { index: 0, line: 1, column: 1 }, end: { index: 1, line: 1, column: 2 } }
	const expr = (id: string, parameters: unknown) => ({
		kind: 'expr', id, type: 'number', unit: '€', position, parameters,
	})
	const constant = (id: string, value: number) => ({
		kind: 'constant', id, type: 'number', unit: '€', position,
		parameters: { kind: 'const_number', value, unit: '€' },
	})
	const chained = (value_mechanism: unknown) => ({ value_mechanism, chained_mechanisms: [] })
	// a variations is written by no operator, so a row shows its word
	const variations = {
		kind: 'variations', id: 'v', type: 'number', unit: '€', position,
		parameters: {
			conditions: [{ if: chained(expr('e-if', constant('c-if', 1))), then: chained(expr('e-then', constant('c-then', 6))) }],
			else: chained(expr('e-else', constant('c-else', 6))),
		},
	}
	const inline = {
		total: {
			title: 'Total', type: 'number', unit: '€', id: 's', position,
			referenced_by: [], parameters: [],
			value_mechanism: {
				kind: 'sum', id: 's', type: 'number', unit: '€', position,
				parameters: [chained(expr('e-4', constant('c-4', 4))), chained(variations)],
			},
			chained_mechanisms: [],
		},
	} as unknown as PublicodeAST

	it('names the mechanism on the row, and leaves the written form alone', () => {
		// with an evaluation, the row's figure stands in the value column, so the
		// middle names the mechanism rather than repeating it
		const resolved: Trace = { s: { '': 10 }, v: { '': 6 } }
		const view = projectRule(inline, 'total', { evaluation: { trace: resolved } })
		expect(view.equation?.rows[1]?.term).toBe('variations')
		expect(view.equation?.rows[1]?.termIsMechanism).toBe(true)
		// the sum's own written form is its operands, not the words of a mechanism
		expect(view.equation?.inlineTerm).not.toContain('variations')
	})

	it('leaves an operator its word', () => {
		const view = projectRule(inline, 'total')
		expect(view.equation?.rows[0]?.termIsMechanism).toBe(false)
	})
})
