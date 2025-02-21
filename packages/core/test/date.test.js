import { describe, it, expect } from 'vitest'
import {
	getDifferenceInMonths,
	getDifferenceInYears,
	getTrimestreCivil,
} from '../src/date'

describe('Date', () => {
	describe('getDifferenceInMonths', () => {
		it('should compute the difference for one full month', () => {
			expect(getDifferenceInMonths('01/01/2020', '31/01/2020')).toBe(1)
		})

		it('should compute the difference for one month and one day', () => {
			expect(getDifferenceInMonths('01/01/2020', '01/02/2020')).toBe(1 + 1 / 29)
		})

		it('should compute the difference for 2 days between months', () => {
			expect(getDifferenceInMonths('31/01/2020', '01/02/2020')).toBeCloseTo(
				1 / 31 + 1 / 29,
				10,
			)
		})
	})

	describe('getDifferenceInYears', () => {
		it('should compute the difference for a non-leap year', () => {
			expect(getDifferenceInYears('01/01/2019', '01/01/2020')).toBe(1)
		})

		it('should compute the difference for a leap year', () => {
			expect(getDifferenceInYears('01/01/2020', '01/01/2021')).toBe(1)
		})

		it('should compute the difference over multiple years including leap years', () => {
			expect(getDifferenceInYears('05/02/2019', '05/02/2023')).toBe(4)
		})

		it('should ignore leap day not in date range', () => {
			expect(getDifferenceInYears('01/03/2020', '01/03/2021')).toBe(1)
		})
	})

	describe('trimestreCivile', () => {
		it('should return the correct trimestre for a given date', () => {
			expect(getTrimestreCivil('01/01/2020')).toBe('01/01/2020')
			expect(getTrimestreCivil('26/07/2019')).toBe('01/07/2019')
			expect(getTrimestreCivil('31/12/2019')).toBe('01/10/2019')
		})
	})
})
