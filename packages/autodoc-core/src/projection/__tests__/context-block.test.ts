/** Le contexte d'une page : ce que les piles lient, et les paramètres que le calcul a lus. */
import { describe, it, expect } from 'vitest'
import type { Trace } from '../../trace'
import { BOUND_NOTE } from '../copy'
import { projectContextBlock } from '../stack'
import {
	build,
	constant,
	context,
	defaultTo,
	notDefined,
	ref,
	sum,
} from '../../test-helpers/fixtures'

const doc = build({
	taux: { value: notDefined() },
	net: { value: sum(ref('taux')), parameters: ['taux'] },
	exemple: {
		value: ref('net'),
		chain: [context({ taux: constant(2) })],
	},
})

describe('projectContextBlock', () => {
	it('makes no trail for a page read in the model’s own context', () => {
		const view = projectContextBlock(doc, 'net', { context: { taux: 1 } })
		expect(view.crumbs).toEqual([{ name: 'Net', rule: 'net', stack: '' }])
	})

	it('trails through the rule whose context the page is read under', () => {
		const view = projectContextBlock(doc, 'net', {
			evaluation: {
				trace: { 'exemple.context.taux': { '-exemple.context': 2 } },
			},
			contextStackId: '-exemple.context',
		})
		expect(view.crumbs.map((crumb) => [crumb.name, crumb.stack])).toEqual([
			['Net', ''],
			['Exemple', '-exemple.context'],
		])
	})

	it('is not itself a step: a page owns the context it reads its own value in', () => {
		const view = projectContextBlock(doc, 'exemple', {
			contextStackId: '-exemple.context',
		})
		expect(view.crumbs).toHaveLength(1)
	})

	it('writes the context as the computation does: a `contexte` line, and its sheet', () => {
		const [line] = projectContextBlock(doc, 'net', {}).equation.rows
		expect(line.gutter).toBe('contexte')
		expect(line.detail?.header).toBe('valeur du paramètre')
	})

	it('lists what the context binds, worth what the evaluation wrote', () => {
		const view = projectContextBlock(doc, 'net', {
			evaluation: {
				trace: { 'exemple.context.taux': { '': 2 } },
				needed: ['taux'],
				evaluatedRule: 'net',
			},
			context: { taux: 1 },
			contextStackId: '-exemple.context',
		})
		const [taux] = view.equation.rows[0].detail?.rows ?? []
		expect([taux.label, taux.value.text, taux.parameterNote]).toEqual([
			'Taux',
			'2 €',
			BOUND_NOTE,
		])
	})

	it('does not list a bound parameter twice: the reader’s value is not what was read', () => {
		const view = projectContextBlock(doc, 'net', {
			evaluation: {
				trace: { 'exemple.context.taux': { '': 2 } },
				needed: ['taux'],
				evaluatedRule: 'net',
			},
			context: { taux: 1 },
			contextStackId: '-exemple.context',
		})
		expect(view.equation.rows[0].detail?.rows).toHaveLength(1)
	})

	it('lists only the parameters the computation used, with their state', () => {
		const view = projectContextBlock(doc, 'net', {
			evaluation: {
				trace: { taux: { '': 3 } },
				needed: ['taux'],
				missing: [],
				evaluatedRule: 'net',
			},
			context: { taux: 3 },
		})
		expect(
			view.equation.rows[0].detail?.rows?.map((row) => [
				row.label,
				row.value.text,
				row.depth,
			]),
		).toEqual([['Taux', '3 €', 1]])
	})
})

describe('the parameters a computation did not take from the reader', () => {
	const avecDéfaut = build({
		charges: { value: notDefined(), chain: [defaultTo(constant(600))] },
		autre: { value: notDefined() },
		taux: { value: notDefined() },
		net: {
			value: sum(ref('charges'), ref('autre'), ref('taux')),
			parameters: ['charges', 'autre', 'taux'],
		},
	})
	const evaluation = {
		trace: { 'charges.default': { '': 600 }, autre: { '': 0 } } as Trace,
		needed: ['charges', 'autre', 'taux'],
		missing: ['autre', 'taux'],
		evaluatedRule: 'net',
	}

	it('holds the default and the missing ones back, and says how many', () => {
		const view = projectContextBlock(avecDéfaut, 'net', {
			evaluation,
			context: { taux: 2 },
		})
		// les lignes retenues restent dans la feuille, fermées : c'est ce qui les anime
		expect(
			view.equation.rows[0].detail?.rows?.map((row) => [row.label, row.folded]),
		).toEqual([
			['Autre', true],
			['Charges', true],
			['Taux', false],
		])
		// le pli se pose sur la ligne `contexte`, celle qui porte le bloc
		const fold = view.equation.rows[0].fold
		expect(fold?.count).toBe(2)
		expect(fold?.expanded).toBe(false)
		expect(fold?.label).toBe('Afficher 2 paramètres sans valeur fournie')
	})

	it('prints them all once the reader asks for them', () => {
		const view = projectContextBlock(avecDéfaut, 'net', {
			evaluation,
			context: { taux: 2 },
			folds: { 'net#context': true },
		})
		// les manquants d'abord : ce sont eux que le lecteur peut renseigner
		expect(
			view.equation.rows[0].detail?.rows?.map((row) => [row.label, row.folded]),
		).toEqual([
			['Autre', false],
			['Charges', false],
			['Taux', false],
		])
		expect(view.equation.rows[0].fold?.expanded).toBe(true)
		expect(view.equation.rows[0].fold?.label).toBe(
			'Masquer les paramètres sans valeur fournie',
		)
	})

	it('has no fold when every parameter came from the reader', () => {
		const view = projectContextBlock(avecDéfaut, 'net', {
			evaluation: {
				...evaluation,
				needed: ['taux'],
				missing: [],
			},
			context: { taux: 2 },
		})
		expect(view.equation.rows[0].fold).toBeNull()
	})
})
