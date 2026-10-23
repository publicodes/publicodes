import { describe, it, expect } from 'vitest'
import { formatValue } from './format-value'
import { NotApplicable, NotDefined } from './trace'

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

	describe('absence', () => {
		it('names NotDefined in full', () => {
			expect(formatValue(NotDefined, { type: 'number' })).toBe('non défini')
		})

		it('names NotApplicable as a dash', () => {
			expect(formatValue(NotApplicable, { type: 'text' })).toBe('-')
		})
	})
})
