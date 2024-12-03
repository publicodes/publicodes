import { expect } from 'chai'
import {
	getDifferenceInMonths,
	getDifferenceInYears,
	getTrimestreCivil,
} from '../src/date'

describe('Date', function () {
	describe('getDifferenceInMonths', function () {
		it('should compute the difference for one full month', function () {
			expect(getDifferenceInMonths('01/01/2020', '31/01/2020')).to.equal(1)
		})

		it('should compute the difference for one month and one day', function () {
			expect(getDifferenceInMonths('01/01/2020', '01/02/2020')).to.equal(
				1 + 1 / 29,
			)
		})

		it('should compute the difference for 2 days between months', function () {
			expect(
				getDifferenceInMonths('31/01/2020', '01/02/2020'),
			).to.approximately(1 / 31 + 1 / 29, 0.000000000001)
		})
	})

	describe('getDifferenceInYears', function () {
		it('should compute the difference for a non-leap year', function () {
			expect(getDifferenceInYears('01/01/2019', '01/01/2020')).to.equal(1)
		})

		it('should compute the difference for a leap year', function () {
			expect(getDifferenceInYears('01/01/2020', '01/01/2021')).to.equal(1)
		})

		it('should compute the difference over multiple years including leap years', function () {
			expect(getDifferenceInYears('05/02/2019', '05/02/2023')).to.equal(4)
		})

		it('should ignore leap day not in date range', function () {
			expect(getDifferenceInYears('01/03/2020', '01/03/2021')).to.equal(1)
		})
	})

	describe('trimestreCivile', function () {
		it('should return the correct trimestre for a given date', function () {
			expect(getTrimestreCivil('01/01/2020')).to.equal('01/01/2020')
			expect(getTrimestreCivil('26/07/2019')).to.equal('01/07/2019')
			expect(getTrimestreCivil('31/12/2019')).to.equal('01/10/2019')
		})
	})
})
