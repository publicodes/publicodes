/** La vue d'une règle : son nom, sa réponse, son contexte, son état de remplissage. */
import { describe, it, expect } from 'vitest'
import type { Trace } from '../../trace'
import type { Evaluation } from '../types'
import { projectContextBlock, projectExplanation, projectRule } from '../index'
import {
	applicableIf,
	binary,
	build,
	constant,
	defaultTo,
	expr,
	notApplicableIf,
	notDefined,
	ref,
	sum,
} from '../../test-helpers/fixtures'

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
		expect(view.values).toBe('computed')
		expect(view.equation?.result.state).toBe('value')
		// la valeur de la règle est celle de son nœud, pas celle de son premier terme
		expect(view.equation?.result.text).toBe('12 €')
		expect(view.equation?.rows[0].value.text).toBe('8 €')
	})

	it('shows the structure alone, without a trace', () => {
		const view = projectRule(doc, 'total')
		expect(view.values).toBe('none')
		expect(view.equation?.result.state).toBe('absent')
		expect(view.equation?.rows.length).toBeGreaterThan(0)
	})
})

describe('projectRule — a rule with no computation of its own', () => {
	const doc = build({
		paramètre: { value: notDefined() },
	})

	it('projette une ligne : ce qui entre dans un paramètre', () => {
		const equation = projectRule(doc, 'paramètre', {
			context: {},
			evaluation: { trace: {} },
		}).equation
		expect(equation?.rows.map((row) => [row.gutter, row.value.text])).toEqual([
			['paramètre d’entrée', 'non renseignée'],
		])
	})

	it('la retire derrière le pli : rien n’est entré, elle n’a rien fait', () => {
		const equation = projectRule(doc, 'paramètre', {
			context: {},
			evaluation: { trace: {} },
		}).equation
		expect(equation?.rows[0].folded).toBe(true)
		expect(equation?.fold).toEqual({
			id: 'paramètre#input',
			count: 1,
			label: 'Afficher 1 terme sans effet',
			expanded: false,
		})
		// et le lecteur peut la redemander
		const opened = projectRule(doc, 'paramètre', {
			context: {},
			evaluation: { trace: {} },
			folds: { 'paramètre#input': true },
		}).equation
		expect(opened?.rows[0].folded).toBe(false)
		expect(opened?.fold?.expanded).toBe(true)
	})

	it('dit ce qui entre, et rien d’autre : un paramètre n’a pas de calcul à expliquer', () => {
		const view = projectRule(doc, 'paramètre', { context: {} })
		expect(view.answer?.parameterNote).toBeNull()
		expect(view.equation?.rows.map((row) => row.gutter)).toEqual([
			'paramètre d’entrée',
		])
	})

	it('nomme le paramètre sans état quand la page documente le modèle', () => {
		// sans contexte, personne n'a rien demandé : la ligne dit ce qu'est la règle, pas
		// ce qui lui manque
		const view = projectRule(doc, 'paramètre')
		expect(view.values).toBe('none')
		const input = view.equation?.rows[0]
		expect([input?.gutter, input?.value.text]).toEqual([
			'paramètre d’entrée',
			null,
		])
		expect(input?.parameterNote).toBe('Ce paramètre est une entrée du modèle.')
		// rien n'a été fait, donc rien n'est retenu : pas de pli « sans effet »
		expect(input?.folded).toBe(false)
		expect(view.equation?.fold).toBeNull()
	})
})

