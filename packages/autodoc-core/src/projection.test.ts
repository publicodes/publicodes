import { describe, it, expect } from 'vitest'
import type { PublicodeAST, RuleDefinition } from './ast'
import type { Trace, TraceValue } from './trace'
import { NotApplicable, NotDefined } from './trace'
import type { EquationView, RuleView } from './projection/types'
import { openRow, openedWithPage, projectRule } from './projection'
import { capitalizeFirst } from './projection/names'
import astFixture from './fixtures/auto-entrepreneur.autodoc.json'
import traceFixture from './fixtures/auto-entrepreneur.trace.json'
import tjm from './fixtures/simple-TJM.autodoc.json'

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

	it('offers the branches it did not retain through its fold', () => {
		const [name, definition] = variationsIn(true)!
		const id = definition.value_mechanism.id
		const stack = stackOf(id, true)
		const sheet = (folds: Record<string, boolean>) =>
			projectRule(doc, name, { ...evaluated, contextStackId: stack, folds })
				.equation
		const hidden = sheet({ [id]: false })
		const shown = sheet({ [id]: true })
		// révéler le pli montre exactement les branches qu'il retenait : les lignes sont
		// toujours là, marquées, et seule leur visibilité change
		const visible = (equation: typeof hidden) =>
			(equation?.rows ?? []).filter((row) => !row.folded)
		expect(visible(shown).length - visible(hidden).length).toBe(
			hidden?.fold?.count ?? 0,
		)
		expect(shown?.rows.length).toBe(hidden?.rows.length)
	})

	it('reads nothing, marks nothing and holds nothing back without an evaluation', () => {
		const [name] = variationsIn(true)!
		const sheet = projectRule(doc, name).equation
		// la condition n'a pas été examinée : elle n'a pas de valeur, et surtout pas « non »
		expect(sheet?.rows.find((row) => row.gutter === 'si')?.value.state).toBe(
			'absent',
		)
		// rien n'a rien fait : aucune ligne n'est éteinte, donc aucune n'est retenue
		expect(sheet?.rows.filter((row) => row.inert)).toHaveLength(0)
		expect(sheet?.fold).toBeNull()
	})

	it('applies no branch when the mechanism itself did not resolve', () => {
		const [, definition] = variationsIn(true)!
		const id = definition.value_mechanism.id
		const unresolved: Trace = { [id]: { '': NotDefined } }
		const view = projectRule(
			doc,
			'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux',
			{ evaluation: { trace: unresolved }, context },
		)
		expect(view.equation?.result.state).toBe('not_defined')
		expect(
			(view.equation?.rows ?? []).filter((row) => !row.inert),
		).toHaveLength(0)
	})
})

