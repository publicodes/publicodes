import { describe, it, expect } from 'vitest'
import type { PublicodeAST } from './ast'
import type { Trace, TraceValue } from './trace'
import { NotApplicable, NotDefined } from './trace'
import type { EquationView, OperandView, RuleView } from './projection/types'
import { openRow, projectRule } from './projection'
import astFixture from './fixtures/simple-TJM.autodoc.json'
import traceFixture from './fixtures/simple-TJM.trace.json'

/**
 * `simple-TJM` est le seul modèle dont une règle publique est évaluée sous un
 * `contexte`, et le seul dont une somme porte une négation : les deux faits que ce
 * fichier vérifie, et les deux endroits où l'engine écrit la valeur ailleurs que sur
 * le nœud que la vue lisait.
 */
const doc = astFixture as unknown as PublicodeAST
const RULE = traceFixture.rule

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
			Object.entries(stacks as Record<string, Encoded>).map(
				([stack, value]) => [stack, revive(value)],
			),
		),
	]),
) as Trace

const context = Object.fromEntries(
	Object.entries(traceFixture.context as Record<string, Encoded>).map(
		([key, value]) => [key, revive(value)],
	),
) as Record<string, TraceValue>

const evaluated = {
	evaluation: { trace, evaluatedRule: RULE },
	context,
}

/** La pile que l'engine ouvre sous un `contexte` : celle de l'appelant, puis l'id. */
const contextMechanism = doc[RULE].chained_mechanisms.find(
	(mechanism) => mechanism.kind === 'context',
)!
const underTheContext = `-${contextMechanism.id}`

const contextRow = (view: RuleView): OperandView | undefined =>
	view.equation?.rows.find((row) => row.gutter === 'contexte')

const sheetOf = (
	equation: EquationView | null,
	key: string,
): EquationView | null =>
	equation?.rows.find((row) => row.key === key)?.detail ?? null

/** La page tout ouverte : chaque feuille qu'elle peut imprimer est imprimée. */
const everythingOpen = (): RuleView => {
	let expanded = new Set<string>()
	let view = projectRule(doc, RULE, { ...evaluated, expanded })
	for (let pass = 0; pass < 20; pass++) {
		const fresh = keysOf(view.equation).filter((key) => !expanded.has(key))
		if (fresh.length === 0) break
		expanded = new Set([...expanded, ...fresh])
		view = projectRule(doc, RULE, { ...evaluated, expanded })
	}
	return view
}

const keysOf = (
	equation: EquationView | null,
	out: string[] = [],
): string[] => {
	for (const row of equation?.rows ?? []) {
		if (row.key !== null) out.push(row.key)
		keysOf(row.detail, out)
	}
	return out
}

describe('a rule evaluated under a `contexte`', () => {
	it('answers with the value the engine returned, not the one under its stack', () => {
		const view = projectRule(doc, RULE, evaluated)
		expect(view.equation?.head?.value.state).toBe('value')
		expect(view.equation?.head?.value.value).toBe(traceFixture.value)
		expect(view.equation?.head?.value.text).toBe('1\u202f350 €')
	})

	it('reads what the computation under it is worth, on the stack it pushes', () => {
		const expanded = openRow(doc, RULE, 'revenu net', evaluated)
		const sheet = sheetOf(
			projectRule(doc, RULE, { ...evaluated, expanded }).equation,
			'revenu net',
		)
		expect(sheet?.result.text).toBe('1\u202f350 €')
		expect(
			sheet?.rows.find((row) => row.address === "chiffre d'affaires")?.value
				.text,
		).toBe('3\u202f000 €')
	})
})

describe('the line a `contexte` gets', () => {
	it('names the mechanism and carries no figure: the rule’s value is printed above', () => {
		const row = contextRow(projectRule(doc, RULE, evaluated))
		expect(row?.gutter).toBe('contexte')
		expect(row?.label).toBeNull()
		expect(row?.value.state).toBe('absent')
	})

	it('prints the values it binds without being asked, and cannot be folded', () => {
		const row = contextRow(projectRule(doc, RULE, evaluated))
		expect(row?.key).toBeNull()
		expect(row?.control).toBeNull()
		expect(row?.open).toBe(true)
		expect(
			row?.detail?.context?.map((entry) => [entry.name, entry.value.text]),
		).toEqual([['TJM', '600 €/jour']])
	})
})

describe('a rule a `par défaut` decides', () => {
	it('takes the value of that mechanism, where the stack puts it', () => {
		const view = projectRule(doc, 'auto-entrepreneur', {
			...evaluated,
			contextStackId: underTheContext,
		})
		expect(view.equation?.head?.value.state).toBe('value')
		expect(view.equation?.head?.value.text).toBe('non')
	})
})

describe('a term the engine writes on its operation', () => {
	it('carries the sign of what it is written as', () => {
		const sheet = sheetOf(everythingOpen().equation, 'revenu net')
		const negated = sheet?.rows.find((row) => row.term === 'Cotisations')
		// the sign is the line's: `a − b − c`, where `b` says what it is worth and opens
		// onto its own rule rather than onto the negation the engine wrote
		expect(negated?.gutter).toBe('−')
		expect(negated?.value.text).toBe('1\u202f350 €')
		expect(negated?.key).toBe('cotisations')
	})
})

describe('what annotates a value, and what composes it', () => {
	it('marks the annotations, so a view can separate them from the terms', () => {
		// `nombre de jour` est un paramètre : sa fiche ne porte que son `par défaut`
		const annotated = projectRule(
			doc,
			"chiffre d'affaires . nombre de jour",
			evaluated,
		).equation
		expect(annotated?.rows.length).toBeGreaterThan(0)
		expect(annotated?.rows.every((row) => row.modifier)).toBe(true)
	})

	it('leaves the terms of an expression unmarked', () => {
		const terms = sheetOf(everythingOpen().equation, 'revenu net')?.rows ?? []
		expect(terms.length).toBeGreaterThan(0)
		expect(terms.every((row) => !row.modifier)).toBe(true)
	})
})
