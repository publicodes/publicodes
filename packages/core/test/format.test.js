import { expect } from 'chai'
import { parseUnit, defaultUnitEquivalances } from '../source/units'
import { formatValue, capitalise0 } from '../source/format'

const formatValueTest = (value, opts) =>
	formatValue({ value, unitEquivalences: defaultUnitEquivalances, opts })

describe('format engine values', () => {
	it('format currencies', () => {
		expect(formatValueTest(12, { displayedUnit: '€' })).to.equal('12 €')
		expect(formatValueTest(1200, { displayedUnit: '€' })).to.match(/1[\s]200 €/)
		expect(
			formatValueTest(12, { displayedUnit: '€', language: 'en' })
		).to.equal('€12')
		expect(
			formatValueTest(12.1, { displayedUnit: '€', language: 'en' })
		).to.equal('€12.10')
		expect(
			formatValueTest(12.123, { displayedUnit: '€', language: 'en' })
		).to.equal('€12.12')
	})

	it('format percentages', () => {
		expect(formatValueTest(10, { displayedUnit: '%' })).to.equal('10 %')
		expect(formatValueTest(100, { displayedUnit: '%' })).to.equal('100 %')
		expect(formatValueTest(10.2, { displayedUnit: '%' })).to.equal('10,2 %')
		expect(
			formatValueTest({
				nodeValue: 441,
				unit: parseUnit('%.kgCO2e'),
			})
		).to.equal('4,41 kgCO2e')
	})

	it('format values', () => {
		expect(formatValueTest(1200)).to.match(/1[\s]200/)
	})
})

describe('Units handling', () => {
	it('format displayedUnit', () => {
		const formatUnit = (unit, count) => unit + (count > 1 ? 's' : '')
		expect(formatValueTest(1, { displayedUnit: 'jour', formatUnit })).to.equal(
			'1 jour'
		)
		expect(formatValueTest(2, { displayedUnit: 'jour', formatUnit })).to.equal(
			'2 jours'
		)
		expect(
			formatValueTest(
				{
					nodeValue: 7,
					unit: parseUnit('jour/semaine'),
				},
				{ formatUnit }
			)
		).to.equal('7 jours / semaine')
	})
})

describe('capitalise0', function () {
	it('should turn the first character into its capital', function () {
		expect(capitalise0('salaire')).to.equal('Salaire')
	})
})
