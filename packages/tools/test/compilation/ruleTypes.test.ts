import Engine, { Rule } from 'publicodes'
import { describe, expect, it } from 'vitest'
import { RawRules } from '../../src'
import { resolveRuleTypes } from '../../src/compilation/ruleTypes'

const getTypes = (rawRules: RawRules) => {
	const engine = new Engine(rawRules as Record<string, Rule>)
	return resolveRuleTypes(engine)
}

describe('resolveRuleType > constant rules', () => {
	it('empty', () => {
		const rawRules = { rule: null }
		expect(getTypes(rawRules)).toEqual({
			rule: { type: 'boolean', isNullable: false },
		})
	})

	it('number', () => {
		const rawRules = { rule: 42 }
		expect(getTypes(rawRules)).toEqual({
			rule: { type: 'number', isNullable: false },
		})
	})

	it('date', () => {
		const rawRules = { rule: '01/03/2022' }
		expect(getTypes(rawRules)).toEqual({
			rule: { type: 'date', isNullable: false },
		})
	})

	it('boolean', () => {
		const rawRules = { vrai: 'oui', faux: 'non' }
		expect(getTypes(rawRules)).toEqual({
			vrai: { type: 'boolean', isNullable: false },
			faux: { type: 'boolean', isNullable: false },
		})
	})

	it('string', () => {
		const rawRules = { rule: "'value 1'" }
		expect(getTypes(rawRules)).toEqual({
			rule: { type: 'string', isNullable: false },
		})
	})

	it('enum (une possibilité)', () => {
		const rawRules = {
			rule: {
				'une possibilité': ['valeur 1', 'valeur 2'],
				avec: {
					'valeur 1': null,
					'valeur 2': null,
				},
			},
		}
		expect(getTypes(rawRules)).toEqual({
			rule: {
				type: 'enum',
				options: ['valeur 1', 'valeur 2'],
				isNullable: false,
			},
			'rule . valeur 1': { type: 'boolean', isNullable: false },
			'rule . valeur 2': { type: 'boolean', isNullable: false },
		})
	})

	it('enum (une possibilité de nombre)', () => {
		const rawRules = {
			rule: {
				'une possibilité': ['10 km', '20'],
			},
		}
		expect(getTypes(rawRules)).toEqual({
			rule: {
				type: 'enum',
				options: ['10', '20'],
				isNullable: false,
			},
		})
	})

	it('enum (une possibilité de string)', () => {
		const rawRules = {
			rule: {
				'une possibilité': ["'valeur 1'", "'valeur 2'"],
			},
		}
		expect(getTypes(rawRules)).toEqual({
			rule: {
				type: 'enum',
				options: ['valeur 1', 'valeur 2'],
				isNullable: false,
			},
		})
	})
})

// TODO: Add tests for the following cases:
// describe('resolveRuleType > complexe rules', () => {})
