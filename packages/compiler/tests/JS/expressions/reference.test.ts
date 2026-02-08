import { yaml } from '../compile'
import { describe, test, expect } from 'bun:test'

describe('Expressions > reference', () => {
	test('simple', async () => {
		const { b } = await yaml`

a: 4
b: a
`
		expect(b.evaluate()).toEqual(4)
		expect(b.type).toBe('number')
	})

	test('should resolve to child first', async () => {
		const { 'b . a': result } = await yaml`
b:
b . a: c
b . a . c: 1
b . c: 2
c: 3
`
		expect(result.evaluate()).toEqual(1)
	})

	test('should resolve to sibling then', async () => {
		const { 'b . a': result } = await yaml`
b:
b . a: c
b . c: 2
c: 3
`
		expect(result.evaluate()).toEqual(2)
	})
	test('should not reference itself', async () => {
		const { 'b . c': result } = await yaml`
b:
b . c: c
c: 5
`
		expect(result.evaluate()).toEqual(5)
	})

	test('should allow to chain reference', async () => {
		const { a } = await yaml`
a: b
b: c
c: 10
`
		expect(a.evaluate()).toEqual(10)
	})

	test('with quote', async () => {
		const r = await yaml`
règle de l'application: 10
`
		expect(r["règle de l'application"].evaluate()).toEqual(10)
	})
})
