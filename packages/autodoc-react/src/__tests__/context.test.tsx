/** Le bloc du contexte : le fil des contextes et les paramètres que le calcul a lus. */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import type { ContextBlockView, OperandView } from '@publicodes/autodoc-core'
import { RuleContext } from '../blocks/RuleContext'
import { Autodoc, type AutodocLinkProps } from '../components/AutodocContext'

/** Un hôte qui écrit ses liens : ancre, ou bouton qui garde la règle dans son état. */
const linkTo =
	(href: (rule: string, stack: string) => string) =>
	({ rule, stack, className, children }: AutodocLinkProps) => (
		<a className={className} href={href(rule, stack)}>
			{children}
		</a>
	)

afterEach(cleanup)

const row = (
	name: string,
	text: string | null,
	overrides: Partial<OperandView> = {},
): OperandView => ({
	id: name,
	gutter: '',
	gutterIsMechanism: false,
	key: null,
	depth: 0,
	termIsMechanism: false,
	control: null,
	label: name,
	value:
		text === null ?
			{ state: 'absent' as const, value: null, text: null }
		:	{ state: 'value' as const, value: 1, text },
	address: name,
	page: null,
	description: null,
	parameterNote: null,
	detail: null,
	open: false,
	fold: null,
	inert: false,
	folded: false,
	modifier: false,
	applicability: false,
	...overrides,
})

/** La fiche que la ligne `contexte` ouvre : les paramètres lus. */
const sheet = (rows: OperandView[]) => ({
	keyword: null,
	inlineTerm: null,
	head: null,
	rows,
	size: rows.length,
	result: { state: 'absent' as const, value: null, text: null },
	fold: null,
	note: null,
	contextId: null,
	depth: 1,
	header: 'valeur du paramètre',
})

/** La ligne du bloc : le mot `contexte`, sa fiche, et le pli. */
const line = (rows: OperandView[], fold: OperandView['fold'] = null) =>
	row('context-header', null, {
		gutter: 'contexte',
		gutterIsMechanism: true,
		detail: sheet(rows),
		open: true,
		fold,
	})

const view = (overrides: Partial<ContextBlockView> = {}): ContextBlockView => ({
	crumbs: [{ name: 'Revenu net', rule: 'revenu net', stack: '' }],
	equation: {
		keyword: null,
		inlineTerm: null,
		rows: [line([row('TJM', '600 €/jour', { depth: 1 })])],
		size: 1,
		result: { state: 'absent', value: null, text: null },
		fold: null,
		note: null,
		contextId: null,
		depth: 0,
		header: null,
	},
	...overrides,
})

describe('RuleContext', () => {
	it('names the block, and the parameters the computation used', () => {
		render(<RuleContext view={view()} />)
		expect(
			screen.getByRole('heading', { name: 'Contexte du calcul' }),
		).toBeTruthy()
		expect(screen.getByText('TJM')).toBeTruthy()
		expect(screen.getByText('600 €/jour')).toBeTruthy()
	})

	it('reads as the sheet a `contexte` opens: its two words, then the parameters below', () => {
		const { container } = render(<RuleContext view={view()} />)
		const words = Array.from(
			container.querySelectorAll('.publicodes-row__label--word'),
		).map((word) => word.textContent)
		expect(words).toEqual(['contexte', 'valeur du paramètre'])
		expect(
			container.querySelector('.publicodes-detail[data-table]'),
		).not.toBeNull()
		// une fiche qu'aucun clic n'ouvre est là d'emblée : elle ne se déplie pas au chargement
		expect(
			container.querySelector('.publicodes-detail[data-static]'),
		).not.toBeNull()
	})

	it('leads to a parameter’s page, when the model gives it one', () => {
		render(
			<Autodoc Link={linkTo((rule) => `#/${rule}`)}>
				<RuleContext
					view={view({
						equation: {
							...view().equation,
							rows: [
								line([
									row('TJM', '600 €/jour', {
										depth: 1,
										page: { address: 'TJM', name: 'TJM' },
									}),
								]),
							],
						},
					})}
				/>
			</Autodoc>,
		)
		expect(
			screen
				.getByRole('link', { name: 'Ouvrir la page de TJM' })
				.getAttribute('href'),
		).toBe('#/TJM')
	})

	it('says nothing of the trail when the page is read in the model’s own context', () => {
		const { container } = render(<RuleContext view={view()} />)
		expect(container.querySelector('.publicodes-context-crumbs')).toBeNull()
	})

	it('trails the stacked contexts and leads back to the base one', () => {
		render(
			<Autodoc Link={linkTo((rule, stack) => `#/${rule}?ctx=${stack}`)}>
				<RuleContext
					view={view({
						crumbs: [
							{ name: 'Revenu net', rule: 'revenu net', stack: '' },
							{ name: 'TJM doublé', rule: 'revenu net', stack: '-ctx' },
						],
					})}
				/>
			</Autodoc>,
		)
		const back = screen.getByRole('link', { name: 'Revenu net' })
		expect(back.getAttribute('href')).toBe('#/revenu net?ctx=')
		// le dernier cran est celui de la page : il n'y a pas d'où revenir
		expect(screen.getByText('TJM doublé').getAttribute('aria-current')).toBe(
			'page',
		)
	})

	it('explains a value a context decided rather than the reader', () => {
		render(
			<RuleContext
				view={view({
					equation: {
						...view().equation,
						rows: [
							line([
								row('TJM', '1 200 €/jour', {
									depth: 1,
									parameterNote: 'Valeur liée par le contexte du calcul.',
								}),
							]),
						],
					},
				})}
			/>,
		)
		// la phrase vit sur le mot de la ligne, pas sur le chiffre
		expect(
			document.querySelectorAll(
				'[title="Valeur liée par le contexte du calcul."]',
			).length,
		).toBeGreaterThan(0)
	})

	it('holds back the parameters the computation did not take from the reader', () => {
		render(
			<RuleContext
				view={view({
					equation: {
						...view().equation,
						rows: [
							line([row('TJM', '600 €/jour', { depth: 1 })], {
								id: 'net#context',
								count: 2,
								label: 'Afficher 2 paramètres sans valeur fournie',
								expanded: false,
							}),
						],
					},
				})}
			/>,
		)
		const fold = screen.getByRole('button', {
			name: 'Afficher 2 paramètres sans valeur fournie',
		})
		expect(fold.querySelector('.publicodes-fold__count')?.textContent).toBe('2')
	})

	it('renders nothing when there is no context to tell', () => {
		const { container } = render(
			<RuleContext
				view={{
					...view(),
					equation: { ...view().equation, rows: [line([])] },
				}}
			/>,
		)
		expect(container.querySelector('.publicodes-rule-context')).toBeNull()
	})
})
