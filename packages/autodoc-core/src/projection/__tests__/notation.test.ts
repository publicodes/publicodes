/** L'écriture du calcul : les branches, les mots de mécanismes, les opérateurs, les fiches. */
import { describe, it, expect } from 'vitest'
import type { Trace } from '../../trace'
import { NotDefined } from '../../trace'
import type { EquationView } from '../types'
import { projectRule } from '../index'
import {
	binary,
	build,
	constant,
	defaultTo,
	expr,
	neg,
	notDefined,
	ref,
	sum,
	variations,
} from '../../test-helpers/fixtures'

describe('the branches a variations resolved', () => {
	// une condition, une conséquence, un `sinon` : `taux` vaut 30 % ou 45 %
	const doc = build({
		taux: {
			value: variations(
				[{ if: binary('gt', ref('base'), constant(100)), then: constant(30) }],
				constant(45),
			),
		},
		base: { value: notDefined() },
	})
	const stack = ''
	const resolved: Trace = {
		taux: { [stack]: 30 },
		'taux.if0': { [stack]: true },
		'taux.if0.left': { [stack]: 120 },
		'taux.if0.right': { [stack]: 100 },
		'taux.then0': { [stack]: 30 },
		'taux.else': { [stack]: 45 },
	}
	const project = (trace: Trace | undefined, folds?: Record<string, boolean>) =>
		projectRule(
			doc,
			'taux',
			trace === undefined ?
				{}
			:	{ evaluation: { trace }, ...(folds === undefined ? {} : { folds }) },
		)

	it('marks exactly one branch of a resolved variations as applied', () => {
		const branches = (project(resolved).equation?.rows ?? []).filter((row) =>
			['alors', 'sinon'].includes(row.gutter),
		)
		expect(branches).toHaveLength(2)
		expect(branches.filter((branch) => !branch.inert)).toHaveLength(1)
		expect(branches.find((branch) => !branch.inert)?.gutter).toBe('alors')
	})

	it('offre les branches qu’il n’a pas retenues par son pli', () => {
		// révéler le pli ne montre pas d'autres lignes : les mêmes, dépliées
		const hidden = project(resolved, { taux: false }).equation
		const shown = project(resolved, { taux: true }).equation
		expect(hidden?.fold?.count).toBe(1)
		expect(hidden?.rows.filter((row) => row.folded)).toHaveLength(1)
		expect(shown?.rows.some((row) => row.folded)).toBe(false)
	})

	it('reads nothing, marks nothing and holds nothing back without an evaluation', () => {
		const sheet = project(undefined).equation
		// la condition n'a pas été examinée : elle n'a pas de valeur, et surtout pas « non »
		expect(sheet?.rows.find((row) => row.gutter === 'si')?.value.state).toBe(
			'absent',
		)
		// rien n'a rien fait : aucune ligne n'est éteinte, donc aucune n'est retenue
		expect(sheet?.rows.filter((row) => row.inert)).toHaveLength(0)
		expect(sheet?.fold).toBeNull()
	})

	it('applies no branch when the mechanism itself did not resolve', () => {
		const view = project({ taux: { '': NotDefined } })
		expect(view.equation?.result.state).toBe('not_defined')
		expect(
			(view.equation?.rows ?? []).filter((row) => !row.inert),
		).toHaveLength(0)
	})
})

describe('a conditional whose branch was kept', () => {
	const doc = build({
		taux: {
			value: variations(
				[{ if: binary('gt', ref('base'), constant(100)), then: constant(3) }],
				constant(1),
			),
		},
		base: { value: notDefined() },
	})
	const sheet = (trace: Trace) =>
		projectRule(doc, 'taux', { evaluation: { trace } })
	// la condition a tenu : `si` et `alors` disent la valeur, le `sinon` est retenu
	const conditionKept = sheet({
		taux: { '': 3 },
		'taux.if0': { '': true },
		'taux.then0': { '': 3 },
		'taux.else': { '': 1 },
	})
	// c'est le `sinon` qui a tenu : rien ne dit pourquoi, ses conditions viennent avec
	const sinonKept = sheet({
		taux: { '': 1 },
		'taux.if0': { '': false },
		'taux.then0': { '': 3 },
		'taux.else': { '': 1 },
	})

	it('prints the condition it kept, and holds the others back', () => {
		// toutes les lignes sont dans l'équation ; celles que le pli retient sont marquées
		const visible = (conditionKept.equation?.rows ?? []).filter(
			(row) => !row.folded,
		)
		expect(visible.map((row) => row.gutter)).toEqual(['si', 'alors'])
		expect(conditionKept.equation?.rows.map((row) => row.gutter)).toEqual([
			'si',
			'alors',
			'sinon',
		])
		expect(conditionKept.equation?.fold?.expanded).toBe(false)
		expect(conditionKept.equation?.fold?.count).toBe(1)
	})

	it('prints all of them when the `sinon` it kept explains nothing on its own', () => {
		expect(sinonKept.equation?.rows.every((row) => !row.folded)).toBe(true)
		expect(sinonKept.equation?.fold?.expanded).toBe(true)
		// the reader can still fold them back: the control stays
		expect(sinonKept.equation?.fold?.count).toBe(2)
	})
})

