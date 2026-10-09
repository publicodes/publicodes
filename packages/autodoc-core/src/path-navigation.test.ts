import { describe, it, expect } from 'vitest'
import {
	createPathNavigation,
	decodeRuleName,
	encodeRuleName,
} from './path-navigation'

describe('encodeRuleName', () => {
	it('matches the v1 renderer, so old documentation URLs still resolve', () => {
		expect(encodeRuleName('contrat salarié . rémunération')).toBe(
			'contrat-salarié/rémunération',
		)
		expect(encodeRuleName('auto-entrepreneur')).toBe('auto‑entrepreneur')
		expect(encodeRuleName("entreprise . chiffre d'affaires . BIC")).toBe(
			"entreprise/chiffre-d'affaires/BIC",
		)
	})

	it('round-trips through decodeRuleName', () => {
		for (const name of [
			'contrat salarié . rémunération',
			'auto-entrepreneur',
			"entreprise . chiffre d'affaires . BIC",
			'établissement . commune . département . outre-mer',
		]) {
			expect(decodeRuleName(encodeRuleName(name))).toBe(name)
		}
	})
})

describe('createPathNavigation', () => {
	const navigation = createPathNavigation({
		outputs: { 'dirigeant . auto-entrepreneur . revenu net': {} },
		parameters: { "entreprise . chiffre d'affaires . BIC": {} },
		basePath: '/documentation/',
	})

	it('routes outputs before parameters', () => {
		expect(navigation.routes.map((route) => route.role)).toEqual([
			'output',
			'parameter',
		])
	})

	it('trims the trailing slash of the base path', () => {
		expect(
			navigation.pathOf('dirigeant . auto-entrepreneur . revenu net'),
		).toBe('/documentation/' + encodeRuleName('dirigeant . auto-entrepreneur . revenu net'))
	})

	it('gives no path to a rule outside the declared API', () => {
		expect(
			navigation.pathOf('dirigeant . auto-entrepreneur . CFP'),
		).toBeNull()
	})

	it('inverts a path back to its rule', () => {
		const path = navigation.pathOf('dirigeant . auto-entrepreneur . revenu net')
		expect(path).not.toBeNull()
		expect(navigation.ruleOf(path as string)).toBe(
			'dirigeant . auto-entrepreneur . revenu net',
		)
	})

	it('accepts name arrays as well as the compiled module exports', () => {
		const fromArrays = createPathNavigation({
			outputs: ['a'],
			parameters: ['b'],
		})
		expect(fromArrays.routes).toHaveLength(2)
	})
})
