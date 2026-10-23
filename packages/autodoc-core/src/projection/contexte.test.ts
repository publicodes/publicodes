import { describe, it, expect } from 'vitest'
import type { Trace } from '../trace'
import { openRow, projectRule } from './index'
import {
	build,
	constant,
	context,
	defaultTo,
	expr,
	neg,
	notDefined,
	product,
	ref,
	sum,
} from '../test-helpers/fixtures'

/**
 * Une page évaluée sous un `contexte` qui lie `base`, et rien d'autre : les valeurs que
 * le moteur écrit là, et celles qu'il écrit ailleurs.
 */
const page = build({
	page: {
		value: expr(ref('net')),
		chain: [context({ base: expr(constant(10)) })],
	},
	net: { value: notDefined() },
	base: { value: notDefined(), unit: '€/jour' },
})
const under = '-page.context'
const trace: Trace = {
	// la valeur de la chaîne, écrite sur le `contexte` lui-même, chez l'appelant
	'page.context': { '': 12 },
	// ce que la page vaut sous son propre contexte n'est pas sa réponse
	page: { [under]: 999 },
	// ce que la règle vaut là-dedans
	net: { [under]: 30 },
	// ce que le contexte lie, chez l'appelant
	'page.context.base': { '': 10 },
}
const evaluated = {
	evaluation: { trace, evaluatedRule: 'page' },
	context: { base: 10 },
}
const view = () => projectRule(page, 'page', evaluated)
const contextRow = () =>
	view().equation?.rows.find((row) => row.gutter === 'contexte')
const boundLines = () => contextRow()?.detail?.rows ?? []

describe('la réponse d’une page sous un `contexte`', () => {
	it('est celle que le moteur a rendue, pas celle écrite sous sa pile', () => {
		expect(view().equation?.head?.value.text).toBe('12 €')
	})

	it('lit ce qu’une fiche ouverte vaut à la pile que le contexte pousse', () => {
		const expanded = openRow(page, 'page', 'net', evaluated)
		const row = projectRule(page, 'page', { ...evaluated, expanded }).equation
			?.rows
		const sheet = row?.find((candidate) => candidate.key === 'net')?.detail
		expect(sheet?.result.text).toBe('30 €')
	})
})

describe('la ligne d’un `contexte`', () => {
	it('nomme le mécanisme et ne porte aucune figure', () => {
		const row = contextRow()
		expect(row?.gutter).toBe('contexte')
		expect(row?.label).toBeNull()
		expect(row?.value.state).toBe('absent')
	})

	it('nomme la colonne de ce qu’il lie', () => {
		expect(contextRow()?.detail?.header).toBe('valeur du paramètre')
	})

	it('s’imprime sans qu’on le demande, et ne se plie pas', () => {
		const row = contextRow()
		expect(row?.open).toBe(true)
		expect(row?.key).toBeNull()
		expect(row?.control).toBeNull()
	})

	it('est marqué comme la chaîne, pas comme la valeur', () => {
		const rows = view().equation?.rows ?? []
		const row = rows.find((candidate) => candidate.gutter === 'contexte')
		expect(row?.modifier).toBe(true)
		expect(rows[rows.indexOf(row!) - 1]?.modifier).toBe(false)
	})
})

describe('ce qu’un `contexte` lie', () => {
	it('s’imprime sans qu’on l’ouvre', () => {
		expect(boundLines().map((line) => [line.label, line.value.text])).toEqual([
			['Base', '10 €/jour'],
		])
	})

	it('ne s’ouvre pas quand la liaison n’est qu’une constante', () => {
		const [line] = boundLines()
		expect(line.key).toBeNull()
		expect(line.detail).toBeNull()
	})
})

describe('une valeur qu’un `par défaut` décide', () => {
	const doc = build({
		délai: { value: notDefined(), chain: [defaultTo(expr(constant(5)))] },
	})
	// le moteur écrit la valeur du `par défaut` là où il évalue la chaîne
	const trace: Trace = { 'délai.default': { '': 5, '-ailleurs': 7 } }

	it('se lit à la pile où le moteur l’a écrite', () => {
		const at = (contextStackId: string) =>
			projectRule(doc, 'délai', {
				evaluation: { trace },
				contextStackId,
			}).equation?.head?.value.text
		expect(at('')).toBe('5 €')
		expect(at('-ailleurs')).toBe('7 €')
	})
})

describe('un terme que le moteur écrit sur son opération', () => {
	const doc = build({
		net: { value: sum(expr(ref('a')), expr(neg(ref('b')))) },
		a: { value: notDefined() },
		b: { value: notDefined() },
	})
	const rows = (trace?: Trace) =>
		projectRule(doc, 'net', {
			...(trace === undefined ? {} : { evaluation: { trace } }),
		}).equation?.rows ?? []

	it('porte le signe de la ligne, et ouvre sur sa règle', () => {
		const negated = rows().find((row) => row.term === 'B')
		expect(negated?.gutter).toBe('−')
		expect(negated?.key).toBe('b')
	})

	it('lit sa valeur là où le moteur l’écrit, sur l’expression niée', () => {
		expect(
			rows({ 'net.1.expr.neg': { '': 10 } }).find((row) => row.term === 'B')
				?.value.text,
		).toBe('10 €')
	})

	it('ne marque aucun terme comme une annotation', () => {
		expect(rows().every((row) => !row.modifier)).toBe(true)
	})
})

describe('une annotation', () => {
	const doc = build({
		jours: { value: notDefined(), chain: [defaultTo(expr(constant(16)))] },
	})

	it('est marquée, pour qu’une vue la sépare des termes', () => {
		const rows = projectRule(doc, 'jours').equation?.rows ?? []
		expect(rows.length).toBeGreaterThan(0)
		expect(rows.every((row) => row.modifier)).toBe(true)
	})
})

describe('une liaison qui est un calcul', () => {
	const doc = build({
		honoraire: {
			value: expr(ref('base')),
			chain: [context({ base: product(expr(constant(2)), expr(constant(3))) })],
		},
		base: { value: notDefined() },
	})
	const boundId = 'honoraire.context.base'
	const trace: Trace = {
		[boundId]: { '': 6 },
		[`${boundId}.0`]: { '': 2 },
		[`${boundId}.1`]: { '': 3 },
	}
	const lines = (expanded?: ReadonlySet<string>) =>
		projectRule(doc, 'honoraire', {
			evaluation: { trace },
			...(expanded === undefined ? {} : { expanded }),
		}).equation?.rows.find((row) => row.gutter === 'contexte')?.detail?.rows ??
		[]

	it('s’ouvre là où elle se lit', () => {
		const [line] = lines()
		expect(line.label).toBe('Base')
		expect(line.open).toBe(false)
		expect(
			lines(
				openRow(doc, 'honoraire', line.key!, {
					evaluation: { trace },
				}),
			)[0].open,
		).toBe(true)
	})

	it('dit une constante une seule fois : le terme qui la répète tombe', () => {
		const [line] = lines()
		const sheet = lines(
			openRow(doc, 'honoraire', line.key!, { evaluation: { trace } }),
		)[0].detail
		expect(
			sheet?.rows.map((row) => [row.gutter, row.term, row.value.text]),
		).toEqual([
			['=', null, '2 €'],
			['×', null, '3 €'],
		])
	})
})
