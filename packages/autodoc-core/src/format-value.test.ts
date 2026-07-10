import { describe, it, expect } from 'vitest'
import { formatValue } from './format-value'

describe('formatValue', () => {
	describe('number', () => {
		it('formats a number', () => {
			expect(formatValue(42, { type: 'number' })).toBe('42')
		})

		it('formats a number with a unit', () => {
			expect(formatValue(1500, { type: 'number', unit: '€' })).toBe(
				'1 500 €',
			)
		})

		it('handles zero', () => {
			expect(formatValue(0, { type: 'number' })).toBe('0')
		})
	})

	describe('text', () => {
		it('formats text as-is', () => {
			expect(formatValue('bonjour', { type: 'text' })).toBe('bonjour')
		})
	})

	describe('boolean', () => {
		it('formats true as oui', () => {
			expect(formatValue(true, { type: 'boolean' })).toBe('oui')
		})

		it('formats false as non', () => {
			expect(formatValue(false, { type: 'boolean' })).toBe('non')
		})
	})

	describe('date', () => {
		it('formats a date', () => {
			const date = new Date('2024-01-15')
			const result = formatValue(date, { type: 'date' })
			expect(result).toContain('2024')
		})
	})

	describe('edge cases', () => {
		it('returns "non défini" for undefined', () => {
			expect(formatValue(undefined, { type: 'number' })).toBe('non défini')
		})

		it('returns "-" for null', () => {
			expect(formatValue(null, { type: 'text' })).toBe('-')
		})
	})
})
