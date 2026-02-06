import Engine from 'publicodes'
import { describe, expect, it } from 'bun:test'
import { computeNextFields } from './computeNextFields'

describe('computeNextFields', () => {
	it('should return sorted missing variables not in pages', () => {
		const engine = new Engine({
			a: { formule: 'b + c' },
			b: { formule: 'd' },
			c: {},
			d: {},
		})
		const targets = ['a']
		const pages = [{ elements: ['c'] }]
		const result = computeNextFields(engine, { targets, pages })
		expect(result).toEqual(['d'])
	})

	it('should return empty array if no missing variables', () => {
		const engine = new Engine({
			a: '10',
		})
		const targets = ['a']
		const result = computeNextFields(engine, {
			targets,
			pages: [],
		})
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
		const result = computeNextFields(engine, {
			targets,
			pages: [],
		})
		expect(result).toEqual(['d', 'c', 'e'])
	})
})
