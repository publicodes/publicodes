import { describe, it, expect } from 'vitest'
import { capitalise0, formatValue } from '../src/format'
import { parseUnit } from '../src/units'

describe('format engine values', () => {
	it('format currencies', () => {
		expect(formatValue(12, { displayedUnit: '€' })).toBe('12 €')
		expect(formatValue(1200, { displayedUnit: '€' })).toBe('1 200 €')
		expect(formatValue(12, { displayedUnit: '€', language: 'en' })).toBe('€12')
		expect(formatValue(12.1, { displayedUnit: '€', language: 'en' })).toBe(
			'€12.10',
		)
		expect(formatValue(12.123, { displayedUnit: '€', language: 'en' })).toBe(
			'€12.12',
		)
	})

	it('format percentages', () => {
		expect(formatValue(10, { displayedUnit: '%' })).toBe('10 %')
		expect(formatValue(100, { displayedUnit: '%' })).toBe('100 %')
		expect(formatValue(10.2, { displayedUnit: '%' })).toBe('10,2 %')
		expect(
			formatValue({
				nodeValue: 441,
				unit: parseUnit('%.kgCO2e'),
			}),
		).toBe('4,41 kgCO2e')
	})

	it('format values', () => {
		expect(formatValue(1200)).toMatch(/1[\s]200/)
	})
})

describe('Units handling', () => {
	it('format displayedUnit', () => {
		const formatUnit = (unit, count) => unit + (count > 1 ? 's' : '')
		expect(formatValue(1, { displayedUnit: 'jour', formatUnit })).toBe('1 jour')
		expect(formatValue(2, { displayedUnit: 'jour', formatUnit })).toBe(
			'2 jours',
		)
		expect(
			formatValue(
				{
					nodeValue: 7,
					unit: parseUnit('jour/semaine'),
				},
				{ formatUnit },
			),
		).toBe('7 jours/semaine')
	})
})

describe('capitalise0', () => {
	it('should turn the first character into its capital', () => {
		expect(capitalise0('salaire')).toBe('Salaire')
	})
})
