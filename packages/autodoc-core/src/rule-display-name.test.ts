import { describe, it, expect } from 'vitest'
import { getRefDisplayName } from './rule-display-name'

describe('getRefDisplayName', () => {
	describe('title', () => {
		it('uses the title when present', () => {
			const doc = { 'a . b': { title: 'Mon titre' } }
			expect(getRefDisplayName('a . b', 'x . y', doc)).toBe('Mon titre')
		})

		it('title takes precedence over abbreviation', () => {
			const doc = { 'a . b': { title: 'Mon titre' } }
			expect(getRefDisplayName('a . b', 'a . c', doc)).toBe('Mon titre')
		})
	})

	describe('no current rule', () => {
		it('returns the full path when no current rule', () => {
			expect(getRefDisplayName('a . b . c', '', {})).toBe('a . b . c')
		})
	})

	describe('common prefix abbreviation', () => {
		it('strips common prefix', () => {
			expect(getRefDisplayName('a . b . c', 'a . b . x', {})).toBe('c')
		})

		it('strips multi-segment common prefix', () => {
			expect(getRefDisplayName('a . x', 'a . b . c', {})).toBe('x')
		})

		it('returns full path when no common prefix', () => {
			expect(getRefDisplayName('x . y', 'a . b', {})).toBe('x . y')
		})

		it('handles single-segment rules', () => {
			expect(getRefDisplayName('revenu', 'revenu . net', {})).toBe(
				'revenu',
			)
		})
	})

	describe('edge cases', () => {
		it('same rule returns last segment', () => {
			expect(getRefDisplayName('a . b', 'a . b', {})).toBe('b')
		})

		it('target is prefix of current rule returns last segment', () => {
			expect(getRefDisplayName('a . b', 'a . b . c', {})).toBe('b')
		})

		it('rule not in doc falls through to abbreviation', () => {
			const doc = { 'other': { title: 'Autre' } }
			expect(getRefDisplayName('a . b . c', 'a . b . x', doc)).toBe('c')
		})
	})
})
