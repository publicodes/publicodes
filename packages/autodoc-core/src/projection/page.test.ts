import { describe, it, expect } from 'vitest'
import type { Trace } from '../trace'
import { NotDefined } from '../trace'
import type { EquationView } from './types'
import { openRow, openedWithPage, projectRule } from './index'
import type { PublicodeAST } from '../ast'
import autoEntrepreneur from '../../../compiler/examples/auto-entrepreneur/model.publicodes.json'
import simpleTJM from '../../../compiler/examples/simple-TJM/model.publicodes.json'
import {
	binary,
	build,
	constant,
	expr,
	neg,
	notDefined,
	ref,
	sum,
	variations,
} from '../test-helpers/fixtures'

describe('l’ordre de la chaîne', () => {
	const doc = {
		...simpleTJM,
		...autoEntrepreneur,
	} as unknown as PublicodeAST

	it('ouvre le calcul par ses conditions d’applicabilité, et rejette le reste après', () => {
		// « charges » porte un `non applicable si` et un `par défaut` : la condition dit si la
		// règle s'applique, le défaut ne change qu'une valeur déjà trouvée
		const rows = projectRule(doc, 'charges').equation?.rows ?? []
		expect(rows.map((row) => row.gutter)).toEqual([
			'non applicable si',
			'par défaut',
		])
		expect(rows.map((row) => row.applicability)).toEqual([true, false])
	})

	it('met la condition avant les termes du mécanisme de valeur', () => {
		// « commerce » est une somme sous un `applicable si` : la condition se lit d'abord,
		// les termes ensuite — et le premier d'entre eux reste sans opérateur
		const rows =
			projectRule(
				doc,
				'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . commerce',
			).equation?.rows ?? []
		expect(rows[0]?.gutter).toBe('applicable si')
		expect(rows.slice(1).map((row) => row.gutter)).toEqual(['=', '+'])
	})
})

describe('projectRule — names', () => {
	const doc = build({
		'groupe . brut': { title: 'Brut', value: notDefined() },
		'groupe . net': { value: notDefined() },
	})

	it('names every rule by its title, or the leaf of its address when it has none', () => {
		expect(projectRule(doc, 'groupe . brut').name).toBe('Brut')
		expect(projectRule(doc, 'groupe . net').name).toBe('Net')
	})
})

describe('projectRule — the answer', () => {
	// `total` = `a` + 4, et la trace dit 12 à `total`, 8 à `a`
	const doc = build({
		total: { value: sum(expr(ref('a')), expr(constant(4))) },
		a: { value: notDefined() },
	})
	const trace: Trace = { total: { '': 12 }, 'total.0': { '': 8 } }

	it('reads the rule value from the trace at its own node', () => {
		const view = projectRule(doc, 'total', { evaluation: { trace } })
		expect(view.fill).toBe('evaluated')
		expect(view.equation?.result.state).toBe('value')
		// la valeur de la règle est celle de son nœud, pas celle de son premier terme
		expect(view.equation?.result.text).toBe('12 €')
		expect(view.equation?.rows[0].value.text).toBe('8 €')
	})

	it('shows the structure alone, without a trace', () => {
		const view = projectRule(doc, 'total')
		expect(view.fill).toBe('generic')
		expect(view.fillNote).not.toBeNull()
		expect(view.equation?.result.state).toBe('absent')
		expect(view.equation?.rows.length).toBeGreaterThan(0)
	})
})

