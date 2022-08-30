import { expect } from 'chai'
import { RuleNode } from '../source'
import {
	disambiguateReference,
	isAccessible,
	ruleParents,
} from '../source/ruleUtils'

describe('ruleParents', function () {
	it('should procude an array of the parents of a rule', function () {
		let parents = ruleParents(
			'CDD . taxe . montant annuel . exonération annuelle'
		)
		expect(parents).to.eql(['CDD . taxe . montant annuel', 'CDD . taxe', 'CDD'])
	})
})

function createDummyRule(
	dottedName: string,
	properties: Partial<RuleNode> = {}
): Record<string, RuleNode> {
	return {
		[dottedName]: {
			dottedName,
			title: dottedName,
			nodeKind: 'rule',
			virtualRule: false,
			private: false,
			rawNode: {
				nom: dottedName,
			},
			replacements: [],
			explanation: {} as any,
			suggestions: {},
			...properties,
		},
	}
}

describe('isAccessible', () => {
	it("should throws if rule to check doesn't exists", () => {
		expect(() => isAccessible({}, '', 'a')).to.throw(
			'\n[ Erreur d\'évaluation ]\n➡️  Dans la règle "a"\n✖️  La règle "a" n\'existe pas'
		)
	})

	it('should return true if no rules are private', () => {
		const parsedRules = {
			...createDummyRule('a'),
			...createDummyRule('b'),
			...createDummyRule('b . c'),
		}
		expect(isAccessible(parsedRules, 'b . c', 'b')).to.be.true
		expect(isAccessible(parsedRules, 'b . c', 'b')).to.be.true
		expect(isAccessible(parsedRules, '', 'a')).to.be.true
		expect(isAccessible(parsedRules, 'b . c', 'a')).to.be.true
	})

	it('should return false for grandchildren rules if they are private', () => {
		const parsedRules = {
			...createDummyRule('a'),
			...createDummyRule('a . b', { private: true }),
		}
		expect(isAccessible(parsedRules, '', 'a . b')).to.be.false
	})

	it('should return true for itself', () => {
		const parsedRules = {
			...createDummyRule('a'),
			...createDummyRule('a . b', { private: true }),
		}
		expect(isAccessible(parsedRules, 'a . b', 'a . b')).to.be.true
	})
	it('should return true for a parent', () => {
		const parsedRules = {
			...createDummyRule('a', { private: true }),
			...createDummyRule('a . b'),
			...createDummyRule('a . b . c'),
		}
		expect(isAccessible(parsedRules, 'a . b . c', 'a')).to.be.true
	})
	it('should return true if a children rule is private', () => {
		const parsedRules = {
			...createDummyRule('a', { private: true }),
			...createDummyRule('a . b'),
		}
		expect(isAccessible(parsedRules, 'a', 'a . b')).to.be.true
	})
	it('should return true if a sibling rule is private', () => {
		const parsedRules = {
			...createDummyRule('a'),
			...createDummyRule('a . b', { private: true }),
			...createDummyRule('a . c'),
		}
		expect(isAccessible(parsedRules, 'a . c', 'a . b')).to.be.true
	})
	it('should return false if a nephew rule is private', () => {
		const parsedRules = {
			...createDummyRule('a'),
			...createDummyRule('a . b', { private: true }),
			...createDummyRule('c'),
		}
		expect(isAccessible(parsedRules, 'c', 'a . b')).to.be.false
	})
	it('should return false for the child of a private nephew rule', () => {
		const parsedRules = {
			...createDummyRule('a'),
			...createDummyRule('a . a', { private: true }),
			...createDummyRule('a . a . a', { private: true }),
			...createDummyRule('b'),
		}
		expect(isAccessible(parsedRules, 'b', 'a . a . a')).to.be.false
	})
})

describe('disambiguateReference', function () {
	it('should throw an error if no rule is found', () => {
		expect(() =>
			disambiguateReference({}, 'a', 'exonération annuelle')
		).to.throw(/[Erreur syntaxique]/)
	})

	it("should disambiguate a reference to another rule in a rule, given the latter's namespace", function () {
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
				'exonération annuelle'
			)
		).to.eql('CDD . taxe . montant annuel . exonération annuelle')
		expect(
			disambiguateReference(
				parsedRules,
				'CDD . taxe . montant annuel',
				'condition'
			)
		).to.eql('CDD . condition')
	})

	it('should disambiguate rules according to accessibility', function () {
		const parsedRules = {
			...createDummyRule('a', { private: true }),
			...createDummyRule('a . a'),
			...createDummyRule('b'),
			...createDummyRule('b . a'),
			...createDummyRule('b . a . a', { private: true }),
		}
		expect(disambiguateReference(parsedRules, '', 'a')).to.eq('a')
		expect(disambiguateReference(parsedRules, 'b', 'a')).to.eq('b . a')
		expect(disambiguateReference(parsedRules, 'b', 'a . a')).to.eq('a . a')
		expect(disambiguateReference(parsedRules, 'b . a', 'a . a')).to.eq(
			'b . a . a'
		)
		expect(() => disambiguateReference(parsedRules, '', 'b . a . a')).to.throw(
			/[Erreur syntaxique]/
		)
	})
})
