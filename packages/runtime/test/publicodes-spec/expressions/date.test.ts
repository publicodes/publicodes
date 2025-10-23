import { yaml } from '../../utils/compile'

describe('Expressions > date', () => {
	it('jour', async () => {
		const engine = await yaml`
date: 15/05/1871
   `
		expect(engine.date.evaluate()).toEqual(new Date('1871-05-15'))
		expect(engine.date.type).toBe('date')
	})
	it('mois', async () => {
		const engine = await yaml`
date: 05/1871
   `
		expect(engine.date.evaluate()).toEqual(new Date('1871-05-01'))
		expect(engine.date.type).toBe('date')
	})

	it.skip('comparaison', async () => {
		const { lt, gt, eq, neq, lte, gte } = await yaml`
date: 01/01/1871
x:
  type: date


lt: date < x
gt: date > x
eq: date = x
neq: date != x
lte: date <= x
gte: date >= x
   `
		expect(lt.evaluate({ x: new Date('1871-01-02') })).toBe(true)
		expect(gt.evaluate({ x: new Date('1871-05-14') })).toBe(false)
		// @FIXME
		expect(eq.evaluate({ x: new Date('1871-01-01') })).toBe(true)
		expect(neq.evaluate({ x: new Date('1871-05-15') })).toBe(true)
		expect(lte.evaluate({ x: new Date('1870-01-01') })).toBe(false)
		expect(gte.evaluate({ x: new Date('1871-01-01') })).toBe(true)
	})
})
