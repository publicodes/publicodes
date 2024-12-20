import { expect } from 'chai'
import { capitalise0, formatValue } from '../src/format'
import { parseUnit } from '../src/units'

describe('format engine values', function () {
	it('format currencies', function () {
		expect(formatValue(12, { displayedUnit: '€' })).to.equal('12 €')
		expect(formatValue(1200, { displayedUnit: '€' })).to.match(/1[\s]200 €/)
		expect(formatValue(12, { displayedUnit: '€', language: 'en' })).to.equal(
			'€12',
		)
		expect(formatValue(12.1, { displayedUnit: '€', language: 'en' })).to.equal(
			'€12.10',
		)
		expect(
			formatValue(12.123, { displayedUnit: '€', language: 'en' }),
		).to.equal('€12.12')
	})

	it('format percentages', function () {
		expect(formatValue(10, { displayedUnit: '%' })).to.equal('10 %')
		expect(formatValue(100, { displayedUnit: '%' })).to.equal('100 %')
		expect(formatValue(10.2, { displayedUnit: '%' })).to.equal('10,2 %')
		expect(
			formatValue({
				nodeValue: 441,
				unit: parseUnit('%.kgCO2e'),
			}),
		).to.equal('4,41 kgCO2e')
	})

	it('format values', function () {
		expect(formatValue(1200)).to.match(/1[\s]200/)
	})
})

describe('Units handling', function () {
	it('format displayedUnit', function () {
		const formatUnit = (unit, count) => unit + (count > 1 ? 's' : '')
		expect(formatValue(1, { displayedUnit: 'jour', formatUnit })).to.equal(
			'1 jour',
		)
		expect(formatValue(2, { displayedUnit: 'jour', formatUnit })).to.equal(
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
		).to.equal('7 jours/semaine')
	})
})

describe('capitalise0', function () {
	it('should turn the first character into its capital', function () {
		expect(capitalise0('salaire')).to.equal('Salaire')
	})
})
