import Engine from 'publicodes'
import { computeNextFields, createNextPage, countNextPages } from './nextPage'
import { describe, expect, it } from 'vitest'

describe('nextPage functions', () => {
	describe('computeNextFields', () => {
		it('should return sorted missing variables not in pages', () => {
			const engine = new Engine({
				a: { formule: 'b + c' },
				b: { formule: 'd' },
				c: {},
				d: {},
			})
			const targets = ['a']
			const seenFields = ['c']
			const result = computeNextFields(engine, targets, seenFields)
			expect(result).toEqual(['d'])
		})

		it('should return empty array if no missing variables', () => {
			const engine = new Engine({
				a: '10',
			})
			const targets = ['a']
			const result = computeNextFields(engine, targets)
			expect(result).toEqual([])
		})

		it('should return missing variable of several targets', () => {
			const engine = new Engine({
				a: { formule: 'b + c' },
				b: { formule: 'd' },
				c: {},
				d: {},
				e: {},
			})
			const targets = ['a', 'e']
			const result = computeNextFields(engine, targets)
			expect(result).toEqual(['d', 'c', 'e'])
		})
	})

	describe('createNextPage', () => {
		it('should return filtered next fields based on depth (default to 1)', () => {
			const nextFields = ['a . a', 'a . a . a', 'a . b', 'b']
			const result = createNextPage(nextFields, {})
			expect(result).toEqual(['a . a', 'a . a . a', 'a . b'])
		})

		it('should return filtered next fields based on depth', () => {
			const nextFields = ['a . a', 'a . a . a', 'a . b', 'b']
			const result = createNextPage(nextFields, { depth: 2 })
			expect(result).toEqual(['a . a', 'a . a . a'])
		})

		it('should return empty array if nextFields is empty', () => {
			const result = createNextPage([], {})
			expect(result).toEqual([])
		})
	})

	describe('countNextPages', () => {
		it('should return the count of unique top-level rules', () => {
			const nextFields = ['a . a', 'a . b', 'b']
			const result = countNextPages(nextFields)
			expect(result).toBe(2)
		})

		it('should return 0 if nextFields is empty', () => {
			const result = countNextPages([])
			expect(result).toBe(0)
		})
	})
})
