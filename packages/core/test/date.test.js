import { expect } from 'chai'
import { getDifferenceInMonths, getDifferenceInYears } from '../src/date'

describe('Date : getDifferenceInMonths', () => {
	it('should compute the difference for one full month', () => {
		expect(getDifferenceInMonths('01/01/2020', '31/01/2020')).to.equal(1)
	})
	it('should compute the difference for one month and one day', () => {
		expect(getDifferenceInMonths('01/01/2020', '01/02/2020')).to.equal(
			1 + 1 / 29,
		)
	})
	it('should compute the difference for 2 days between months', () => {
		expect(getDifferenceInMonths('31/01/2020', '01/02/2020')).to.approximately(
			1 / 31 + 1 / 29,
			0.000000000001,
		)
	})
})

describe('Date : getDifferenceInYears', () => {
	it('should compute the difference for a non-leap year', () => {
		expect(getDifferenceInYears('01/01/2019', '01/01/2020')).to.equal(1)
	})

	it('should compute the difference for a leap year', () => {
		expect(getDifferenceInYears('01/01/2020', '01/01/2021')).to.equal(1)
	})

	it('should compute the difference over multiple years including leap years', () => {
		expect(getDifferenceInYears('05/02/2019', '05/02/2023')).to.equal(4)
	})

	it('should ignore leap day not in date range', () => {
		expect(getDifferenceInYears('01/03/2020', '01/03/2021')).to.equal(1)
	})
})
