const { f } = require('../src/lib')

describe('Test 1', () => {
	it("It should return 'Hello Charlie!'", () => {
		expect(f('Charlie')).toBe('Hello Charlie!')
	})
})
