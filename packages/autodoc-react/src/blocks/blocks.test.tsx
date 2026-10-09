import { describe, expect, it } from 'vitest'
import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import type { Trace, TraceValue } from '@publicodes/autodoc-core'
import { projectRule } from '@publicodes/autodoc-core'
import { AutodocButtonNavigationContext } from '../components/AutodocNavigationContext'
import { Fiche } from './Fiche'
import { RulePage } from './RulePage'

const position = {
	file: 'test.publicodes',
	start: { index: 0, line: 1, column: 1 },
	end: { index: 1, line: 1, column: 2 },
}

const expr = (id: string, parameters: unknown) => ({
	value_mechanism: {
		kind: 'expr',
		id,
		type: 'number',
		unit: '€',
		position,
		parameters,
	},
	chained_mechanisms: [],
})

const ref = (id: string, parameters: string) => ({
	kind: 'ref',
	id,
	type: 'number',
	unit: '€',
	position,
	parameters,
})

const constant = (id: string, value: number) => ({
	kind: 'constant',
	id,
	type: 'number',
	unit: '€',
	position,
	parameters: { kind: 'const_number', value, unit: '€' },
})

const ast = {
	total: {
		type: 'number',
		unit: '€',
		id: 's1',
		position,
		title: 'Total',
		description: 'La somme de la part et du forfait.',
		referenced_by: [],
		parameters: ['part', 'forfait'],
		value_mechanism: {
			kind: 'sum',
			id: 's1',
			type: 'number',
			unit: '€',
			position,
			parameters: [
				expr('e1', ref('r1', 'part')),
				expr('e2', constant('c1', 5)),
				expr('e3', constant('c2', 0)),
			],
		},
		chained_mechanisms: [],
	},
	part: {
		type: 'number',
		unit: '€',
		id: 'n1',
		position,
		title: 'Part',
		description: 'La part que vous avez saisie.',
		referenced_by: ['total'],
		parameters: [],
		value_mechanism: { kind: 'not_defined', id: 'n1', type: 'number', unit: '€', position },
		chained_mechanisms: [],
	},
	forfait: {
		type: 'number',
		unit: '€',
		id: 'n2',
		position,
		title: 'Forfait',
		referenced_by: ['total'],
		parameters: [],
		value_mechanism: { kind: 'not_defined', id: 'n2', type: 'number', unit: '€', position },
		chained_mechanisms: [
			{
				kind: 'default',
				id: 'd1',
				type: 'number',
				unit: '€',
				position,
				parameters: {
					value_mechanism: {
						kind: 'expr',
						id: 'e4',
						type: 'number',
						unit: '€',
						position,
						parameters: constant('c3', 5),
					},
					chained_mechanisms: [],
				},
			},
		],
	},
} as unknown as PublicodeAST

const context: Record<string, TraceValue> = { part: 10 }
const trace = {
	s1: { '': 15 },
	e1: { '': 10 },
	e2: { '': 5 },
	e3: { '': 0 },
	e4: { '': 5 },
	r1: { '': 10 },
	c1: { '': 5 },
	c2: { '': 0 },
	c3: { '': 5 },
} as unknown as Trace

const renderPage = () =>
	render(<RulePage ast={ast} rule="total" trace={trace} context={context} />)

describe('the documented class names are the override contract', () => {
	it('renders one block per documented class name', () => {
		const { container } = renderPage()
		for (const name of [
			'publicodes-rule-page',
			'publicodes-rule-header',
			'publicodes-rule-description',
			'publicodes-rule-computation',
			'publicodes-rule-parameters',
			'publicodes-rule-provenance',
		]) {
			expect(container.querySelector(`.${name}`), name).not.toBeNull()
		}
	})

	it('prints the rule value once, at the head of the computation', () => {
		const { container } = renderPage()
		expect(container.querySelector('.publicodes-row--head .publicodes-value')?.textContent).toBe('15 €')
		expect(container.textContent?.split('15 €').length).toBe(2)
	})
})

