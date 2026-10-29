/** Le dépliage : ce qu'une ligne ouvre, et ce qu'un clic laisse ouvert. */
import { describe, it, expect } from 'vitest'
import { openRow, openedWithPage, projectRule } from '../index'
import {
	build,
	constant,
	expr,
	notDefined,
	ref,
	sum,
} from '../../test-helpers/fixtures'

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
