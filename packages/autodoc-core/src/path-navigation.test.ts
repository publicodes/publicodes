import { describe, it, expect } from 'vitest'
import {
	contextStackFromUrl,
	createPathNavigation,
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
})

describe('createPathNavigation', () => {
	const navigation = createPathNavigation({
		outputs: { 'dirigeant . auto-entrepreneur . revenu net': {} },
		parameters: {
			"entreprise . chiffre d'affaires . BIC": {},
			date: { title: 'Date du calcul' },
		},
		basePath: '/documentation/',
	})

	it('routes outputs before parameters', () => {
		expect(navigation.routes.map((route) => route.role)).toEqual([
			'output',
			'parameter',
			'parameter',
		])
	})

	it('names each route as the model does, for an index to print', () => {
		expect(navigation.routes.map((route) => route.name)).toEqual([
			'Revenu net',
			'BIC',
			'Date du calcul',
		])
	})

	it('trims the trailing slash of the base path', () => {
		expect(
			navigation.pathOf('dirigeant . auto-entrepreneur . revenu net'),
		).toBe(
			'/documentation/' +
				encodeRuleName('dirigeant . auto-entrepreneur . revenu net'),
		)
	})

	it('gives no path to a rule outside the declared API', () => {
		expect(navigation.pathOf('dirigeant . auto-entrepreneur . CFP')).toBeNull()
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
		expect(fromArrays.routes.map((route) => route.name)).toEqual(['A', 'B'])
	})
})

describe('the link to a page', () => {
	const paths = createPathNavigation({
		outputs: { 'revenu net': {} },
		parameters: {},
		basePath: '/doc',
	})

	it('carries the stack in the URL, so a shared link keeps it', () => {
		expect(paths.href('revenu net', '-ctx')).toBe('/doc/revenu-net?ctx=-ctx')
	})

	it('is the page itself when there is no stack to carry', () => {
		expect(paths.href('revenu net', '')).toBe('/doc/revenu-net')
	})

	it('writes every path through the host’s own scheme', () => {
		const hashed = createPathNavigation({
			outputs: { 'revenu net': {} },
			parameters: {},
			basePath: '/doc',
			toUrl: (path) => `#${path}`,
		})
		expect(hashed.href('revenu net', '-ctx')).toBe('#/doc/revenu-net?ctx=-ctx')
	})

	it('gives a page to a rule the API does not declare, under the same prefix', () => {
		expect(paths.href('hors api', '')).toBe('/doc/hors-api')
	})
})

describe('contextStackFromUrl', () => {
	it('reads the stack a URL carries, hash or not', () => {
		expect(contextStackFromUrl('/doc/a?ctx=-ctx')).toBe('-ctx')
		expect(contextStackFromUrl('http://x/#/doc/a?ctx=-ctx')).toBe('-ctx')
		expect(contextStackFromUrl('/doc/a?autre=1&ctx=-ctx')).toBe('-ctx')
	})

	it('is empty when the URL names no stack', () => {
		expect(contextStackFromUrl('/doc/a')).toBe('')
		expect(contextStackFromUrl('/doc/a?autre=1')).toBe('')
	})
})