describe('ce qu’un modificateur vaut', () => {
	const doc = build({
		délai: { value: notDefined(), chain: [defaultTo(expr(constant(16)))] },
	})

	it('porte sa valeur à droite, comme toute valeur', () => {
		// le moteur n'écrit pas de trace pour un littéral : sa valeur est ce qu'il dit
		const row = (projectRule(doc, 'délai').equation?.rows ?? []).find(
			(one) => one.gutter === 'par défaut',
		)
		expect([row?.label, row?.value.text]).toEqual([null, '16 €'])
	})
})

describe('a mechanism a row cannot write out', () => {
	// une somme dont le second terme est une `variations` : aucun opérateur ne l'écrit
	const doc = build({
		total: {
			title: 'Total',
			value: sum(
				expr(constant(4)),
				variations(
					[{ if: binary('gt', ref('base'), constant(1)), then: constant(6) }],
					constant(6),
				),
			),
		},
		base: { value: notDefined() },
	})

	it('names the mechanism on the row, and leaves the written form alone', () => {
		// with an evaluation, the row's figure stands in the value column, so the
		// middle names the mechanism rather than repeating it
		const resolved: Trace = { total: { '': 10 }, 'total.1': { '': 6 } }
		const view = projectRule(doc, 'total', { evaluation: { trace: resolved } })
		const mechanism = view.equation?.rows.find((row) => row.termIsMechanism)
		expect(mechanism?.label).toBe('variations')
		// the sum's own written form is its operands, not the words of a mechanism
		expect(view.equation?.inlineTerm).not.toContain('variations')
	})

	it('opens on what explains it when no evaluation can', () => {
		// la ligne du mécanisme porte son nom : repliée, elle ne dirait rien
		const view = projectRule(doc, 'total')
		const row = view.equation?.rows[1]
		expect(row?.termIsMechanism).toBe(true)
		expect(row?.detail).not.toBeNull()
		// avec une évaluation, elle se replie : sa valeur dit ce qu'elle vaut
		const evaluated = projectRule(doc, 'total', {
			evaluation: { trace: { total: { '': 10 }, 'total.1': { '': 6 } } },
		})
		expect(evaluated.equation?.rows[1]?.detail).toBeNull()
	})

	it('keeps the place of what it cannot write', () => {
		// sans forme écrite ni valeur, la place reste tenue : `4 € +` tout court se
		// lirait comme une troncature
		expect(projectRule(doc, 'total').equation?.inlineTerm).toBe('4 € + …')
	})

	it('leaves an operator its word', () => {
		expect(projectRule(doc, 'total').equation?.rows[0]?.termIsMechanism).toBe(
			false,
		)
	})
})

describe('ce qu’une référence ouvre', () => {
	const doc = build({
		total: { value: sum(expr(ref('part')), expr(ref('quatre'))) },
		part: { value: notDefined() },
		quatre: { value: expr(constant(4)) },
	})
	const row = (address: string) =>
		(projectRule(doc, 'total').equation?.rows ?? []).find(
			(candidate) => candidate.address === address,
		)

	it('s’ouvre sur une règle, qui a une fiche à montrer', () => {
		expect(row('part')?.key).toBe('part')
		expect(row('part')?.control).toBe('term')
	})

	it('ne s’ouvre pas sur une constante brute, dont la valeur est la ligne', () => {
		expect(row('quatre')?.key).toBeNull()
		expect(row('quatre')?.detail).toBeNull()
	})
})

describe('le premier terme visible', () => {
	// une somme dont le premier terme ne compte pas : zéro
	const doc = build({
		total: { value: sum(expr(constant(0)), expr(constant(5))) },
	})
	const trace: Trace = {
		total: { '': 5 },
		'total.0': { '': 0 },
		'total.1': { '': 5 },
	}

	it('ne porte pas l’opérateur qui n’a plus de terme devant lui', () => {
		const rows =
			projectRule(doc, 'total', { evaluation: { trace } }).equation?.rows ?? []
		const visible = rows.filter((row) => !row.folded)
		expect(visible).toHaveLength(1)
		expect(visible[0].gutter).toBe('=')
		// le terme ne répète pas la valeur : la figure porte le montant, la ligne porte le nom
		expect(visible[0].value.text).toBe('5 €')
		// aucune ligne ne partage son identité : deux clés égales font disparaître une ligne
		expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
	})

	it('le porte de nouveau quand le pli est ouvert', () => {
		const rows =
			projectRule(doc, 'total', {
				evaluation: { trace },
				folds: { total: true },
			}).equation?.rows ?? []
		expect(rows.map((row) => row.gutter)).toEqual(['=', '+'])
	})
})

