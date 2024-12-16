import { describe, expect, it } from 'vitest'
import {
	explodeUntilUnderMaxField,
	groupUntilOverMinField,
} from './pageSplitter'

describe('groupUntilOverMinField', () => {
	it('should combine pages under minFields', () => {
		const pages = [
			['a', 'b'],
			['c', 'd'],
		]
		const options = { maxFields: 5, minFields: 4 }
		const result = groupUntilOverMinField(options, pages)
		expect(result).to.deep.equal([['a', 'b', 'c', 'd']])
	})

	it('should not combine pages if it lead to page over maxFields (even if it leads to minFields beeing not respected)', () => {
		const pages = [['a'], ['b', 'c', 'd', 'e']]
		const options = { maxFields: 4, minFields: 2 }
		const result = groupUntilOverMinField(options, pages)
		expect(result).to.deep.equal([['a'], ['b', 'c', 'd', 'e']])
	})

	it('leave page between minFields and maxFields as is', () => {
		const pages = [
			['a', 'b', 'c'],
			['d', 'e', 'f'],
		]
		const options = { maxFields: 4, minFields: 2 }
		const result = groupUntilOverMinField(options, pages)
		expect(result).to.deep.equal([
			['a', 'b', 'c'],
			['d', 'e', 'f'],
		])
	})
	it('combine to avoid pages under minFields', () => {
		const pages = [['a', 'b', 'c'], ['d'], ['e', 'f', 'g', 'h']]
		const options = { maxFields: 4, minFields: 2 }
		const result = groupUntilOverMinField(options, pages)
		expect(result).to.deep.equal([
			['a', 'b', 'c', 'd'],
			['e', 'f', 'g', 'h'],
		])
	})
})

describe('explodeUntilUnderMaxField', () => {
	it('should return single group when fields are under maxFields', () => {
		const fields = ['a', 'b', 'c']
		const options = { maxFields: 4, minFields: 2 }
		const result = explodeUntilUnderMaxField(options, '', fields)
		expect(result).to.deep.equal([['', ['a', 'b', 'c']]])
	})

	it('should group by namespace when fields share common prefix', () => {
		const fields = ['foo . a', 'foo . b', 'bar . c']
		const options = { maxFields: 2, minFields: 1 }
		const result = explodeUntilUnderMaxField(options, '', fields)
		expect(result).to.deep.equal([
			['foo', ['foo . a', 'foo . b']],
			['bar', ['bar . c']],
		])
	})

	it('should recursively split when namespace group exceeds maxFields', () => {
		const fields = ['foo . bar . a', 'foo . bar . b', 'foo . c', 'foo . d', 'a']
		const options = { maxFields: 2, minFields: 1 }
		const result = explodeUntilUnderMaxField(options, '', fields)
		expect(result).to.deep.equal([
			['foo . bar', ['foo . bar . a', 'foo . bar . b']],
			['foo . c', ['foo . c']],
			['foo . d', ['foo . d']],
			['a', ['a']],
		])
	})

	it('should handle nested namespaces', () => {
		const fields = ['foo . bar . a', 'foo . bar . b', 'foo . baz . c']
		const options = { maxFields: 2, minFields: 1 }
		const result = explodeUntilUnderMaxField(options, '', fields)
		expect(result).to.deep.equal([
			['foo . bar', ['foo . bar . a', 'foo . bar . b']],
			['foo . baz', ['foo . baz . c']],
		])
	})
})
