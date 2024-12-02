import { expect } from 'chai'
import Engine from '../src/index'
import serializeEvaluation from '../src/serializeEvaluation'

describe('serializeEvaluation', function () {
	it('should serialize a number', function () {
		const engine = new Engine()
		const expression = '2300'
		const evaluation = engine.evaluate(expression)

		expect(serializeEvaluation(evaluation)).to.eq(expression)
	})

	it('should serialize a boolean', function () {
		const engine = new Engine()
		const expression = 'oui'
		const evaluation = engine.evaluate(expression)

		expect(serializeEvaluation(evaluation)).to.eq(expression)
	})

	it('should serialize a number with unit', function () {
		const engine = new Engine()
		const expression = '457€/mois'
		const evaluation = engine.evaluate(expression)

		expect(serializeEvaluation(evaluation)).to.eq(expression)
	})

	it('should serialize a string', function () {
		const engine = new Engine()
		const expression = "'CDI'"
		const evaluation = engine.evaluate(expression)

		expect(serializeEvaluation(evaluation)).to.eq(expression)
	})

	it.skip('should serialize an object', function () {
		const engine = new Engine()
		const expression = '{ a: 45, b: {a: 15}}'
		const evaluation = engine.evaluate(expression)

		expect(serializeEvaluation(evaluation)).to.eq(expression)
	})
})
