import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import type { Trace, TraceValue } from '@publicodes/autodoc-core'
import { AutodocButtonNavigationContext } from '../components/AutodocNavigationContext'
import { RulePage } from './RulePage'
import { Value } from './Value'

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
	render(<RulePage ast={ast} rule="total" evaluation={{ trace }} context={context} />)

describe('the page of an opened rule', () => {
	// `part` is a parameter the API exposes, so it has a page of its own
	const publicAst = {
		...ast,
		part: { ...ast.part, public: true },
	} as unknown as PublicodeAST
	const openFirstRow = (document_ = publicAst, onNavigate = () => {}) => {
		const rendered = render(
			<AutodocButtonNavigationContext.Provider
				value={{ rule: 'total', contextStackId: '', onNavigate }}
			>
				<RulePage
					ast={document_}
					rule="total"
					evaluation={{ trace }}
					context={context}
				/>
			</AutodocButtonNavigationContext.Provider>,
		)
		fireEvent.click(rendered.container.querySelector('button.publicodes-row__control')!)
		return rendered
	}

	it('offers the way there beside the name, once the row is open', () => {
		const { container } = openFirstRow()
		const link = container.querySelector('.publicodes-page-link')
		expect(link).not.toBeNull()
		expect(link?.textContent).toBe('Ouvrir la page de Part')
	})

	it('goes where the host says, with the rule and the context stack', () => {
		const onNavigate = vi.fn()
		const { container } = openFirstRow(publicAst, onNavigate)
		fireEvent.click(container.querySelector('.publicodes-page-link')!)
		expect(onNavigate).toHaveBeenCalledWith('part', '')
	})

	it('stays bare without a navigation to offer', () => {
		const rendered = render(
			<RulePage ast={publicAst} rule="total" evaluation={{ trace }} context={context} />,
		)
		fireEvent.click(rendered.container.querySelector('button.publicodes-row__control')!)
		expect(rendered.container.querySelector('.publicodes-page-link')).toBeNull()
	})

	it('stays bare when the rule has no page of its own', () => {
		const { container } = openFirstRow(ast)
		expect(container.querySelector('.publicodes-page-link')).toBeNull()
	})
})