describe('a conditional whose branch was kept', () => {
	const position = {
		file: 'test.publicodes',
		start: { index: 0, line: 1, column: 1 },
		end: { index: 1, line: 1, column: 2 },
	}
	const chained = (value_mechanism: unknown) => ({
		value_mechanism,
		chained_mechanisms: [],
	})
	const expr = (id: string, value: number) => ({
		kind: 'expr',
		id,
		type: 'number',
		unit: '%',
		position,
		parameters: {
			kind: 'constant',
			id: `${id}-value`,
			type: 'number',
			unit: '%',
			position,
			parameters: { kind: 'const_number', value, unit: '%' },
		},
	})
	// one condition, one `sinon`: whichever holds is the branch the sheet prints
	const taux = {
		taux: {
			title: 'Taux',
			type: 'number',
			unit: '%',
			id: 'v',
			position,
			referenced_by: [],
			parameters: [],
			value_mechanism: {
				kind: 'variations',
				id: 'v',
				type: 'number',
				unit: '%',
				position,
				parameters: {
					conditions: [
						{ if: chained(expr('c', 3)), then: chained(expr('a', 3)) },
					],
					else: chained(expr('s', 1)),
				},
			},
			chained_mechanisms: [],
		},
	} as unknown as PublicodeAST
	const sheet = (trace: Trace) => projectRule(taux, 'taux', { evaluation: { trace } })
	// the condition held: `0,3 %` is `si` and `alors`, and the `sinon` is held back
	const conditionKept = sheet({ v: { '': 3 }, c: { '': true }, a: { '': 3 }, s: { '': 1 } })
	// the `sinon` held: nothing says why, so the conditions come with it
	const sinonKept = sheet({ v: { '': 1 }, c: { '': false }, a: { '': 3 }, s: { '': 1 } })

	it('prints the condition it kept, and holds the others back', () => {
		// toutes les lignes sont dans l'équation ; celles que le pli retient sont marquées
		const visible = (conditionKept.equation?.rows ?? []).filter((row) => !row.folded)
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

	it('opens on what explains it when no evaluation can', () => {
		// la ligne du mécanisme porte son nom : repliée, elle ne dirait rien
		const view = projectRule(inline, 'total')
		const row = view.equation?.rows[1]
		expect(row?.termIsMechanism).toBe(true)
		expect(row?.detail).not.toBeNull()
		// avec une évaluation, elle se replie : sa valeur dit ce qu'elle vaut
		const evaluated = projectRule(inline, 'total', {
			evaluation: { trace: { s: { '': 10 }, v: { '': 6 } } },
		})
		expect(evaluated.equation?.rows[1]?.detail).toBeNull()
	})

	it('opens what a rule references when that rule chose its value', () => {
		// une règle dont la valeur est une `variations` : la ligne qui la référence n'a ni
		// forme écrite ni valeur à montrer, donc elle s'ouvre
		const [name, definition] = Object.entries(doc).find(
			([, rule]) => rule.value_mechanism.kind === 'variations',
		)!
		const parent = Object.entries(doc).find(([, rule]) =>
			JSON.stringify(rule).includes(`"${name}"`),
		)
		expect(parent).toBeDefined()
		const row = (view: ReturnType<typeof projectRule>) =>
			[
				...(view.equation?.rows ?? []),
				...(view.equation?.rows ?? []).flatMap((r) => r.detail?.rows ?? []),
			].find((r) => r.address === name)
		const opened = row(projectRule(doc, parent![0], {}))
		expect(opened?.detail).not.toBeNull()
		// et avec une évaluation elle se replie : c'est la valeur qui parle
		const folded = row(projectRule(doc, parent![0], evaluated))
		expect(folded?.detail).toBeNull()
		expect(definition.value_mechanism.kind).toBe('variations')
	})

	it('keeps the place of what it cannot write', () => {
		// sans forme écrite ni valeur, la place reste tenue : `4 +` tout court se lirait
		// comme une troncature
		const view = projectRule(inline, 'total')
		expect(view.equation?.inlineTerm).toBe('4 € + …')
	})

	it('opens every reference but a bare constant', () => {
		// une constante brute n'a rien à expliquer : sa valeur est sur la ligne
		const constants = Object.entries(doc).filter(
			([, rule]) =>
				rule.value_mechanism.kind === 'expr' &&
				rule.value_mechanism.parameters.kind === 'constant' &&
				rule.chained_mechanisms.length === 0,
		)
		expect(constants.length).toBeGreaterThan(0)
		for (const [name] of constants) {
			const parent = Object.entries(doc).find(([, rule]) =>
				JSON.stringify(rule).includes(`"${name}"`),
			)
			if (parent === undefined) continue
			const row = [
				...(projectRule(doc, parent[0]).equation?.rows ?? []),
			].find((r) => r.address === name)
			if (row === undefined) continue
			expect(row.detail).toBeNull()
			expect(row.key).toBeNull()
		}
		// un paramètre, lui, s'ouvre : sa fiche dit d'où vient la valeur
		const parameter = Object.entries(doc).find(
			([, rule]) => rule.value_mechanism.kind === 'not_defined',
		)
		expect(parameter).toBeDefined()
	})

	it('leaves an operator its word', () => {
		const view = projectRule(inline, 'total')
		expect(view.equation?.rows[0]?.termIsMechanism).toBe(false)
	})
})

describe('le premier terme visible', () => {
	const position = {
		file: 'test.publicodes',
		start: { index: 0, line: 1, column: 1 },
		end: { index: 1, line: 1, column: 2 },
	}
	const number = (id: string, value: number) => ({
		value_mechanism: {
			kind: 'expr',
			id,
			type: 'number',
			unit: '€',
			position,
			parameters: { kind: 'constant', value, unit: '€' },
		},
		chained_mechanisms: [],
	})
	// une somme dont le premier terme ne compte pas : zéro
	const sum = {
		total: {
			title: 'Total',
			type: 'number',
			unit: '€',
			id: 'sum',
			position,
			referenced_by: [],
			parameters: [],
			value_mechanism: {
				kind: 'sum',
				id: 'sum',
				type: 'number',
				unit: '€',
				position,
				parameters: [number('zero', 0), number('five', 5)],
			},
			chained_mechanisms: [],
		},
	} as unknown as PublicodeAST
	const trace: Trace = {
		sum: { '': 5 },
		zero: { '': 0 },
		five: { '': 5 },
	}

	it('ne porte pas l’opérateur qui n’a plus de terme devant lui', () => {
		const rows = projectRule(sum, 'total', { evaluation: { trace } }).equation?.rows ?? []
		const visible = rows.filter((row) => !row.folded)
		expect(visible).toHaveLength(1)
		expect(visible[0].gutter).toBe('')
		// le terme ne répète pas la valeur : la figure porte le montant, la ligne porte le nom
		expect(visible[0].value.text).toBe('5 €')
		// aucune ligne ne partage son identité : deux clés égales font disparaître une ligne
		expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
	})

	it('le porte de nouveau quand le pli est ouvert', () => {
		const rows =
			projectRule(sum, 'total', { evaluation: { trace }, folds: { sum: true } })
				.equation?.rows ?? []
		expect(rows.map((row) => row.gutter)).toEqual(['', '+'])
	})
})

describe('the sheet a row opens', () => {
	const sheetsOf = (equation: EquationView | null, out: EquationView[] = []) => {
		if (equation === null) return out
		out.push(equation)
		for (const row of equation.rows) sheetsOf(row.detail, out)
		return out
	}

	const keysOf = (equation: EquationView | null, out: string[] = []): string[] => {
		for (const row of equation?.rows ?? []) {
			if (row.key !== null) out.push(row.key)
			keysOf(row.detail, out)
		}
		return out
	}

	// everything opened, so every sheet this page can print is printed
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

	it('is one level in, so the papers alternate at every depth', () => {
		walk(everythingOpen().equation)
	})

	it('carries the fold of the branches a conditional did not retain', () => {
		const conditionalSheets = sheetsOf(everythingOpen().equation).filter((sheet) =>
			sheet.rows.some((row) => ['alors', 'sinon'].includes(row.gutter)),
		)
		expect(conditionalSheets.length).toBeGreaterThan(0)
		for (const sheet of conditionalSheets) {
			// une feuille qui n'a rien tranché n'a pas de pli : rien n'y a été retenu
			if (sheet.fold === null) continue
			// le pli est ce qui offre les autres : elles sont visibles exactement quand il est ouvert
			expect(sheet.fold.count).toBeGreaterThan(0)
			expect(sheet.rows.filter((row) => !row.folded)).toHaveLength(
				sheet.fold?.expanded === true ?
					sheet.rows.length
				:	sheet.rows.length - (sheet.fold?.count ?? 0),
			)
		}
	})
})

describe('a chain of the same precedence', () => {
	const position = {
		file: 'test.publicodes',
		start: { index: 0, line: 1, column: 1 },
		end: { index: 1, line: 1, column: 2 },
	}
	const ref = (name: string) => ({
		kind: 'ref',
		id: `r-${name}`,
		type: 'number',
		unit: '€',
		position,
		parameters: name,
	})
	const expr = (id: string, parameters: unknown) => ({
		kind: 'expr',
		id,
		type: 'number',
		unit: '€',
		position,
		parameters,
	})
	// the compiler nests a chain on the right: `a + b + c` is `add(a, add(b, c))`
	const chain = (kinds: string[], [first, ...rest]: string[]): unknown => ({
		kind: kinds[0],
		type: 'number',
		unit: '€',
		id: `b-${kinds[0]}-${first}`,
		position,
		parameters: {
			left: ref(first),
			right: rest.length === 1 ? ref(rest[0]) : chain(kinds.slice(1), rest),
		},
	})
	const rule = (id: string, value_mechanism: unknown) => ({
		title: id,
		type: 'number',
		unit: '€',
		id,
		position,
		referenced_by: [],
		parameters: [],
		value_mechanism,
		chained_mechanisms: [],
	})
	const leaf = (name: string) =>
		rule(name, {
			kind: 'not_defined',
			id: `n-${name}`,
			type: 'number',
			unit: '€',
			position,
		})
	const inline = {
		a: leaf('a'),
		b: leaf('b'),
		c: leaf('c'),
		chaîne: rule('chaîne', expr('e1', chain(['add', 'add'], ['a', 'b', 'c']))),
		parenthèses: rule('parenthèses', expr('e2', chain(['sub', 'sub'], ['a', 'b', 'c']))),
		soustraction: rule('soustraction', expr('e3', chain(['sub', 'add'], ['a', 'b', 'c']))),
		produit: rule('produit', expr('e4', chain(['mul', 'div'], ['a', 'b', 'c']))),
		puissance: rule('puissance', expr('e5', chain(['pow', 'pow'], ['a', 'b', 'c']))),
		comparaison: rule('comparaison', expr('e6', chain(['lt', 'lt'], ['a', 'b', 'c']))),
		mélange: rule('mélange', expr('e7', chain(['add', 'mul'], ['a', 'b', 'c']))),
	} as unknown as PublicodeAST

	const guttersOf = (name: string) =>
		(projectRule(inline, name).equation?.rows ?? []).map((row) => row.gutter)

	it('writes a chain as one equation, on one level', () => {
		expect(guttersOf('chaîne')).toEqual(['', '+', '+'])
		expect(guttersOf('produit')).toEqual(['', '×', '÷'])
	})

	it('turns the operators of the line it opens', () => {
		// `a − (b + c)` is `a − b − c`, and `a − (b − c)` is `a − b + c`
		expect(guttersOf('soustraction')).toEqual(['', '−', '−'])
		expect(guttersOf('parenthèses')).toEqual(['', '−', '+'])
	})

	it('keeps the nesting that carries a meaning', () => {
		// a power is right-associative and a comparison does not chain: the line keeps its
		// own sheet, and the multiplication under a sum is a term, not a line
		expect(guttersOf('puissance')).toEqual(['', '^'])
		expect(guttersOf('comparaison')).toEqual(['', '<'])
		expect(guttersOf('mélange')).toEqual(['', '+'])
		const term = projectRule(inline, 'mélange').equation?.rows[1]
		expect(term?.term).toBe('B × C')
		expect(term?.key).not.toBeNull()
	})
})

describe('a sum of negations', () => {
	it('writes the signs on the lines, not in the terms', () => {
		const view = projectRule(
			tjm as unknown as PublicodeAST,
			'revenu net',
		)
		expect(view.equation?.inlineTerm).toBe(
			"Chiffre d'affaires − Cotisations − Charges",
		)
		expect(
			(view.equation?.rows ?? []).map((row) => [row.gutter, row.term]),
		).toEqual([
			['', "Chiffre d'affaires"],
			['−', 'Cotisations'],
			['−', 'Charges'],
		])
	})
})

describe('opening a row', () => {
	const position = {
		file: 'test.publicodes',
		start: { index: 0, line: 1, column: 1 },
		end: { index: 1, line: 1, column: 2 },
	}
	const chained = (value_mechanism: unknown) => ({
		value_mechanism,
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
	const expr = (id: string, parameters: unknown) => ({
		kind: 'expr',
		id,
		type: 'number',
		unit: '€',
		position,
		parameters,
	})
	const constant = (id: string, value: number) => ({
		kind: 'constant',
		id,
		type: 'number',
		unit: '€',
		position,
		parameters: { kind: 'const_number', value, unit: '€' },
	})
	const sum = (id: string, parameters: unknown[]) => ({
		kind: 'sum',
		id,
		type: 'number',
		unit: '€',
		position,
		parameters,
	})
	const rule = (id: string, title: string, value_mechanism: unknown) => ({
		title,
		type: 'number',
		unit: '€',
		id,
		position,
		referenced_by: [],
		parameters: [],
		value_mechanism,
		chained_mechanisms: [],
	})
	// two rules hop from the page to a sheet that prints two lines: `enveloppe` prints
	// one line, `pot` one line, `total` two, and `solo` a figure that opens nothing
	const inline = {
		enveloppe: rule(
			's4',
			'Enveloppe',
			sum('s4', [
				chained(expr('e4', ref('r4', 'pot'))),
				chained(expr('e5', ref('r5', 'solo'))),
			]),
		),
		pot: rule('s3', 'Pot', sum('s3', [chained(expr('e3', ref('r3', 'total')))])),
		solo: rule('s2', 'Solo', sum('s2', [chained(expr('e2', constant('c2', 5)))])),
		total: rule(
			's1',
			'Total',
			sum('s1', [
				chained(expr('e1', ref('r1', 'part'))),
				chained(expr('e6', constant('c6', 5))),
			]),
		),
		part: rule('n1', 'Part', {
			kind: 'not_defined',
			id: 'n1',
			type: 'number',
			unit: '€',
			position,
		}),
	} as unknown as PublicodeAST

	it('opens the single line a sheet prints, and the chain under it', () => {
		// `pot`'s fiche prints the line `Total`, whose own fiche prints two lines
		expect([...openRow(inline, 'enveloppe', 'pot')].sort()).toEqual(['pot', 'total'])
	})

	it('leaves a single line that opens nothing closed', () => {
		// `solo`'s fiche prints one line, a figure no click answers
		expect([...openRow(inline, 'enveloppe', 'solo')]).toEqual(['solo'])
	})

	it('keeps the rows already open', () => {
		// the answer is the whole state, which the page hands straight back
		const opened = openRow(inline, 'enveloppe', 'pot', {
			expanded: new Set(['part']),
		})
		expect([...opened].sort()).toEqual(['part', 'pot', 'total'])
	})

	it('comes open on a page whose own computation prints a single line', () => {
		// the page of `pot` prints `Total` alone, so the page opens it — and nothing else,
		// since the sheet of `Total` prints its two lines
		expect([...openedWithPage(inline, 'pot')]).toEqual(['total'])
	})

	it('opens nothing on a page with several lines to choose from', () => {
		expect([...openedWithPage(inline, 'enveloppe')]).toEqual([])
	})

	it('opens nothing for a literal, which has no line of its own', () => {
		const view = projectRule(inline, 'solo', { expanded: new Set(['e2']) })
		const row = view.equation?.rows[0]
		// the figure is the whole of it: there is nothing a click could open
		expect(row?.detail).toBeNull()
		expect(row?.key).toBeNull()
		expect(row?.control).toBeNull()
	})
})