describe('the sheet a row opens', () => {
	// trois niveaux : `enveloppe` → `pot` → `total`
	const doc = build({
		enveloppe: { value: sum(expr(ref('pot'))) },
		pot: { value: sum(expr(ref('total'))) },
		total: { value: sum(expr(ref('part')), expr(constant(5))) },
		part: { value: notDefined() },
	})

	const walk = (equation: EquationView | null): void => {
		if (equation === null) return
		for (const row of equation.rows) {
			// a line is written on its sheet and opens the next one, whatever it opens
			expect(row.depth).toBe(equation.depth)
			if (row.detail === null) continue
			expect(row.detail.depth).toBe(equation.depth + 1)
			walk(row.detail)
		}
	}

	it('est un cran plus loin, à chaque cran', () => {
		const expanded = new Set(['pot', 'total', 'part'])
		walk(projectRule(doc, 'enveloppe', { expanded }).equation)
	})
})

describe('a chain of the same precedence', () => {
	const leaves = Object.fromEntries(
		['a', 'b', 'c'].map((name) => [name, { value: notDefined() }]),
	)
	// the compiler nests a chain on the right: `a + b + c` is `add(a, add(b, c))`
	const chain = (
		kind: 'add' | 'sub' | 'mul' | 'div' | 'pow' | 'lt',
		[first, second, third]: [string, string, string],
	) =>
		build({
			...leaves,
			règle: {
				value: expr(
					binary(
						kind,
						ref(first),
						binary(kind === 'mul' ? 'div' : kind, ref(second), ref(third)),
					),
				),
			},
		})
	const mixte = build({
		...leaves,
		règle: {
			value: expr(binary('add', ref('a'), binary('mul', ref('b'), ref('c')))),
		},
	})
	const guttersOf = (doc: ReturnType<typeof build>) =>
		(projectRule(doc, 'règle').equation?.rows ?? []).map((row) => row.gutter)

	it('writes a chain as one equation, on one level', () => {
		expect(guttersOf(chain('add', ['a', 'b', 'c']))).toEqual(['=', '+', '+'])
		expect(guttersOf(chain('mul', ['a', 'b', 'c']))).toEqual(['=', '×', '÷'])
	})

	it('turns the operators of the line it opens', () => {
		// `a − (b + c)` is `a − b − c`, and `a − (b − c)` is `a − b + c`
		expect(guttersOf(chain('sub', ['a', 'b', 'c']))).toEqual(['=', '−', '+'])
		expect(
			(
				projectRule(chain('sub', ['a', 'b', 'c']), 'règle').equation?.rows ?? []
			).map((row) => row.label),
		).toEqual(['A', 'B', 'C'])
	})

	it('keeps the nesting that carries a meaning', () => {
		// a power is right-associative and a comparison does not chain: the line keeps its
		// own sheet, and the multiplication under a sum is a term, not a line
		expect(guttersOf(chain('pow', ['a', 'b', 'c']))).toEqual(['=', '^'])
		expect(guttersOf(chain('lt', ['a', 'b', 'c']))).toEqual(['=', '<'])
		expect(guttersOf(mixte)).toEqual(['=', '+'])
		const term = projectRule(mixte, 'règle').equation?.rows[1]
		expect(term?.label).toBe('B × C')
		expect(term?.key).not.toBeNull()
	})
})

describe('a sum of negations', () => {
	const doc = build({
		'revenu net': {
			title: 'Revenu net',
			value: sum(
				expr(ref("chiffre d'affaires")),
				expr(neg(ref('cotisations'))),
				expr(neg(ref('charges'))),
			),
		},
		"chiffre d'affaires": { title: "Chiffre d'affaires", value: notDefined() },
		cotisations: { title: 'Cotisations', value: notDefined() },
		charges: { title: 'Charges', value: notDefined() },
	})

	it('writes the signs on the lines, not in the terms', () => {
		const view = projectRule(doc, 'revenu net')
		expect(view.equation?.inlineTerm).toBe(
			"Chiffre d'affaires − Cotisations − Charges",
		)
		expect(
			(view.equation?.rows ?? []).map((row) => [row.gutter, row.label]),
		).toEqual([
			['=', "Chiffre d'affaires"],
			['−', 'Cotisations'],
			['−', 'Charges'],
		])
	})
})