describe('projectRule — branches', () => {
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

describe('projectRule — a rule with no computation of its own', () => {
	const doc = build({
		paramètre: { value: notDefined() },
	})

	it('projects an equation with nothing to unfold', () => {
		expect(projectRule(doc, 'paramètre').equation?.rows).toHaveLength(0)
	})

	it('says where a value the model does not compute comes from', () => {
		const view = projectRule(doc, 'paramètre')
		expect(view.equation?.note).not.toBeNull()
	})
})

describe('projectRule — the context', () => {
	const doc = build({
		total: {
			value: sum(expr(ref('assiette')), expr(ref('taux'))),
			parameters: ['assiette', 'taux'],
		},
		assiette: { value: notDefined() },
		taux: { value: notDefined() },
	})
	const trace: Trace = { total: { '': 112 }, 'total.0': { '': 100 } }
	const context = { assiette: 100 }
	const evaluated = { evaluation: { trace }, context }

	it('marks a supplied input as fournie, with its value', () => {
		const entry = projectRule(doc, 'total', evaluated).context.find(
			(entry) => entry.address === 'assiette',
		)
		expect(entry?.state).toBe('fournie')
		expect(entry?.value.text).toBe('100 €')
	})

	it('met en tête ce que le lecteur peut renseigner', () => {
		expect(
			projectRule(doc, 'total', evaluated).context.map((entry) => [
				entry.name,
				entry.state,
			]),
		).toEqual([
			['Taux', 'non renseignée'],
			['Assiette', 'fournie'],
		])
	})
})

describe('projectRule — the reverse graph', () => {
	const doc = build({
		total: { value: sum(expr(ref('assiette')), expr(constant(1))) },
		assiette: { value: notDefined(), referenced_by: ['total'] },
	})

	it('lists the rules that consume an input', () => {
		const view = projectRule(doc, 'assiette')
		expect(view.usedBy.map((rule) => rule.address)).toEqual(['total'])
		expect(view.usedBy[0].name).toBe('Total')
	})
})

describe('projectRule — parameters', () => {
	const doc = build({
		paramètre: { value: notDefined() },
		total: { value: sum(expr(ref('paramètre')), expr(constant(1))) },
	})

	it('takes a parameter value from the context, which is where it lives', () => {
		// le moteur rend la valeur d'un paramètre sans écrire de trace pour sa règle
		const view = projectRule(doc, 'paramètre', {
			context: { paramètre: 10_000 },
		})
		expect(view.equation?.result.state).toBe('value')
		expect(view.equation?.result.text).toBe('10\u202f000 €')
	})
})

describe('projectRule — what the computation reached', () => {
	const doc = build({
		total: {
			value: sum(expr(ref('a')), expr(ref('b'))),
			parameters: ['a', 'b'],
		},
		a: { value: notDefined() },
		b: { value: notDefined() },
	})
	const trace: Trace = { total: { '': 3 } }
	const context = { a: 1 }

	it('ne liste que les paramètres dont l’évaluation a eu besoin', () => {
		// `usedParameters` fait foi : le second paramètre n'a pas servi ici
		const view = projectRule(doc, 'total', {
			evaluation: { trace, usedParameters: ['a'] },
			context,
		})
		expect(view.context.map((entry) => entry.address)).toEqual(['a'])
	})

	it('says which of them the context does not supply', () => {
		const view = projectRule(doc, 'total', {
			evaluation: { trace, usedParameters: ['a', 'b'], missing: ['b'] },
			context,
		})
		expect(
			view.context
				.filter((entry) => entry.state === 'non renseignée')
				.map((entry) => entry.address),
		).toEqual(['b'])
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
		expect(view.equation?.rows[1]?.term).toBe('variations')
		expect(view.equation?.rows[1]?.termIsMechanism).toBe(true)
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
			expect(row.detail.paper).not.toBe(equation.paper)
			walk(row.detail)
		}
	}

	it('est un cran plus loin, et change de papier à chaque cran', () => {
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
			).map((row) => row.term),
		).toEqual(['A', 'B', 'C'])
	})

	it('keeps the nesting that carries a meaning', () => {
		// a power is right-associative and a comparison does not chain: the line keeps its
		// own sheet, and the multiplication under a sum is a term, not a line
		expect(guttersOf(chain('pow', ['a', 'b', 'c']))).toEqual(['=', '^'])
		expect(guttersOf(chain('lt', ['a', 'b', 'c']))).toEqual(['=', '<'])
		expect(guttersOf(mixte)).toEqual(['=', '+'])
		const term = projectRule(mixte, 'règle').equation?.rows[1]
		expect(term?.term).toBe('B × C')
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
			(view.equation?.rows ?? []).map((row) => [row.gutter, row.term]),
		).toEqual([
			['=', "Chiffre d'affaires"],
			['−', 'Cotisations'],
			['−', 'Charges'],
		])
	})
})

