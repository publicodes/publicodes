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

describe('deux lignes sœurs', () => {
	// « revenu net » = chiffre d'affaires − cotisations − charges : trois sœurs dans la fiche
	const ouvrir = (key: string, expanded?: ReadonlySet<string>) =>
		openRow(doc, RULE, key, expanded === undefined ? {} : { expanded })

	it('n’en laisse qu’une dépliée à la fois', () => {
		const page = ouvrir('revenu net')
		const premiere = ouvrir(`chiffre d'affaires`, page)
		expect(premiere.has(`chiffre d'affaires`)).toBe(true)
		const seconde = ouvrir('charges', premiere)
		expect(seconde.has('charges')).toBe(true)
		expect(seconde.has(`chiffre d'affaires`)).toBe(false)
	})

	it('se souvient de ce qu’une sœur refermée avait ouvert', () => {
		const page = ouvrir('revenu net')
		const premiere = ouvrir(`chiffre d'affaires`, page)
		const sonInterne = ouvrir(`chiffre d'affaires . TJM`, premiere)
		expect(sonInterne.has(`chiffre d'affaires . TJM`)).toBe(true)
		const seconde = ouvrir('charges', sonInterne)
		// la première s'est refermée ; ce qu'elle avait ouvert, non
		expect(seconde.has(`chiffre d'affaires`)).toBe(false)
		expect(seconde.has(`chiffre d'affaires . TJM`)).toBe(true)
		// la rouvrir la rend telle qu'on l'avait laissée
		const rouverte = ouvrir(`chiffre d'affaires`, seconde)
		expect(rouverte.has(`chiffre d'affaires . TJM`)).toBe(true)
	})
})

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

	it('names the column of what it binds', () => {
		const sheet = contextRow(projectRule(doc, RULE, evaluated))?.detail
		expect(sheet?.header).toBe('valeur du paramètre')
		// et une feuille de calcul n'en a pas : ses lignes ne sont pas nommées, elles se lisent
		expect(sheetOf(everythingOpen().equation, 'revenu net')?.header).toBeNull()
	})

	it('prints what it binds without being asked, and cannot be folded', () => {
		const row = contextRow(projectRule(doc, RULE, evaluated))
		expect(row?.key).toBeNull()
		expect(row?.control).toBeNull()
		expect(row?.open).toBe(true)
		// ses lignes : la règle liée, sa valeur, et rien à ouvrir — c'est une constante
		const lines = row?.detail?.rows ?? []
		expect(lines.map((line) => [line.label, line.value.text])).toEqual([
			['TJM', '600 €/jour'],
		])
		expect(lines[0].key).toBeNull()
		expect(lines[0].detail).toBeNull()
		// et pas de marque de paramètre : c'est le modèle qui donne cette valeur, pas le lecteur
		expect(lines[0].parameter).toBeNull()
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

describe('a `contexte` in its rule’s chain', () => {
	it('is marked as the chain, not as the value: the value is the line above it', () => {
		const rows = projectRule(doc, RULE, evaluated).equation?.rows ?? []
		const context = rows.find((row) => row.gutter === 'contexte')
		expect(context?.modifier).toBe(true)
		expect(rows[rows.indexOf(context!) - 1]?.modifier).toBe(false)
	})
})

describe('a bound value that is a computation', () => {
	// le modèle d'exemple ne lie qu'une constante : on construit ici une liaison calculée
	const position = {
		file: 'test.publicodes',
		start: { index: 0, line: 1, column: 1 },
		end: { index: 1, line: 1, column: 2 },
	}
	const leaf = (name: string) => ({
		value_mechanism: {
			kind: 'not_defined',
			id: `n-${name}`,
			type: 'number',
			unit: '€',
			position,
		},
		chained_mechanisms: [],
	})
	const expr = (id: string, parameters: unknown) => ({
		value_mechanism: {
			kind: 'expr',
			id,
			type: 'number',
			unit: '€',
			position,
			parameters,
		},
		chained_mechanisms: [],
	})
	const ref = (id: string, address: string) => ({
		kind: 'ref',
		id,
		type: 'number',
		unit: '€',
		position,
		parameters: address,
	})
	const constant = (id: string, value: number) => ({
		kind: 'constant',
		id,
		type: 'number',
		unit: '€',
		position,
		parameters: { kind: 'const_number', value, unit: '€' },
	})
	const computed = {
		honoraire: {
			type: 'number',
			unit: '€',
			id: 'r-h',
			position,
			parameters: [],
			value_mechanism: {
				kind: 'value',
				id: 'v-h',
				type: 'number',
				unit: '€',
				position,
				parameters: expr('e-h', ref('r-b', 'base')),
			},
			chained_mechanisms: [
				{
					kind: 'context',
					id: 'ctx',
					type: 'number',
					unit: '€',
					position,
					parameters: {
						base: expr('e-b', {
							kind: 'mul',
							id: 'm-b',
							type: 'number',
							unit: '€',
							position,
							parameters: {
								left: constant('c-1', 2),
								right: constant('c-2', 3),
							},
						}),
					},
				},
			],
		},
		base: {
			type: 'number',
			unit: '€',
			id: 'n-base',
			position,
			parameters: [],
			...leaf('base'),
		},
	} as unknown as PublicodeAST
	const computedTrace = {
		ctx: { '': 6 },
		'e-h': { '-ctx': 6 },
		'r-b': { '-ctx': 6 },
		'e-b': { '': 6 },
		'm-b': { '': 6 },
		'c-1': { '': 2 },
		'c-2': { '': 3 },
	} as unknown as Trace
	const computedEvaluated = {
		evaluation: { trace: computedTrace },
		context: { base: 2 } as Record<string, TraceValue>,
	}
	const linesOf = (expanded?: ReadonlySet<string>) =>
		contextRow(
			projectRule(computed, 'honoraire', { ...computedEvaluated, expanded }),
		)?.detail?.rows ?? []

	it('opens where it is read, as a line of the computation does', () => {
		const [line] = linesOf()
		expect(line.label).toBe('Base')
		expect(line.value.text).toBe('6 €')
		expect(line.key).not.toBeNull()
		expect(line.open).toBe(false)
		// son calcul : le produit qui l'a produite
		const opened = linesOf(
			openRow(computed, 'honoraire', line.key!, computedEvaluated),
		)
		expect(opened[0].open).toBe(true)
		expect(opened[0].detail?.rows.length).toBe(2)
	})

	it('says a constant once: the term that repeats the value is dropped', () => {
		const [line] = linesOf()
		const sheet = linesOf(
			openRow(computed, 'honoraire', line.key!, computedEvaluated),
		)[0].detail
		expect(
			sheet?.rows.map((row) => [row.gutter, row.term, row.value.text]),
		).toEqual([
			['', null, '2 €'],
			['×', null, '3 €'],
		])
	})

	it('is not offered when the binding holds nothing but a constant', () => {
		// le `contexte` du modèle d'exemple lie `600 €/jour`, une constante
		const [line] =
			contextRow(projectRule(doc, RULE, evaluated))?.detail?.rows ?? []
		expect(line.key).toBeNull()
		expect(line.detail).toBeNull()
	})
})
