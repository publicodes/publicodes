import { expect } from 'chai'
import Engine from '../source/index'

describe('Traversed variables - Basics', () => {
	const engine = new Engine({
		a: 1,
		b: '1 + a',
		c: '1 + a + a',
		d: 'e',
		e: 1,

		branches: 'b + f',
		f: 'g',
		g: 1,
	})

	it('should countain single rule if it has no dependency', () => {
		expect(engine.evaluate('a').traversedVariables).to.deep.equal(['a'])
	})
	it('should not be polluted by previous evaluations', () => {
		expect(engine.evaluate('a').traversedVariables).to.deep.equal(['a'])
		engine.evaluate('d')
		expect(engine.evaluate('d').traversedVariables).to.deep.equal(['d', 'e'])
	})
	it('should contain simple dependency', () => {
		expect(engine.evaluate('b').traversedVariables).to.deep.equal(['b', 'a'])
	})
	it('should contain simple dependency without duplication', () => {
		expect(engine.evaluate('c').traversedVariables).to.deep.equal(['c', 'a'])
	})
	it('should not be polluted by previous term in an operation', () => {
		engine.evaluate('branches')
		expect(engine.evaluate('f').traversedVariables).to.deep.equal(['f', 'g'])
	})
})
