import { expect } from 'chai'
import { parseExpression } from '../src/index'

describe("Enables external codebases to use publicodes's expression parser", () => {
	it('should parse a basic expression', () => {
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

	it('should parse an exponentiation expression', () => {
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

	it('should parse an integer division expression', () => {
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

	it('should parse complexe unit expression', () => {
		expect(parseExpression('10 a.b')).to.deep.equal({
			constant: { nodeValue: 10, type: 'number' },
			unité: 'a.b',
		})
		expect(parseExpression('10 a.b.c')).to.deep.equal({
			constant: { nodeValue: 10, type: 'number' },
			unité: 'a.b.c',
		})
		expect(parseExpression('10 a.b.c.d.e')).to.deep.equal({
			constant: { nodeValue: 10, type: 'number' },
			unité: 'a.b.c.d.e',
		})
		expect(parseExpression('10 a.b/c.d.e')).to.deep.equal({
			constant: { nodeValue: 10, type: 'number' },
			unité: 'a.b/c.d.e',
		})
		expect(parseExpression('10 a.b/c/d/e')).to.deep.equal({
			constant: { nodeValue: 10, type: 'number' },
			unité: 'a.b/c/d/e',
		})
		expect(parseExpression('10 /c/d/e')).to.deep.equal({
			constant: { nodeValue: 10, type: 'number' },
			unité: '/c/d/e',
		})
		expect(parseExpression('10 /c /d/e')).to.deep.equal({
			constant: { nodeValue: 10, type: 'number' },
			unité: '/c/d/e',
		})
		expect(parseExpression('10/c/d.e/e')).to.deep.equal({
			constant: { nodeValue: 10, type: 'number' },
			unité: '/c/d.e/e',
		})
	})
})
