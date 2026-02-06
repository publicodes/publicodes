import { describe, it, expect } from 'bun:test'
import Engine from '../src/index'
import serializeEvaluation from '../src/serializeEvaluation'

describe('serializeEvaluation', () => {
	it('should serialize a number', () => {
		const engine = new Engine()
		const expression = '2300'
		const evaluation = engine.evaluate(expression)

		expect(serializeEvaluation(evaluation)).toBe(expression)
	})

	it('should serialize a boolean', () => {
		const engine = new Engine()
		const expression = 'oui'
		const evaluation = engine.evaluate(expression)

		expect(serializeEvaluation(evaluation)).toBe(expression)
	})

	it('should serialize a number with unit', () => {
		const engine = new Engine()
		const expression = '457€/mois'
		const evaluation = engine.evaluate(expression)

		expect(serializeEvaluation(evaluation)).toBe(expression)
	})

	it('should serialize a string', () => {
		const engine = new Engine()
		const expression = "'CDI'"
		const evaluation = engine.evaluate(expression)

		expect(serializeEvaluation(evaluation)).toBe(expression)
	})

	it.skip('should serialize an object', () => {
		const engine = new Engine()
		const expression = '{ a: 45, b: {a: 15}}'
		const evaluation = engine.evaluate(expression)

		expect(serializeEvaluation(evaluation)).toBe(expression)
	})
})
