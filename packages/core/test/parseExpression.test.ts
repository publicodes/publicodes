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
			})
		)
	})
})
