import { describe, it, expect } from 'vitest'
import type { PublicodeAST } from '../ast'
import { projectRule } from './index'
import { capitalizeFirst } from './names'
import autoEntrepreneur from '../../../compiler/examples/auto-entrepreneur/model.publicodes.json'
import simpleTJM from '../../../compiler/examples/simple-TJM/model.publicodes.json'

/**
 * Ce que le compilateur écrit, projeté tel quel : le seul endroit où les tests voient
 * un vrai modèle. Les comportements se vérifient sur de petites fixtures ; ici on
 * vérifie l'accord avec le compilateur, qu'aucune fixture ne peut donner.
 */
const models: Record<string, PublicodeAST> = {
	'simple-TJM': simpleTJM as PublicodeAST,
	'auto-entrepreneur': autoEntrepreneur as PublicodeAST,
}

describe('le modèle que le compilateur écrit', () => {
	it('se projette règle par règle, sans évaluation', () => {
		for (const [modèle, doc] of Object.entries(models)) {
			for (const adresse of Object.keys(doc)) {
				const view = projectRule(doc, adresse)
				expect(view.address, `${modèle} / ${adresse}`).toBe(adresse)
				expect(view.name.length, `${modèle} / ${adresse}`).toBeGreaterThan(0)
				expect(view.type, `${modèle} / ${adresse}`).toBe(doc[adresse].type)
			}
		}
	})

	it('nomme une règle par le titre que l’auteur lui a donné, ou par sa feuille', () => {
		const doc = models['auto-entrepreneur']
		const titrée = Object.entries(doc).find(
			([, rule]) => rule.title !== undefined,
		)
		expect(titrée).toBeDefined()
		const [adresse, rule] = titrée!
		expect(projectRule(doc, adresse).name).toBe(rule.title)
		// `simple-TJM` ne déclare aucun titre : ses règles se nomment par leur adresse
		const nue = Object.entries(models['simple-TJM']).find(
			([, rule]) => rule.title === undefined,
		)!
		expect(projectRule(models['simple-TJM'], nue[0]).name).toBe(
			capitalizeFirst(nue[0].split(' . ').slice(-1)[0]),
		)
	})

	it('imprime la page d’exemple avec sa réponse et ses termes', () => {
		const view = projectRule(models['simple-TJM'], 'exemples . CA élevé')
		expect(view.fill).toBe('generic')
		expect(view.fillNote).not.toBeNull()
		expect(view.equation?.head?.label).toBe('CA élevé')
		expect(view.equation?.rows.length).toBeGreaterThan(0)
		// la ligne d'une référence mène à la règle qu'elle nomme
		expect(
			view.equation?.rows.find((row) => row.address === 'revenu net')?.key,
		).toBeTruthy()
	})
})
