import { yaml } from '../../utils/compile'

describe('Expressions > reference', () => {
	it('simple', async () => {
		const engine = await yaml`

a: 4
b: a
`
		expect(engine.evaluate('b').value).toEqual(4)
		expect(engine.getType('b')).toHaveProperty('number')
	})

	it('should resolve to child first', async () => {
		const engine = await yaml`
b:
b . a: c
b . a . c: 1
b . c: 2
c: 3

`
		expect(engine.evaluate('b . a').value).toEqual(1)
	})

	it('should resolve to sibling then', async () => {
		const engine = await yaml`
b:
b . a: c
b . c: 2
c: 3

`
		expect(engine.evaluate('b . a').value).toEqual(2)
	})
	it('should not reference itself', async () => {
		const engine = await yaml`
b:
b . c: c
c: 5
`
		expect(engine.evaluate('b . c').value).toEqual(5)
	})

	it('should allow to chain reference', async () => {
		const engine = await yaml`
a: b
b: c
c: 10


`
		expect(engine.evaluate('a').value).toEqual(10)
	})
})