describe('opening a row', () => {
	// two rules hop from the page to a sheet that prints two lines: `enveloppe` prints
	// one line, `pot` one line, `total` two, and `solo` a figure that opens nothing
	const doc = build({
		enveloppe: {
			value: sum(expr(ref('pot')), expr(ref('solo'))),
			parameters: ['pot', 'solo'],
		},
		pot: { value: sum(expr(ref('total'))) },
		solo: { value: sum(expr(constant(5))) },
		total: { value: sum(expr(ref('part')), expr(constant(5))) },
		part: { value: notDefined() },
	})

	it('opens the single line a sheet prints, and the chain under it', () => {
		// `pot`'s fiche prints the line `Total`, whose own fiche prints two lines
		expect([...openRow(doc, 'enveloppe', 'pot')].sort()).toEqual([
			'pot',
			'total',
		])
	})

	it('leaves a single line that opens nothing closed', () => {
		// `solo`'s fiche prints one line, a figure no click answers
		expect([...openRow(doc, 'enveloppe', 'solo')]).toEqual(['solo'])
	})

	it('keeps the rows already open', () => {
		// the answer is the whole state, which the page hands straight back
		const opened = openRow(doc, 'enveloppe', 'pot', {
			expanded: new Set(['part']),
		})
		expect([...opened].sort()).toEqual(['part', 'pot', 'total'])
	})

	it('comes open on a page whose own computation prints a single line', () => {
		// the page of `pot` prints `Total` alone, so the page opens it — and nothing else,
		// since the sheet of `Total` prints its two lines
		expect([...openedWithPage(doc, 'pot')]).toEqual(['total'])
	})

	it('opens nothing on a page with several lines to choose from', () => {
		expect([...openedWithPage(doc, 'enveloppe')]).toEqual([])
	})

	it('opens nothing for a literal, which has no line of its own', () => {
		const view = projectRule(doc, 'solo', { expanded: new Set(['solo.0']) })
		const row = view.equation?.rows[0]
		// the figure is the whole of it: there is nothing a click could open
		expect(row?.detail).toBeNull()
		expect(row?.key).toBeNull()
		expect(row?.control).toBeNull()
	})
})

describe('two sibling lines', () => {
	// `enveloppe` somme trois références : trois sœurs dans la même fiche
	const doc = build({
		enveloppe: {
			value: sum(expr(ref('a')), expr(ref('b')), expr(ref('c'))),
			parameters: ['a', 'b', 'c'],
		},
		a: { value: sum(expr(ref('a . interne')), expr(constant(1))) },
		'a . interne': { value: notDefined() },
		b: { value: sum(expr(constant(2))) },
		c: { value: sum(expr(constant(3))) },
	})
	const ouvrir = (key: string, expanded?: ReadonlySet<string>) =>
		openRow(doc, 'enveloppe', key, expanded === undefined ? {} : { expanded })

	it('n’en laisse qu’une dépliée à la fois', () => {
		const première = ouvrir('a')
		expect(première.has('a')).toBe(true)
		const seconde = ouvrir('b', première)
		expect(seconde.has('b')).toBe(true)
		expect(seconde.has('a')).toBe(false)
	})

	it('se souvient de ce qu’une sœur refermée avait ouvert', () => {
		const première = ouvrir('a')
		const sonInterne = ouvrir('a . interne', première)
		expect(sonInterne.has('a . interne')).toBe(true)
		const seconde = ouvrir('c', sonInterne)
		// la première s'est refermée ; ce qu'elle avait ouvert, non
		expect(seconde.has('a')).toBe(false)
		expect(seconde.has('a . interne')).toBe(true)
		// la rouvrir la rend telle qu'on l'avait laissée
		expect(ouvrir('a', seconde).has('a . interne')).toBe(true)
	})
})
