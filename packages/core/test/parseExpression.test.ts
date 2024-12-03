import { expect } from 'chai'
import { parseExpression } from '../src/index'

describe("Enables external codebases to use publicodes's expression parser", function () {
	it('should parse a basic expression', function () {
		const parsed = parseExpression('équipement * facteur', 'foo . bar')
		expect(JSON.stringify(parsed)).to.equal(
			JSON.stringify({
				'*': [
					{
						variable: 'équipement',
					},
					{
						variable: 'facteur',
					},
				],
			}),
		)
	})

	it('should parse an exponentiation expression', function () {
		const parsed = parseExpression('équipement ** facteur', 'foo . bar')
		expect(JSON.stringify(parsed)).to.equal(
			JSON.stringify({
				'**': [
					{
						variable: 'équipement',
					},
					{
						variable: 'facteur',
					},
				],
			}),
		)
	})

	it('should parse an integer division expression', function () {
		const parsed = parseExpression('équipement // facteur', 'foo . bar')
		expect(JSON.stringify(parsed)).to.equal(
			JSON.stringify({
				'//': [
					{
						variable: 'équipement',
					},
					{
						variable: 'facteur',
					},
				],
			}),
		)
	})

	it('should parse complexe unit expression', function () {
		expect(parseExpression('10 a.b', 'foo . bar')).to.deep.equal({
			constant: {
				nodeValue: 10,
				type: 'number',
				unit: {
					numerators: ['a', 'b'],
					denominators: [],
				},
			},
		})

		expect(parseExpression('10 a.b/c.d.e', 'foo . bar')).to.deep.equal({
			constant: {
				nodeValue: 10,
				type: 'number',
				unit: {
					numerators: ['a', 'b'],
					denominators: ['c', 'd', 'e'],
				},
			},
		})

		expect(parseExpression('10/c/d.e/e', 'foo . bar')).to.deep.equal({
			constant: {
				nodeValue: 10,
				type: 'number',
				unit: {
					numerators: [],
					denominators: ['c', 'd', 'e', 'e'],
				},
			},
		})
	})
})
