import { describe, it, expect } from 'vitest'
import { contextOwner } from './context-stack'
import { build, constant, context } from './test-helpers/fixtures'

const doc = build({
	exemple: {
		value: constant(1),
		chain: [context({ taux: constant(2) })],
	},
})

describe('contextOwner', () => {
	it('names the rule that opened the outermost stack', () => {
		const opened = doc.exemple.chained_mechanisms[0]
		expect(contextOwner(doc, `-${opened.id}`)).toBe('exemple')
		// une pile plus profonde garde le même propriétaire
		expect(contextOwner(doc, `-${opened.id}-autre`)).toBe('exemple')
	})

	it('is null for the model own stack', () => {
		expect(contextOwner(doc, '')).toBeNull()
	})

	it('is null for a stack no rule opened', () => {
		expect(contextOwner(doc, '-inconnu')).toBeNull()
	})
})
