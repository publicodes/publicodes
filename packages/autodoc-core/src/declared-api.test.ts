import { describe, it, expect } from 'vitest'
import { nameOf, namesOf, usedForComputation } from './declared-api'

// l'API déclarée d'un modèle : deux résultats, trois paramètres, dont un que seul
// un autre paramètre utilise — les `params` du module ne listent que des paramètres
const outputs = {
	'revenu net': { params: ['TJM', 'jours ouvrés'] },
	cotisations: { params: ['TJM'] },
}
const parameters = {
	TJM: { title: 'Taux journalier moyen' },
	'jours ouvrés': {},
	'plancher de cotisations': {},
}

describe('usedForComputation', () => {
	it('lists the results whose computation needs the parameter', () => {
		expect(
			usedForComputation(outputs, 'TJM').map((rule) => rule.address),
		).toEqual(['revenu net', 'cotisations'])
	})

	it('names them as the model does', () => {
		expect(usedForComputation(outputs, 'jours ouvrés')).toEqual([
			{ address: 'revenu net', name: 'Revenu net' },
		])
	})

	it('is empty for a result: `params` holds parameters, never another result', () => {
		expect(usedForComputation(outputs, 'revenu net')).toEqual([])
	})

	it('is empty for a parameter no result reaches', () => {
		expect(usedForComputation(outputs, 'plancher de cotisations')).toEqual([])
	})

	it('reads names alone, where there is no module to read', () => {
		expect(usedForComputation(['revenu net'], 'TJM')).toEqual([])
	})
})

describe('nameOf', () => {
	it('takes the author’s title when they wrote one', () => {
		expect(nameOf('TJM', parameters)).toBe('Taux journalier moyen')
	})

	it('falls back to the last segment of the address, as a name reads', () => {
		expect(nameOf('jours ouvrés', parameters)).toBe('Jours ouvrés')
		expect(
			nameOf('entreprise . activité . nature', [
				'entreprise . activité . nature',
			]),
		).toBe('Nature')
	})
})

describe('namesOf', () => {
	it('takes the module’s keys, or the names themselves', () => {
		expect(namesOf(outputs)).toEqual(['revenu net', 'cotisations'])
		expect(namesOf(['a', 'b'])).toEqual(['a', 'b'])
	})
})
