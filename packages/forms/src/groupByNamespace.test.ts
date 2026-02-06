import { describe, expect, test } from 'bun:test'
import { groupByNamespace, insertFieldInTree } from './groupByNamespace'

describe('insertFieldInTree', () => {
	test('should insert field into empty tree', () => {
		const tree = {
			type: 'node' as const,
			name: '',
			children: [],
		}
		const field = 'foo'

		const result = insertFieldInTree(tree, field)

		expect(result).toEqual({
			type: 'node',
			name: '',
			children: [
				{
					type: 'leaf',
					name: 'foo',
				},
			],
		})
	})

	test('should convert leaf to node when inserting into leaf', () => {
		const tree = {
			type: 'leaf' as const,
			name: 'foo',
		}
		const field = 'bar'

		const result = insertFieldInTree(tree, field)

		expect(result).toEqual({
			type: 'node',
			name: '',
			children: [
				{
					type: 'leaf',
					name: 'foo',
				},
				{
					type: 'leaf',
					name: 'bar',
				},
			],
		})
	})

	test('should group fields by common namespace', () => {
		const tree = {
			type: 'node' as const,
			name: '',
			children: [
				{
					type: 'leaf' as const,
					name: 'foo . bar',
				},
			],
		}
		const field = 'foo . baz'

		const result = insertFieldInTree(tree, field)

		expect(result).toEqual({
			type: 'node',
			name: '',
			children: [
				{
					type: 'node',
					name: 'foo',
					children: [
						{
							type: 'leaf',
							name: 'foo . bar',
						},
						{
							type: 'leaf',
							name: 'foo . baz',
						},
					],
				},
			],
		})
	})

	test('should add field to new namespace group when no common ancestor', () => {
		const tree = {
			type: 'node' as const,
			name: '',
			children: [
				{
					type: 'leaf' as const,
					name: 'foo . bar',
				},
			],
		}
		const field = 'baz . qux'

		const result = insertFieldInTree(tree, field)

		expect(result).toEqual({
			type: 'node',
			name: '',
			children: [
				{
					type: 'leaf',
					name: 'foo . bar',
				},
				{
					type: 'leaf',
					name: 'baz . qux',
				},
			],
		})
	})

	test('should group field by common namespace', () => {
		const tree = {
			type: 'node' as const,
			name: '',
			children: [
				{
					type: 'node' as const,
					name: 'a . b',
					children: [
						{
							type: 'leaf' as const,
							name: 'a . b . c',
						},
						{
							type: 'leaf' as const,
							name: 'a . b . d',
						},
					],
				},
			],
		}
		const field = 'a . c'

		const result = insertFieldInTree(tree, field)

		expect(result).toEqual({
			type: 'node',
			name: '',
			children: [
				{
					type: 'node',
					name: 'a',
					children: [
						{
							type: 'node',
							name: 'a . b',
							children: [
								{
									type: 'leaf',
									name: 'a . b . c',
								},
								{
									type: 'leaf',
									name: 'a . b . d',
								},
							],
						},
						{
							type: 'leaf',
							name: 'a . c',
						},
					],
				},
			],
		})
	})
})
describe('computePages', () => {
	test('should group by namespace with page titles', () => {
		const fields = [
			'company . name',
			'personal . first name',
			'stock . quantity',
			'personal . last name',
			'company . address',
		]
		const pages = groupByNamespace(fields)

		expect(pages).toEqual([
			{
				elements: ['company . name', 'company . address'],
				title: 'company',
			},
			{
				elements: ['personal . first name', 'personal . last name'],
				title: 'personal',
			},
			{
				elements: ['stock . quantity'],
				title: 'stock . quantity',
			},
		])
	})
})