describe('the documented class names are the override contract', () => {
	it('renders each block of the default page under its documented class name', () => {
		const { container } = renderPage()
		for (const name of [
			'publicodes-rule-page',
			'publicodes-rule-header',
			'publicodes-rule-description',
			'publicodes-rule-computation',
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
	it('holds them back behind a control that counts them', () => {
		const { container } = renderPage()
		const fold = container.querySelector('.publicodes-fold')
		expect(fold?.getAttribute('aria-label')).toBe('Afficher 1 terme sans effet')
		expect(fold?.querySelector('.publicodes-fold__count')?.textContent).toBe('1')
		expect(container.querySelector('.publicodes-row--inert')).toBeNull()
		expect(container.querySelectorAll('.publicodes-row').length).toBe(3)
	})

	it('shows them again when asked', () => {
		const { container } = renderPage()
		fireEvent.click(container.querySelector('.publicodes-fold')!)
		expect(container.querySelectorAll('.publicodes-row--inert').length).toBe(1)
		expect(container.querySelector('.publicodes-fold__count')).toBeNull()
	})

	it('keeps the row it sits on open: the two gestures are not the same', () => {
		const { container } = renderPage()
		fireEvent.click(container.querySelector('button.publicodes-row__control')!)
		fireEvent.click(container.querySelector('.publicodes-fold')!)
		// the fiche is still unfolded, and the terms came out
		expect(container.querySelector('.publicodes-block')).not.toBeNull()
		expect(container.querySelectorAll('.publicodes-row--inert').length).toBe(1)
	})
})

describe('unfolding a reference', () => {
	const openFirstSheet = () => {
		const rendered = renderPage()
		fireEvent.click(rendered.container.querySelector('button.publicodes-row__control')!)
		return rendered
	}

	it('is a button that reads as the row’s disclosure', () => {
		const { container } = renderPage()
		const link = container.querySelector('button.publicodes-row__control')
		expect(link).not.toBeNull()
		expect(link?.getAttribute('aria-expanded')).toBe('false')
	})

	it('makes the line its target, and nests no control in it', () => {
		const { container } = renderPage()
		const row = container.querySelector('div.publicodes-row--unfoldable')
		expect(row).not.toBeNull()
		// the name is the row's control; the fold chip is a sibling of that button,
		// never a button inside it
		const others = Array.from(row!.querySelectorAll('button')).filter(
			(button) =>
				!button.classList.contains('publicodes-row__control') &&
				!button.classList.contains('publicodes-fold'),
		)
		expect(others).toEqual([])
	})

	it('stretches the name’s target over the whole line', () => {
		// the row is the button through this rule, so the rule is the contract
		const css = readFileSync('../autodoc-core/src/styles/autodoc.css', 'utf8')
		const rule = css.slice(css.indexOf('.publicodes-row__control::after'))
		expect(rule.slice(0, rule.indexOf('}'))).toContain('inset: 0')
	})

	it('gives the pointer and the keyboard the same rows', () => {
		const { container } = renderPage()
		const controls = Array.from(
			container.querySelectorAll('button.publicodes-row__control'),
		)
		expect(controls.length).toBeGreaterThan(0)
		for (const control of controls) {
			expect(control.closest('.publicodes-row--unfoldable')).not.toBeNull()
		}
		// and some rows open nothing, so they stay plain text
		const rows = Array.from(container.querySelectorAll('.publicodes-row'))
		expect(
			rows.some(
				(row) => !row.classList.contains('publicodes-row--unfoldable'),
			),
		).toBe(true)
	})

	it('unfolds as one block: the row and its detail', () => {
		const { container } = openFirstSheet()
		const block = container.querySelector('.publicodes-block')
		expect(block).not.toBeNull()
		// the block covers the line that opened and the detail it opened
		expect(block?.querySelector('.publicodes-row')).not.toBeNull()
		expect(block?.querySelector('.publicodes-detail')).not.toBeNull()
	})

	it('is no block at all until it opens', () => {
		// a line that opens nothing is a plain row: a host styles lines and sheets, and
		// never has to think about a block that draws nothing
		const { container } = renderPage()
		expect(container.querySelector('.publicodes-block')).toBeNull()
		expect(container.querySelectorAll('.publicodes-row').length).toBeGreaterThan(0)
	})

	it('leaves going elsewhere to the host: a row only unfolds', () => {
		const rendered = render(
			<AutodocButtonNavigationContext.Provider
				value={{ rule: 'total', contextStackId: '', onNavigate: () => {} }}
			>
				<RulePage ast={ast} rule="total" evaluation={{ trace }} context={context} />
			</AutodocButtonNavigationContext.Provider>,
		)
		fireEvent.click(rendered.container.querySelector('button.publicodes-row__control')!)
		const detail = rendered.container.querySelector('.publicodes-detail')
		expect(detail).not.toBeNull()
		expect(detail?.querySelector('a')).toBeNull()
	})

	it('takes the shaded paper for the sheet a row opens', () => {
		// the page is the white surface, so the sheet it reveals is the shaded one
		const { container } = openFirstSheet()
		expect(container.querySelector('.publicodes-block')?.getAttribute('data-paper')).toBe('shade')
	})

	it('closes again from the line that opened it', () => {
		const { container } = openFirstSheet()
		fireEvent.click(container.querySelector('button.publicodes-row__control')!)
		expect(container.querySelector('.publicodes-detail')).toBeNull()
	})
})

describe('a value the model does not compute here', () => {
	const figure = { state: 'value', value: 5000, text: '5 000 €/an' } as const
	const figureOf = (container: HTMLElement) =>
		container.querySelector('.publicodes-value__figure')?.textContent

	it('carries the state, so the figure’s dotted line follows the parameter', () => {
		const { container } = render(<Value value={figure} parameter="fournie" />)
		const value = container.querySelector('.publicodes-value')
		expect(value?.getAttribute('data-parameter')).toBe('fournie')
		expect(container.querySelector('.publicodes-value__label')).toBeNull()
		expect(figureOf(container)).toBe('5 000 €/an')
	})

	it('explains itself on the figure, in one line and with the word paramètre', () => {
		const { container } = render(<Value value={figure} parameter="fournie" />)
		const tooltip = container
			.querySelector('.publicodes-value__figure')
			?.getAttribute('title')
		expect(tooltip).toContain('Paramètre du modèle')
		expect(tooltip).toContain('n’est pas calculée ici')
		expect(tooltip?.split(' ').length).toBeLessThan(12)
	})

	it('says a default can be replaced, and a missing value was never given', () => {
		const { container } = render(<Value value={figure} parameter="par défaut" />)
		expect(
			container.querySelector('.publicodes-value__figure')?.getAttribute('title'),
		).toBe('Paramètre du modèle : valeur par défaut, que vous pouvez remplacer.')
		const missing = render(<Value value={figure} parameter="non renseignée" />)
		expect(
			missing.container
				.querySelector('.publicodes-value__figure')
				?.getAttribute('title'),
		).toBe('Paramètre du modèle : aucune valeur n’a été fournie.')
	})

	it('names the default in front of the figure, outside the figure element', () => {
		const { container } = render(<Value value={figure} parameter="par défaut" />)
		const label = container.querySelector('.publicodes-value__label')
		expect(label?.textContent).toBe('par défaut')
		expect(container.querySelector('.publicodes-value__figure')?.contains(label)).toBe(
			false,
		)
	})
})

describe('a mechanism no row can write out', () => {
	const variations = {
		value_mechanism: {
			kind: 'variations', id: 'v', type: 'number', unit: '€', position,
			parameters: {
				conditions: [
					{
						if: expr('e-if', constant('c-if', 1)),
						then: expr('e-then', constant('c-then', 6)),
					},
				],
				else: expr('e-else', constant('c-else', 6)),
			},
		},
		chained_mechanisms: [],
	}
	const inlineAst = {
		total: {
			title: 'Total', type: 'number', unit: '€', id: 's', position,
			referenced_by: [], parameters: [],
			value_mechanism: {
				kind: 'sum', id: 's', type: 'number', unit: '€', position,
				parameters: [expr('e-4', constant('c-4', 4)), variations],
			},
			chained_mechanisms: [],
		},
	} as unknown as PublicodeAST

	const inlineTrace = Object.fromEntries(
		['s', 'e-4', 'c-4', 'v', 'e-if', 'c-if', 'e-then', 'c-then', 'e-else', 'c-else'].map(
			(id) => [id, { '': id === 's' ? 10 : 6 }],
		),
	) as unknown as Trace

	it('names it in the row, since no operator stands for it', () => {
		const { container } = render(
			<RulePage ast={inlineAst} rule="total" evaluation={{ trace: inlineTrace }} />,
		)
		const label = container.querySelector('.publicodes-row__term .publicodes-row__label')
		expect(label?.textContent).toBe('variations')
	})
})

describe('a fiche that would open onto nothing else', () => {
	// `part` computes one term that had no effect: opened and folded, its paper
	// would be empty, so its terms are shown instead
	const inertAst = {
		total: {
			title: 'Total', type: 'number', unit: '€', id: 's', position,
			referenced_by: [], parameters: [],
			value_mechanism: {
				kind: 'sum', id: 's', type: 'number', unit: '€', position,
				parameters: [expr('e-1', ref('r-1', 'part'))],
			},
			chained_mechanisms: [],
		},
		part: {
			title: 'Part', type: 'number', unit: '€', id: 'n', position,
			referenced_by: ['total'], parameters: [],
			value_mechanism: {
				kind: 'sum', id: 'n', type: 'number', unit: '€', position,
				parameters: [expr('e-0', constant('c-0', 0))],
			},
			chained_mechanisms: [],
		},
	} as unknown as PublicodeAST
	const inertTrace = Object.fromEntries(
		['s', 'e-1', 'r-1', 'n', 'e-0', 'c-0'].map((id) => [id, { '': 0 }]),
	) as unknown as Trace

	it('shows the terms that had no effect, rather than an empty paper', () => {
		// the page's own computation prints a single line, so it comes opened
		const { container } = render(
			<RulePage ast={inertAst} rule="total" evaluation={{ trace: inertTrace }} />,
		)
		const block = container.querySelector('.publicodes-block')
		expect(block).not.toBeNull()
		expect(block?.querySelector('.publicodes-row--inert')).not.toBeNull()
	})

	it('says so when the reader hides the last term of a sheet', () => {
		const { container } = render(
			<RulePage ast={inertAst} rule="total" evaluation={{ trace: inertTrace }} />,
		)
		// the fold of the fiche, not the one on the page's own line
		fireEvent.click(container.querySelector('.publicodes-block .publicodes-fold')!)
		expect(container.querySelector('.publicodes-detail__note')?.textContent).toBe(
			'Aucun terme à montrer.',
		)
		// the control that hid them is still on the line, so they can be asked for again
		expect(container.querySelector('.publicodes-block .publicodes-fold')).not.toBeNull()
	})
})

describe('a fiche that prints a single line', () => {
	const sum = (id: string, parameters: unknown[]) => ({
		kind: 'sum',
		id,
		type: 'number',
		unit: '€',
		position,
		parameters,
	})
	// `enveloppe` prints one line, `Pot`, whose fiche prints one line too, `Total`,
	// whose fiche prints two: the chain stops where the reader has something to choose
	const chainedAst = {
		...ast,
		enveloppe: {
			title: 'Enveloppe', type: 'number', unit: '€', id: 's-3', position,
			referenced_by: [], parameters: [],
			value_mechanism: sum('s-3', [expr('e-3', ref('r-3', 'pot'))]),
			chained_mechanisms: [],
		},
		pot: {
			title: 'Pot', type: 'number', unit: '€', id: 's-2', position,
			referenced_by: ['enveloppe'], parameters: [],
			value_mechanism: sum('s-2', [expr('e-2', ref('r-2', 'total'))]),
			chained_mechanisms: [],
		},
	} as unknown as PublicodeAST
	const chainedTrace = {
		...trace,
		's-3': { '': 15 },
		'e-3': { '': 15 },
		'r-3': { '': 15 },
		's-2': { '': 15 },
		'e-2': { '': 15 },
		'r-2': { '': 15 },
	} as unknown as Trace
	const renderPage = () =>
		render(
			<RulePage
				ast={chainedAst}
				rule="enveloppe"
				evaluation={{ trace: chainedTrace }}
				context={context}
			/>,
		)
	const lines = (container: HTMLElement) =>
		Array.from(container.querySelectorAll('button.publicodes-row__control'))

	it('opens the line it prints, without the reader asking', () => {
		// the page's computation prints `Pot` alone, so the page opens its chain
		const { container } = renderPage()
		const sheets = container.querySelectorAll('.publicodes-detail')
		expect(sheets.length).toBe(2)
		expect(sheets[1].textContent).toContain('Part')
	})

	it('leaves that line a control, which closes it again on its own', () => {
		const { container } = renderPage()
		expect(lines(container)[1].getAttribute('aria-expanded')).toBe('true')
		fireEvent.click(lines(container)[1])
		expect(lines(container)[1].getAttribute('aria-expanded')).toBe('false')
		expect(container.querySelectorAll('.publicodes-detail').length).toBe(1)
	})
})

describe('the sheet a `contexte` opens', () => {
	// `honoraire` vaut `base` sous un contexte qui donne `taux` : l'engine trace la
	// référence interne sous la pile du mécanisme, et ce qu'il lie à la pile appelante
	const contextAst = {
		honoraire: {
			type: 'number',
			unit: '€',
			id: 's9',
			position,
			title: 'Honoraire',
			referenced_by: [],
			parameters: [],
			value_mechanism: {
				kind: 'value',
				id: 'v9',
				type: 'number',
				unit: '€',
				position,
				parameters: expr('e9', ref('r9', 'base')),
			},
			chained_mechanisms: [
				{
					kind: 'context',
					id: 'ctx1',
					type: 'number',
					unit: '€',
					position,
					parameters: { taux: expr('e10', constant('c10', 20)) },
				},
			],
		},
		base: {
			type: 'number',
			unit: '€',
			id: 'n9',
			position,
			title: 'Base',
			referenced_by: ['honoraire'],
			parameters: [],
			value_mechanism: { kind: 'not_defined', id: 'n9', type: 'number', unit: '€', position },
			chained_mechanisms: [],
		},
		taux: {
			type: 'number',
			unit: '%',
			id: 'n10',
			position,
			title: 'Taux',
			referenced_by: ['honoraire'],
			parameters: [],
			value_mechanism: { kind: 'not_defined', id: 'n10', type: 'number', unit: '%', position },
			chained_mechanisms: [],
		},
	} as unknown as PublicodeAST

	const contextTrace = {
		ctx1: { '': 40 },
		e9: { '-ctx1': 40 },
		r9: { '-ctx1': 40 },
		e10: { '': 20 },
		c10: { '': 20 },
	} as unknown as Trace

	const renderContextPage = () =>
		render(<RulePage ast={contextAst} rule="honoraire" evaluation={{ trace: contextTrace }} />)

	/** La table du contexte : la seule du calcul. */
	const contextTable = (container: HTMLElement): Element | null =>
		container.querySelector('.publicodes-context')

	it('reads its word on the header line, with the columns it opens', () => {
		const { container } = renderContextPage()
		const head = contextTable(container)?.querySelector('tr')
		expect(
			Array.from(head?.querySelectorAll('th, td') ?? []).map(
				(cell) => cell.textContent,
			),
		).toEqual(['contexte', 'Paramètre', 'Valeur'])
	})

	it('prints the values it binds without being asked, and carries no control', () => {
		const { container } = renderContextPage()
		expect(contextTable(container)?.textContent).toContain('Taux')
		expect(contextTable(container)?.textContent).toContain('20 %')
		expect(contextTable(container)?.querySelector('button')).toBeNull()
	})

	it('keeps the stack of the context in the navigations it offers', () => {
		const onNavigate = vi.fn()
		const publicBase = {
			...contextAst,
			base: { ...contextAst.base, public: true },
		} as unknown as PublicodeAST
		const { container } = render(
			<AutodocButtonNavigationContext.Provider
				value={{ rule: 'honoraire', contextStackId: '', onNavigate }}
			>
				<RulePage
					ast={publicBase}
					rule="honoraire"
					evaluation={{ trace: contextTrace }}
				/>
			</AutodocButtonNavigationContext.Provider>,
		)
		fireEvent.click(container.querySelector('button.publicodes-row__control')!)
		fireEvent.click(container.querySelector('.publicodes-page-link')!)
		expect(onNavigate).toHaveBeenCalledWith('base', '-ctx1')
	})
})

describe('the first annotation of a value', () => {
	// `total` ne change pas : on lui ajoute un arrondi, qui suit ses termes
	const annotatedAst = {
		...ast,
		total: {
			...ast.total,
			chained_mechanisms: [
				{
					kind: 'round_nearest',
					id: 'arrondi1',
					type: 'number',
					unit: '€',
					position,
					parameters: expr('e5', constant('c4', 2)),
				},
			],
		},
	} as unknown as PublicodeAST
	const annotatedTrace = {
		...trace,
		e5: { '': 2 },
		c4: { '': 2 },
	} as unknown as Trace

	it('is separated from the terms of the expression', () => {
		const { container } = render(
			<RulePage
				ast={annotatedAst}
				rule="total"
				evaluation={{ trace: annotatedTrace }}
				context={context}
			/>,
		)
		const annotations = container.querySelectorAll('.publicodes-row--first-modifier')
		expect(annotations.length).toBe(1)
		expect(
			annotations[0]
				.querySelector('.publicodes-row__gutter')
				?.textContent,
		).toBe('arrondi')
	})

	it('carries no filet when the sheet opens on one: there is nothing to separate', () => {
		// `forfait` ne porte qu'un `par défaut`
		const { container } = render(
			<RulePage ast={ast} rule="forfait" evaluation={{ trace }} context={context} />,
		)
		expect(container.querySelector('.publicodes-row--first-modifier')).toBeNull()
	})
})
