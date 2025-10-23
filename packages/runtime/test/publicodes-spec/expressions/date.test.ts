import { yaml } from '../../utils/compile'

describe('Expressions > date', () => {
	it('jour', async () => {
		const engine = await yaml`
date: 15/05/1871
   `
		expect(engine.evaluate('date').value).toEqual(new Date('1871-05-15'))
		expect(engine.getType('date').date).toBe(true)
	})
	it('mois', async () => {
		const engine = await yaml`
date: 05/1871
   `
		expect(engine.evaluate('date').value).toEqual(new Date('1871-05-01'))
		expect(engine.getType('date').date).toBe(true)
	})

	it('comparaison', async () => {
		const engine = await yaml`
date: 01/01/1871
x:
  type: date

test:
  avec:
    lt: date < x
    gt: date > x
    eq: date = x
    neq: date != x
    lte: date <= x
    gte: date >= x
   `
		expect(
			engine.evaluate('test . lt', { x: new Date('1871-01-02') }).value,
		).toBe(true)
		expect(
			engine.evaluate('test . gt', { x: new Date('1871-05-14') }).value,
		).toBe(false)
		expect(
			engine.evaluate('test . eq', { x: new Date('1871-01-01') }).value,
		).toBe(true)
		expect(
			engine.evaluate('test . neq', { x: new Date('1871-05-15') }).value,
		).toBe(true)
		expect(
			engine.evaluate('test . lte', { x: new Date('1870-01-01') }).value,
		).toBe(false)
		expect(
			engine.evaluate('test . gte', { x: new Date('1871-01-01') }).value,
		).toBe(true)
	})
})
