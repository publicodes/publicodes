import { expect } from 'chai'
import {
	getDifferenceInMonths,
	getDifferenceInYears,
	getTrimestreCivile,
} from '../src/date'

describe('Date', () => {
	describe('getDifferenceInMonths', () => {
		it('should compute the difference for one full month', () => {
			expect(getDifferenceInMonths('01/01/2020', '31/01/2020')).to.equal(1)
		})
		it('should compute the difference for one month and one day', () => {
			expect(getDifferenceInMonths('01/01/2020', '01/02/2020')).to.equal(
				1 + 1 / 29,
			)
		})
		it('should compute the difference for 2 days between months', () => {
			expect(
				getDifferenceInMonths('31/01/2020', '01/02/2020'),
			).to.approximately(1 / 31 + 1 / 29, 0.000000000001)
		})
	})

	describe('getDifferenceInYears', () => {
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

	describe('trimestreCivile', () => {
		it('should return the correct trimestre for a given date', () => {
			expect(getTrimestreCivile('01/01/2020')).to.equal('01/01/2020')
			expect(getTrimestreCivile('26/07/2019')).to.equal('01/07/2019')
			expect(getTrimestreCivile('31/12/2019')).to.equal('01/10/2019')
		})
	})
})