describe('un paramètre et sa chaîne', () => {
	const doc = build({
		simple: { value: notDefined() },
		défaut: { value: notDefined(), chain: [defaultTo(expr(constant(16)))] },
	})
	const trace = { 'défaut.default': { '': 16 } } as Trace

	it('montre ce qui est entré avant ce que la chaîne en fait', () => {
		const view = projectRule(doc, 'défaut', { context: { défaut: 5 } })
		const rows = view.equation?.rows ?? []
		expect(rows[0].gutter).toBe('paramètre d’entrée')
		expect(rows[0].value.text).toBe('5 €')
		// et la chaîne suit, avec sa propre ligne
		expect(rows[1].gutter).toBe('par défaut')
	})

	it('referme sur le défaut sans effet dès qu’une valeur est entrée', () => {
		const view = projectRule(doc, 'défaut', {
			context: { défaut: 5 },
			evaluation: { trace },
		})
		expect(view.equation?.rows.map((row) => [row.gutter, row.folded])).toEqual([
			['paramètre d’entrée', false],
			['par défaut', true],
		])
		expect(view.equation?.fold?.expanded).toBe(false)
		expect(view.equation?.fold?.count).toBe(1)
	})

	it('l’applique quand rien n’est entré : c’est lui qui calcule la valeur', () => {
		const rows =
			projectRule(doc, 'défaut', { context: {}, evaluation: { trace } })
				.equation?.rows ?? []
		// l'entrée dit que rien n'est saisi, et se retire ; le défaut, lui, calcule
		expect(rows.map((row) => [row.gutter, row.inert])).toEqual([
			['paramètre d’entrée', true],
			['par défaut', false],
		])
	})

	it('l’applique aussi quand son expression n’est pas tracée', () => {
		// `charges` : un défaut calculé, dont le moteur n'écrit nulle part la valeur —
		// c'est le contexte qui dit s'il a pris effet
		const calculé = build({
			charges: {
				value: notDefined(),
				chain: [defaultTo(expr(binary('mul', ref('assiette'), constant(2))))],
			},
			assiette: { value: notDefined() },
		})
		const view = projectRule(calculé, 'charges', {
			context: { assiette: 150 },
			evaluation: { trace: { assiette: { '': 150 } } },
		})
		const défaut = (view.equation?.rows ?? []).find(
			(row) => row.gutter === 'par défaut',
		)
		expect(défaut?.inert).toBe(false)
	})

	it('dit que rien n’est entré, même quand un défaut prend le relais', () => {
		const view = projectRule(doc, 'défaut', {
			context: {},
			evaluation: { trace },
		})
		expect(view.equation?.rows.map((row) => [row.gutter, row.folded])).toEqual([
			['paramètre d’entrée', true],
			['par défaut', false],
		])
		// et le pli l'annonce : la ligne se redemande d'un clic
		expect(view.equation?.fold?.count).toBe(1)
		expect(view.equation?.fold?.expanded).toBe(false)
	})

	it('ne compte pas un type déclaré comme une transformation', () => {
		// `unité:` ajoute un `type_def` à la chaîne : il ne lit pas la valeur, il la nomme
		const typé = build({
			typé: { value: notDefined(), unit: 'jour' },
		})
		expect(
			projectRule(typé, 'typé', { context: { typé: 5 } }).equation?.rows.map(
				(row) => row.gutter,
			),
		).toEqual(['paramètre d’entrée'])
	})

	it('n’a qu’une ligne sans chaîne : la réponse est l’entrée', () => {
		const view = projectRule(doc, 'simple', { context: { simple: 5 } })
		expect(view.equation?.rows.map((row) => row.gutter)).toEqual([
			'paramètre d’entrée',
		])
		expect(view.answer?.value.text).toBe('5 €')
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
	const rows = (options = evaluated) =>
		projectContextBlock(doc, 'total', options).equation.rows[0].detail?.rows ??
		[]

	it('montre une entrée fournie, avec sa valeur', () => {
		// la colonne dit des valeurs : un paramètre sans valeur vaut `non défini`, comme une
		// formule qui ne conclut pas
		expect(rows().map((row) => [row.label, row.value.text])).toEqual([
			['Taux', 'non défini'],
			['Assiette', '100 €'],
		])
	})

	it('met en tête ce que le lecteur peut renseigner', () => {
		// les manquants d'abord : c'est sur eux qu'il peut agir
		expect(rows().map((row) => row.label)).toEqual(['Taux', 'Assiette'])
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

	const rows = (evaluation: Evaluation) =>
		projectContextBlock(doc, 'total', { evaluation, context }).equation.rows[0]
			.detail?.rows ?? []

	it('ne liste que les paramètres dont l’évaluation a eu besoin', () => {
		// `needed` fait foi : le second paramètre n'a pas servi ici
		expect(rows({ trace, needed: ['a'] }).map((row) => row.address)).toEqual([
			'a',
		])
	})

	it('dit lesquels le contexte ne fournit pas', () => {
		expect(
			rows({ trace, needed: ['a', 'b'], missing: ['b'] })
				.filter((row) => row.value.state !== 'value')
				.map((row) => row.address),
		).toEqual(['b'])
	})
})

describe('la réponse est un fait de page', () => {
	const doc = build({
		total: { value: sum(expr(constant(1)), expr(constant(2))) },
	})

	it('la page porte sa réponse, à l’échelle d’un titre', () => {
		const view = projectRule(doc, 'total', {
			evaluation: { trace: { total: { '': 3 } } },
		})
		expect(view.answer?.label).toBe('Total')
		expect(view.answer?.value.text).toBe('3 €')
	})

	it('une explication n’en porte jamais : c’est une suite de lignes', () => {
		const explanation = projectExplanation(doc, 'total')
		expect(explanation?.rows.length).toBeGreaterThan(0)
		expect(explanation).not.toHaveProperty('head')
	})
})

describe('l’ordre de la chaîne', () => {
	const doc = build({
		drapeau: { value: notDefined() },
		charges: {
			value: notDefined(),
			chain: [
				notApplicableIf(expr(ref('drapeau'))),
				defaultTo(expr(constant(300))),
			],
		},
		commerce: {
			value: sum(expr(constant(1)), expr(constant(2))),
			chain: [applicableIf(expr(ref('drapeau')))],
		},
	})

	it('ouvre le calcul par ses conditions d’applicabilité, et rejette le reste après', () => {
		// la condition dit si la règle s'applique, le défaut ne change qu'une valeur trouvée
		const rows = projectRule(doc, 'charges').equation?.rows ?? []
		expect(rows.map((row) => row.gutter)).toEqual([
			'paramètre d’entrée',
			'non applicable si',
			'par défaut',
		])
		expect(rows.map((row) => row.applicability)).toEqual([false, true, false])
	})

	it('met la condition avant les termes du mécanisme de valeur', () => {
		// une somme sous un `applicable si` : la condition se lit d'abord, les termes ensuite
		const rows = projectRule(doc, 'commerce').equation?.rows ?? []
		expect(rows.map((row) => row.gutter)).toEqual(['applicable si', '=', '+'])
	})
})

describe('un ordre qui se lit', () => {
	const doc = build({
		petit: { value: notDefined() },
		moyen: { value: notDefined() },
		gros: { value: notDefined() },
		total: {
			value: sum(expr(ref('petit')), expr(ref('moyen')), expr(ref('gros'))),
		},
	})
	// les valeurs se lisent là où le compilateur les écrit : sur le nœud de chaque terme
	const trace: Trace = {
		'total.0': { '': 1 },
		'total.1': { '': 10 },
		'total.2': { '': 100 },
	}

	it('classe les termes d’une somme du plus gros poste au plus petit', () => {
		const rows =
			projectRule(doc, 'total', { evaluation: { trace } }).equation?.rows ?? []
		expect(rows.map((row) => row.label)).toEqual(['Gros', 'Moyen', 'Petit'])
		// le plus gros terme ouvre la somme : c'est lui qui porte le signe égal
		expect(rows.map((row) => row.gutter)).toEqual(['=', '+', '+'])
	})

	it('garde l’ordre de l’auteur quand rien n’est calculé', () => {
		const rows = projectRule(doc, 'total').equation?.rows ?? []
		expect(rows.map((row) => row.label)).toEqual(['Petit', 'Moyen', 'Gros'])
	})
})
