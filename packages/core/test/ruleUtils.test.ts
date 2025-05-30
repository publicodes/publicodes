import { describe, it, expect } from 'vitest'
import { RuleNode } from '../src'
import {
	disambiguateReference,
	isAccessible,
	ruleParents,
} from '../src/ruleUtils'

describe('ruleParents', () => {
	it('should procude an array of the parents of a rule', () => {
		const parents = ruleParents(
			'CDD . taxe . montant annuel . exonération annuelle',
		)
		expect(parents).toEqual([
			'CDD . taxe . montant annuel',
			'CDD . taxe',
			'CDD',
		])
	})
})

function createDummyRule(
	dottedName: string,
	properties: Partial<RuleNode> = {},
): Record<string, RuleNode> {
	return {
		[dottedName]: {
			dottedName,
			title: dottedName,
			nodeKind: 'rule',
			virtualRule: false,
			private: false,
			rawNode: {},
			replacements: [],
			explanation: {} as any,
			suggestions: {},
			...properties,
		},
	} as any
}

describe('isAccessible', () => {
	it("should throws if rule to check doesn't exists", () => {
		expect(() => isAccessible({}, '', 'a')).toThrow(
			'\n[ InternalError ]\n➡️  Dans la règle "a"\n✖️  La règle "a" n\'existe pas',
		)
	})

	it('should return true if no rules are private', () => {
		const parsedRules = {
			...createDummyRule('a'),
			...createDummyRule('b'),
			...createDummyRule('b . c'),
		}
		expect(isAccessible(parsedRules, 'b . c', 'b')).toBe(true)
		expect(isAccessible(parsedRules, 'b . c', 'b')).toBe(true)
		expect(isAccessible(parsedRules, '', 'a')).toBe(true)
		expect(isAccessible(parsedRules, 'b . c', 'a')).toBe(true)
	})

	it('should return false for grandchildren rules if they are private', () => {
		const parsedRules = {
			...createDummyRule('a'),
			...createDummyRule('a . b', { private: true }),
		}
		expect(isAccessible(parsedRules, '', 'a . b')).toBe(false)
	})

	it('should return true for itself', () => {
		const parsedRules = {
			...createDummyRule('a'),
			...createDummyRule('a . b', { private: true }),
		}
		expect(isAccessible(parsedRules, 'a . b', 'a . b')).toBe(true)
	})

	it('should return true for a parent', () => {
		const parsedRules = {
			...createDummyRule('a', { private: true }),
			...createDummyRule('a . b'),
			...createDummyRule('a . b . c'),
		}
		expect(isAccessible(parsedRules, 'a . b . c', 'a')).toBe(true)
	})

	it('should return true if a children rule is private', () => {
		const parsedRules = {
			...createDummyRule('a', { private: true }),
			...createDummyRule('a . b'),
		}
		expect(isAccessible(parsedRules, 'a', 'a . b')).toBe(true)
	})

	it('should return true if a sibling rule is private', () => {
		const parsedRules = {
			...createDummyRule('a'),
			...createDummyRule('a . b', { private: true }),
			...createDummyRule('a . c'),
		}
		expect(isAccessible(parsedRules, 'a . c', 'a . b')).toBe(true)
	})

	it('should return false if a nephew rule is private', () => {
		const parsedRules = {
			...createDummyRule('a'),
			...createDummyRule('a . b', { private: true }),
			...createDummyRule('c'),
		}
		expect(isAccessible(parsedRules, 'c', 'a . b')).toBe(false)
	})

	it('should return false for the child of a private nephew rule', () => {
		const parsedRules = {
			...createDummyRule('a'),
			...createDummyRule('a . a', { private: true }),
			...createDummyRule('a . a . a', { private: true }),
			...createDummyRule('b'),
		}
		expect(isAccessible(parsedRules, 'b', 'a . a . a')).toBe(false)
	})
})

describe('disambiguateReference', () => {
	it('should throw an error if no rule is found', () => {
		expect(() =>
			disambiguateReference({}, 'a', 'exonération annuelle'),
		).toThrow(/[Erreur syntaxique]/)
	})

	it("should disambiguate a reference to another rule in a rule, given the latter's namespace", () => {
		const parsedRules = {
			...createDummyRule('CDD'),
			...createDummyRule('CDD . condition'),
			...createDummyRule('CDD . taxe'),
			...createDummyRule('CDD . taxe . montant annuel'),
			...createDummyRule('CDD . taxe . montant annuel . exonération annuelle'),
		}
		expect(
			disambiguateReference(
				parsedRules,
				'CDD . taxe . montant annuel',
				'exonération annuelle',
			),
		).toEqual('CDD . taxe . montant annuel . exonération annuelle')
		expect(
			disambiguateReference(
				parsedRules,
				'CDD . taxe . montant annuel',
				'condition',
			),
		).toEqual('CDD . condition')
	})

	it('should disambiguate rules according to accessibility', () => {
		const parsedRules = {
			...createDummyRule('a', { private: true }),
			...createDummyRule('a . a'),
			...createDummyRule('b'),
			...createDummyRule('b . a'),
			...createDummyRule('b . a . a', { private: true }),
		}
		expect(disambiguateReference(parsedRules, '', 'a')).toEqual('a')
		expect(disambiguateReference(parsedRules, 'b', 'a')).toEqual('b . a')
		expect(disambiguateReference(parsedRules, 'b', 'a . a')).toEqual('a . a')
		expect(disambiguateReference(parsedRules, 'b . a', 'a . a')).toEqual(
			'b . a . a',
		)
		expect(() => disambiguateReference(parsedRules, '', 'b . a . a')).toThrow(
			/[Erreur syntaxique]/,
		)
	})
})
