import { describe, expect, it } from 'vitest'
import {
	areUnitConvertible,
	convertUnit,
	inferUnit,
	parseUnit,
	removeOnce,
} from '../src/units'

describe('parseUnit', () => {
	it('should remove the first element encounter in the list', () => {
		let result = removeOnce(4)([1, 4, 6, 5, 4])
		expect(result).toEqual([1, 6, 5, 4])
	})

	it('should parse string units into object', () => {
		expect(parseUnit('m')).toEqual({
			numerators: ['m'],
			denominators: [],
		})
		expect(parseUnit('/an')).toEqual({
			numerators: [],
			denominators: ['an'],
		})
		expect(parseUnit('m/s')).toEqual({
			numerators: ['m'],
			denominators: ['s'],
		})
		expect(parseUnit('kg.m/s')).toEqual({
			numerators: ['kg', 'm'],
			denominators: ['s'],
		})
		expect(parseUnit('kg.m/s')).toEqual({
			numerators: ['kg', 'm'],
			denominators: ['s'],
		})
		expect(parseUnit('€/personne/mois')).toEqual({
			numerators: ['€'],
			denominators: ['personne', 'mois'],
		})
		expect(parseUnit('km/an.personne')).toEqual({
			numerators: ['km'],
			denominators: ['an', 'personne'],
		})
	})

	it('should handle power decomposition', () => {
		expect(parseUnit('m2')).toEqual({
			numerators: ['m', 'm'],
			denominators: [],
		})
		expect(parseUnit('m2/m3')).toEqual({
			numerators: ['m', 'm'],
			denominators: ['m', 'm', 'm'],
		})
		expect(parseUnit('m2.m2')).toEqual({
			numerators: ['m', 'm', 'm', 'm'],
			denominators: [],
		})
		expect(parseUnit('m2.kg.m2.kg')).toEqual({
			numerators: ['m', 'm', 'm', 'm', 'kg', 'kg'],
			denominators: [],
		})
	})
})

describe('inferUnit', () => {
	it('should work with simple use case *', () => {
		let unit1 = { numerators: ['m'], denominators: ['s'] }
		let unit2 = { numerators: ['s'], denominators: [] }
		let unit = inferUnit('*', [unit1, unit2])

		expect(unit).toEqual({
			numerators: ['m'],
			denominators: [],
		})
	})

	it('should work with simple use case / ', () => {
		let unit1 = { numerators: ['m'], denominators: ['s'] }
		let unit2 = { numerators: ['m'], denominators: [] }
		let unit = inferUnit('/', [unit1, unit2])

		expect(unit).toEqual({
			numerators: [],
			denominators: ['s'],
		})
	})

	it('should work with advanced use case /', () => {
		let unit1 = { numerators: ['a', 'b', 'a', 'z'], denominators: ['c'] }
		let unit2 = { numerators: ['a', 'e', 'f'], denominators: ['z', 'c'] }
		let unit = inferUnit('/', [unit1, unit2])

		expect(unit).toEqual({
			numerators: ['b', 'a', 'z', 'z'],
			denominators: ['e', 'f'],
		})
	})
})

describe('convertUnit', () => {
	it('should convert month to year in denominator', () => {
		expect(convertUnit(parseUnit('/mois'), parseUnit('/an'), 10)).toBe(120)
	})

	it('should convert year to month in denominator', () => {
		expect(convertUnit(parseUnit('/an'), parseUnit('/mois'), 120)).toBe(10)
	})

	it('should convert year to month in numerator', () => {
		expect(convertUnit(parseUnit('mois'), parseUnit('an'), 12)).toBe(1)
	})

	it('should convert month to year in numerator', () => {
		expect(convertUnit(parseUnit('mois'), parseUnit('an'), 12)).toBe(1)
	})

	it('should convert cm to m in numerator', () => {
		expect(convertUnit(parseUnit('cm'), parseUnit('m'), 100)).toBe(1)
	})

	it('should convert mm to m in numerator', () => {
		expect(convertUnit(parseUnit('mm'), parseUnit('m'), 1000)).toBe(1)
	})

	it('should convert mm to cm in numerator', () => {
		expect(convertUnit(parseUnit('mm'), parseUnit('cm'), 10)).toBe(1)
	})

	it('should convert percentage to simple value', () => {
		expect(convertUnit(parseUnit('%'), parseUnit(''), 83)).toBeCloseTo(0.83, 7)
	})

	it('should convert more difficult value', () => {
		expect(convertUnit(parseUnit('%/an'), parseUnit('/mois'), 12)).toBeCloseTo(
			0.01,
			7,
		)
	})

	it('should convert year, month, day, k€', () => {
		expect(
			convertUnit(
				parseUnit('€/personne/jour'),
				parseUnit('k€/an/personne'),
				'100',
			),
		).toBeCloseTo(36.5, 7)
	})

	it('should handle simplification', () => {
		expect(
			convertUnit(parseUnit('€.an.%/mois'), parseUnit('€'), 100),
		).toBeCloseTo(12, 7)
	})

	it('should handle complexification', () => {
		expect(
			convertUnit(parseUnit('€'), parseUnit('€.an.%/mois'), 12),
		).toBeCloseTo(100, 7)
	})

	it('should not show unit conversion error when converting equivalent units', () => {
		expect(convertUnit(parseUnit('kW.h'), parseUnit('kWh'), 1)).toBe(1)
	})
})

describe('areUnitConvertible', () => {
	it('should be true for temporel unit', () => {
		expect(areUnitConvertible(parseUnit('mois'), parseUnit('an'))).toBe(true)
		expect(areUnitConvertible(parseUnit('kg/an'), parseUnit('kg/mois'))).toBe(
			true,
		)
	})

	it('should be true for percentage', () => {
		expect(areUnitConvertible(parseUnit('%/mois'), parseUnit('/an'))).toBe(true)
	})

	it('should be true for more complicated cases', () => {
		expect(
			areUnitConvertible(
				parseUnit('€/personne/mois'),
				parseUnit('€/an/personne'),
			),
		).toBe(true)
	})

	it('should be false for unit not alike', () => {
		expect(
			areUnitConvertible(parseUnit('mois'), parseUnit('€/an/personne')),
		).toBe(false)
		expect(areUnitConvertible(parseUnit('m.m'), parseUnit('m'))).toBe(false)
		expect(areUnitConvertible(parseUnit('m'), parseUnit('s'))).toBe(false)
	})
})