describe('terms that had no effect', () => {
	it('folds them away and says how many', () => {
		const { container } = renderPage()
		const fold = container.querySelector('.publicodes-fold button')
		expect(fold?.textContent).toBe('Afficher 1 terme sans effet')
		expect(container.querySelector('.publicodes-row--inert')).toBeNull()
		expect(container.querySelectorAll('.publicodes-row').length).toBe(3)
	})

	it('shows them again when asked', () => {
		const { container } = renderPage()
		fireEvent.click(container.querySelector('.publicodes-fold button')!)
		expect(container.querySelectorAll('.publicodes-row--inert').length).toBe(1)
	})
})

describe('unfolding a reference', () => {
	const openFirstSheet = () => {
		const rendered = renderPage()
		fireEvent.click(rendered.container.querySelector('button.publicodes-link')!)
		return rendered
	}

	it('is a button that reads as a link', () => {
		const { container } = renderPage()
		const link = container.querySelector('button.publicodes-link')
		expect(link).not.toBeNull()
		expect(link?.getAttribute('aria-expanded')).toBe('false')
	})

	it('unfolds as one block: the row and its detail, with the actions at the foot', () => {
		const { container } = openFirstSheet()
		const block = container.querySelector('.publicodes-block')
		expect(block).not.toBeNull()
		// the block covers the line that opened and the detail it opened
		expect(block?.querySelector('.publicodes-row')).not.toBeNull()
		expect(block?.querySelector('.publicodes-detail')).not.toBeNull()
		expect(block?.querySelector('.publicodes-detail__close')).not.toBeNull()
	})

	it('carries a link to the rule when the host offers navigation', () => {
		const rendered = render(
			<AutodocButtonNavigationContext.Provider
				value={{ rule: 'total', contextStackId: '', onNavigate: () => {} }}
			>
				<RulePage ast={ast} rule="total" trace={trace} context={context} />
			</AutodocButtonNavigationContext.Provider>,
		)
		fireEvent.click(rendered.container.querySelector('button.publicodes-link')!)
		expect(
			rendered.container.querySelector('.publicodes-detail__tools .publicodes-link'),
		).not.toBeNull()
	})

	it('alternates the paper the block is written on', () => {
		const { container } = openFirstSheet()
		expect(container.querySelector('.publicodes-block')?.getAttribute('data-paper')).toBe('white')
	})

	it('closes again', () => {
		const { container } = openFirstSheet()
		fireEvent.click(container.querySelector('.publicodes-detail__close')!)
		expect(container.querySelector('.publicodes-detail')).toBeNull()
	})
})

describe('the fiche (kept exported, not wired into the page for now)', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	const hovered = (): HTMLElement => {
		vi.useFakeTimers()
		const view = projectRule(ast, 'part', { trace, context })
		const { container } = render(
			<Fiche view={view}>
				<span>Part</span>
			</Fiche>,
		)
		expect(container.querySelector('[role="tooltip"]')).toBeNull()
		fireEvent.mouseEnter(container.querySelector('.publicodes-fiche')!)
		act(() => {
			vi.advanceTimersByTime(500)
		})
		const tooltip = container.querySelector('[role="tooltip"]')
		if (!tooltip) throw new Error('the fiche did not open')
		return tooltip as HTMLElement
	}

	it('opens half a second after the pointer rests, not before', () => {
		expect(hovered()).not.toBeNull()
	})

	it('carries what the model says, the value, and the address', () => {
		const tooltip = hovered()
		expect(tooltip.querySelector('.publicodes-fiche__doc')).not.toBeNull()
		expect(tooltip.querySelector('.publicodes-fiche__value')).not.toBeNull()
		expect(tooltip.querySelector('.publicodes-fiche__address')?.textContent).toBe(
			'part',
		)
	})
})

describe('the context of the computation', () => {
	it('shows a supplied value plainly and a defaulted one with a quiet qualifier', () => {
		const { container } = renderPage()
		const rows = Array.from(
			container.querySelectorAll('.publicodes-rule-parameters tbody tr'),
		)
		const part = rows.find((row) => row.textContent?.includes('Part'))
		const forfait = rows.find((row) => row.textContent?.includes('Forfait'))
		expect(part?.textContent).toContain('10 €')
		expect(part?.querySelector('.publicodes-qualifier')).toBeNull()
		expect(forfait?.textContent).toContain('5 €')
		expect(forfait?.querySelector('.publicodes-qualifier')?.textContent).toBe(' (par défaut)')
	})
})
