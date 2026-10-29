/** La page telle qu'elle se rend : ses blocs, ses lignes, ses contrôles et ses liens. */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import type { CompiledRules, Trace, TraceValue } from '@publicodes/autodoc-core'
import { Autodoc, type AutodocLinkProps } from '../components/AutodocContext'
import { RuleIndex } from '../blocks/RuleIndex'
import { RulePage, type RulePageProps } from '../blocks/RulePage'
import { Value } from '../blocks/Value'

/** Un hôte qui écrit ses liens : ancre, ou bouton qui garde la règle dans son état. */
const linkTo =
	(href: (rule: string, stack: string) => string) =>
	({ rule, stack, className, children }: AutodocLinkProps) => (
		<a className={className} href={href(rule, stack)}>
			{children}
		</a>
	)

const buttonTo =
	(onNavigate: (rule: string, stack: string) => void) =>
	({ rule, stack, className, children }: AutodocLinkProps) => (
		<button
			type="button"
			className={className}
			onClick={() => onNavigate(rule, stack)}
		>
			{children}
		</button>
	)

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
		value_mechanism: {
			kind: 'not_defined',
			id: 'n1',
			type: 'number',
			unit: '€',
			position,
		},
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
		value_mechanism: {
			kind: 'not_defined',
			id: 'n2',
			type: 'number',
			unit: '€',
			position,
		},
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
} satisfies Trace

/** Un module compilé qui n'évalue rien : les tests passent leur propre trace. */
const EMPTY_MODULE = { default: {}, outputs: {}, parameters: {} }

/** La page, avec le module vide : ce fichier n'éprouve pas l'évaluation du modèle. */
type PageProps = Omit<RulePageProps, 'module'> & {
	module?: RulePageProps['module']
}

const Page = ({ module = EMPTY_MODULE, ...props }: PageProps) => (
	<RulePage module={module} {...props} />
)

/** Un module dont l'API déclarée est celle d'un modèle de test. */
const moduleWith = (outputs: CompiledRules) => ({
	default: {},
	outputs,
	parameters: {},
})

/** Le calcul de la page, à part des autres blocs — le contexte a ses propres fiches. */
const computation = (container: HTMLElement) =>
	container.querySelector('.publicodes-rule-computation') as HTMLElement

const renderPage = () =>
	render(
		<Page ast={ast} rule="total" evaluation={{ trace }} context={context} />,
	)

describe('the page of an opened rule', () => {
	it('laisse un signe nu, et n’habille que les mots', () => {
		const { container } = renderPage()
		// un signe ne porte pas le voile d'une pastille : il marque, il ne dit rien du langage
		const signes = Array.from(
			container.querySelectorAll('.publicodes-row__label--sign'),
		)
		expect(signes.length).toBeGreaterThan(0)
		for (const signe of signes)
			expect(['+', '−', '×', '/']).toContain(signe.textContent)
		// et il n'est jamais les deux à la fois
		expect(
			container.querySelector(
				'.publicodes-row__label--sign.publicodes-row__label--word',
			),
		).toBeNull()
	})

	// `part` is a parameter the API exposes, so it has a page of its own
	const publicAst = {
		...ast,
		part: { ...ast.part, public: true },
	} as unknown as PublicodeAST
	const openFirstRow = (ast_ = publicAst, onNavigate = () => {}) => {
		const rendered = render(
			<Autodoc Link={buttonTo(onNavigate)}>
				<Page
					ast={ast_}
					rule="total"
					evaluation={{ trace }}
					context={context}
				/>
			</Autodoc>,
		)
		fireEvent.click(
			rendered.container.querySelector('button.publicodes-row__control')!,
		)
		return rendered
	}

	it('offers the way there beside the name, whether the row is open or not', () => {
		const rendered = render(
			<Autodoc Link={buttonTo(() => {})}>
				<Page
					ast={publicAst}
					rule="total"
					evaluation={{ trace }}
					context={context}
				/>
			</Autodoc>,
		)
		const link = () => rendered.container.querySelector('.publicodes-page-link')
		expect(link()).not.toBeNull()
		expect(link()?.textContent).toBe('Ouvrir la page de Part')
		fireEvent.click(
			rendered.container.querySelector('button.publicodes-row__control')!,
		)
		expect(link()).not.toBeNull()
	})

	it('goes where the host says, naming the rule', () => {
		const onNavigate = vi.fn()
		const { container } = openFirstRow(publicAst, onNavigate)
		fireEvent.click(container.querySelector('.publicodes-page-link')!)
		expect(onNavigate).toHaveBeenCalledWith('part', '')
	})

	it('stays bare without a navigation to offer', () => {
		const rendered = render(
			<Page
				ast={publicAst}
				rule="total"
				evaluation={{ trace }}
				context={context}
			/>,
		)
		fireEvent.click(
			rendered.container.querySelector('button.publicodes-row__control')!,
		)
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
		expect(
			container.querySelector('.publicodes-row--head .publicodes-value')
				?.textContent,
		).toBe('15 €')
		expect(container.textContent?.split('15 €').length).toBe(2)
	})

	it('says the name and the address, and nothing about the model’s API', () => {
		// `public` est la déclaration de l'auteur, que la vue porte pour un hôte ; un lecteur qui
		// a la page sous les yeux n'a pas besoin qu'on lui dise qu'elle existe
		const { container } = renderPage()
		const header = container.querySelector('.publicodes-rule-header')
		expect(header?.querySelector('h1')?.textContent).toBe('Total')
		expect(header?.querySelector('.publicodes-address')?.textContent).toBe(
			'total',
		)
		expect(header?.textContent).toBe('Totaltotal')
	})
})

describe('terms that had no effect', () => {
	it('holds them back behind a control that counts them', () => {
		const { container } = renderPage()
		const fold = computation(container).querySelector('.publicodes-fold')
		expect(fold?.getAttribute('aria-label')).toBe('Afficher 1 terme sans effet')
		expect(fold?.querySelector('.publicodes-fold__count')?.textContent).toBe(
			'1',
		)
		// la ligne retenue est dans le document, fermée : c'est ce qui la rend animable
		expect(
			computation(container).querySelectorAll('.publicodes-row--folded').length,
		).toBe(1)
		expect(container.querySelector('.publicodes-row--inert')).not.toBeNull()
		expect(
			computation(container).querySelectorAll('.publicodes-row').length,
		).toBe(4)
	})

	it('shows them again when asked', () => {
		const { container } = renderPage()
		fireEvent.click(computation(container).querySelector('.publicodes-fold')!)
		expect(
			computation(container).querySelectorAll('.publicodes-row--folded').length,
		).toBe(0)
		expect(container.querySelectorAll('.publicodes-row--inert').length).toBe(1)
		expect(
			computation(container).querySelector('.publicodes-fold__count'),
		).toBeNull()
	})

	it('keeps the row it sits on open: the two gestures are not the same', () => {
		const { container } = renderPage()
		fireEvent.click(container.querySelector('button.publicodes-row__control')!)
		fireEvent.click(computation(container).querySelector('.publicodes-fold')!)
		// the fiche is still unfolded, and the terms came out
		expect(container.querySelector('.publicodes-block')).not.toBeNull()
		expect(container.querySelectorAll('.publicodes-row--inert').length).toBe(1)
	})
})

describe('a page nobody evaluated', () => {
	it('marks nothing and holds nothing back', () => {
		// rien n'a rien fait ni rien subi : aucune ligne n'est éteinte, rien n'est retenu
		const { container } = render(
			<Page ast={ast} rule="total" context={context} />,
		)
		expect(container.querySelectorAll('.publicodes-row--inert').length).toBe(0)
		expect(container.querySelectorAll('.publicodes-fold').length).toBe(0)
	})
})

describe('unfolding a reference', () => {
	const openFirstSheet = () => {
		const rendered = renderPage()
		fireEvent.click(
			rendered.container.querySelector('button.publicodes-row__control')!,
		)
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
		// le chemin se lit depuis la racine du paquet, où vitest lance la suite
		const css = readFileSync(
			resolve(process.cwd(), '../autodoc-core/src/styles/autodoc.css'),
			'utf8',
		)
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
			rows.some((row) => !row.classList.contains('publicodes-row--unfoldable')),
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

	it('draws nothing under a line that opens nothing', () => {
		// le groupe d'une ligne est toujours là — c'est lui qui porte les colonnes du calcul —
		// mais seul un groupe qui ouvre une fiche a un papier, un pied et une fiche à dessiner
		const { container } = renderPage()
		const calcul = computation(container)
		const groupes = Array.from(calcul.querySelectorAll('.publicodes-block'))
		expect(groupes.length).toBeGreaterThan(0)
		expect(calcul.querySelector('.publicodes-block[data-sheet]')).toBeNull()
		expect(calcul.querySelectorAll('.publicodes-detail')).toHaveLength(0)
		expect(calcul.querySelectorAll('.publicodes-row').length).toBeGreaterThan(0)
	})

	it('leaves going elsewhere to the host: a row only unfolds', () => {
		const rendered = render(
			<Autodoc Link={buttonTo(() => {})}>
				<Page ast={ast} rule="total" evaluation={{ trace }} context={context} />
			</Autodoc>,
		)
		fireEvent.click(
			rendered.container.querySelector('button.publicodes-row__control')!,
		)
		const detail = rendered.container.querySelector('.publicodes-detail')
		expect(detail).not.toBeNull()
		expect(detail?.querySelector('a')).toBeNull()
	})

	it('marks the group a row opens as a sheet, and no other', () => {
		const { container } = openFirstSheet()
		expect(
			computation(container).querySelectorAll('.publicodes-block[data-sheet]'),
		).toHaveLength(1)
	})

	it('keeps a computation sheet at its own cran, with no table mark', () => {
		const { container } = openFirstSheet()
		const fiche = container.querySelector('.publicodes-detail')
		expect(fiche).not.toBeNull()
		expect(fiche?.hasAttribute('data-table')).toBe(false)
	})

	it('closes again from the line that opened it, after folding', async () => {
		const { container } = openFirstSheet()
		fireEvent.click(container.querySelector('button.publicodes-row__control')!)
		// la fiche reste montée pendant son repli : c'est ce qui permet au style de l'animer
		const folding = computation(container).querySelector('.publicodes-detail')
		expect(folding).not.toBeNull()
		expect(folding?.getAttribute('data-open')).toBe('false')
		await waitFor(() =>
			expect(
				computation(container).querySelector('.publicodes-detail'),
			).toBeNull(),
		)
	})
})

describe('a value the model does not compute here', () => {
	const figure = { state: 'value', value: 5000, text: '5 000 €/an' } as const

	it('prints its figure and nothing else: no mark belongs to the value', () => {
		const { container } = render(<Value value={figure} />)
		const value = container.querySelector('.publicodes-value')
		expect(value?.getAttribute('data-parameter')).toBeNull()
		expect(container.querySelector('.publicodes-value__label')).toBeNull()
		expect(value?.getAttribute('title')).toBeNull()
		expect(
			container.querySelector('.publicodes-value__figure')?.textContent,
		).toBe('5 000 €/an')
	})

	it('prints the word of an absence in its place', () => {
		const { container } = render(
			<Value
				value={{ state: 'not_defined', value: null, text: 'non renseignée' }}
			/>,
		)
		expect(container.querySelector('.publicodes-absence')?.textContent).toBe(
			'non renseignée',
		)
	})
})

describe('a mechanism no row can write out', () => {
	const variations = {
		value_mechanism: {
			kind: 'variations',
			id: 'v',
			type: 'number',
			unit: '€',
			position,
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
			title: 'Total',
			type: 'number',
			unit: '€',
			id: 's',
			position,
			referenced_by: [],
			parameters: [],
			value_mechanism: {
				kind: 'sum',
				id: 's',
				type: 'number',
				unit: '€',
				position,
				parameters: [expr('e-4', constant('c-4', 4)), variations],
			},
			chained_mechanisms: [],
		},
	} as unknown as PublicodeAST

	const inlineTrace = Object.fromEntries(
		[
			's',
			'e-4',
			'c-4',
			'v',
			'e-if',
			'c-if',
			'e-then',
			'c-then',
			'e-else',
			'c-else',
		].map((id) => [id, { '': id === 's' ? 10 : 6 }]),
	) as Trace

	it('names it in the row, since no operator stands for it', () => {
		const { container } = render(
			<Page ast={inlineAst} rule="total" evaluation={{ trace: inlineTrace }} />,
		)
		const label = container.querySelector(
			'.publicodes-row__term .publicodes-row__label',
		)
		expect(label?.textContent).toBe('variations')
	})
})

describe('a fiche that would open onto nothing else', () => {
	// `part` computes one term that had no effect: opened and folded, its paper
	// would be empty, so its terms are shown instead
	const inertAst = {
		total: {
			title: 'Total',
			type: 'number',
			unit: '€',
			id: 's',
			position,
			referenced_by: [],
			parameters: [],
			value_mechanism: {
				kind: 'sum',
				id: 's',
				type: 'number',
				unit: '€',
				position,
				parameters: [expr('e-1', ref('r-1', 'part'))],
			},
			chained_mechanisms: [],
		},
		part: {
			title: 'Part',
			type: 'number',
			unit: '€',
			id: 'n',
			position,
			referenced_by: ['total'],
			parameters: [],
			value_mechanism: {
				kind: 'sum',
				id: 'n',
				type: 'number',
				unit: '€',
				position,
				parameters: [expr('e-0', constant('c-0', 0))],
			},
			chained_mechanisms: [],
		},
	} as unknown as PublicodeAST
	const inertTrace = Object.fromEntries(
		['s', 'e-1', 'r-1', 'n', 'e-0', 'c-0'].map((id) => [id, { '': 0 }]),
	) as Trace

	it('shows the terms that had no effect, rather than an empty paper', () => {
		// the page's own computation prints a single line, so it comes opened
		const { container } = render(
			<Page ast={inertAst} rule="total" evaluation={{ trace: inertTrace }} />,
		)
		const block = container.querySelector('.publicodes-block')
		expect(block).not.toBeNull()
		expect(block?.querySelector('.publicodes-row--inert')).not.toBeNull()
	})

	it('writes nothing when the reader hides the last term of a sheet', () => {
		const { container } = render(
			<Page ast={inertAst} rule="total" evaluation={{ trace: inertTrace }} />,
		)
		// the fold of the fiche, not the one on the page's own line
		fireEvent.click(
			container.querySelector('.publicodes-block .publicodes-fold')!,
		)
		// une feuille vidée par le lecteur se tait : elle ne lui apprend rien
		expect(container.querySelector('.publicodes-detail__note')).toBeNull()
		// the control that hid them is still on the line, so they can be asked for again
		expect(
			container.querySelector('.publicodes-block .publicodes-fold'),
		).not.toBeNull()
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
			title: 'Enveloppe',
			type: 'number',
			unit: '€',
			id: 's-3',
			position,
			referenced_by: [],
			parameters: [],
			value_mechanism: sum('s-3', [expr('e-3', ref('r-3', 'pot'))]),
			chained_mechanisms: [],
		},
		pot: {
			title: 'Pot',
			type: 'number',
			unit: '€',
			id: 's-2',
			position,
			referenced_by: ['enveloppe'],
			parameters: [],
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
	} satisfies Trace
	const renderPage = () =>
		render(
			<Page
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

	it('leaves that line a control, which closes it again on its own', async () => {
		const { container } = renderPage()
		expect(lines(container)[1].getAttribute('aria-expanded')).toBe('true')
		fireEvent.click(lines(container)[1])
		expect(lines(container)[1].getAttribute('aria-expanded')).toBe('false')
		// deux fiches le temps du repli, une seule une fois le pli fini
		expect(container.querySelectorAll('.publicodes-detail').length).toBe(2)
		await waitFor(() =>
			expect(container.querySelectorAll('.publicodes-detail').length).toBe(1),
		)
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
					parameters: {
						taux: expr('e10', constant('c10', 20)),
						forfait: expr('e11', ref('r11', 'base')),
					},
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
			value_mechanism: {
				kind: 'not_defined',
				id: 'n9',
				type: 'number',
				unit: '€',
				position,
			},
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
			value_mechanism: {
				kind: 'not_defined',
				id: 'n10',
				type: 'number',
				unit: '%',
				position,
			},
			chained_mechanisms: [],
		},
		forfait: {
			type: 'number',
			unit: '€',
			id: 'n11',
			position,
			title: 'Forfait',
			referenced_by: ['honoraire'],
			parameters: [],
			value_mechanism: {
				kind: 'not_defined',
				id: 'n11',
				type: 'number',
				unit: '€',
				position,
			},
			chained_mechanisms: [],
		},
	} as unknown as PublicodeAST

	const contextTrace = {
		ctx1: { '': 40 },
		e9: { '-ctx1': 40 },
		r9: { '-ctx1': 40 },
		e10: { '': 20 },
		c10: { '': 20 },
		e11: { '': 5 },
		r11: { '': 5 },
	} satisfies Trace

	const renderContextPage = () =>
		render(
			<Page
				ast={contextAst}
				rule="honoraire"
				evaluation={{ trace: contextTrace }}
			/>,
		)

	/** Une ligne liée, repérée à son nom : c'est le terme de la ligne. */
	const boundLine = (
		container: HTMLElement,
		name: string,
	): Element | undefined =>
		Array.from(container.querySelectorAll('.publicodes-row')).find(
			(row) => row.querySelector('.publicodes-row__term')?.textContent === name,
		)

	it('names the column it opens, and carries its own word on its line', () => {
		const { container } = renderContextPage()
		// le mot de la colonne est sur la ligne du mécanisme, pas sur une ligne à lui
		expect(container.querySelector('.publicodes-row--header')).toBeNull()
		const mot = Array.from(
			container.querySelectorAll('.publicodes-row__gutter'),
		).find((g) => g.textContent === 'contexte')
		expect(mot).toBeDefined()
		// le mot du mécanisme tient sa propre ligne, dans l'équation de la règle : il n'est
		// plus escamoté au profit de sa fiche, qui l'aurait indenté d'un cran
		const ligne = (mot as Element).closest('.publicodes-row')
		expect(ligne?.className).toContain('publicodes-row--open')
		expect(
			Array.from(
				ligne?.querySelectorAll('.publicodes-row__label--word') ?? [],
			).map((word) => word.textContent),
		).toEqual(['contexte', 'valeur du paramètre'])
		// et la fiche de cette ligne-là se range dans les colonnes de la règle
		expect(ligne?.nextElementSibling?.getAttribute('data-table')).toBe('true')
		// et l'attribut ne s'écrit jamais « false » : React l'écrirait quand même, et un
		// sélecteur de présence emporterait alors toutes les fiches de calcul
		expect(
			container.querySelector('.publicodes-detail[data-table="false"]'),
		).toBeNull()
	})

	it('prints what it binds without being asked, on lines of the computation', () => {
		const { container } = renderContextPage()
		// la feuille est imprimée d'elle-même : il n'y a pas de ligne de mécanisme à ouvrir
		expect(container.querySelector('.publicodes-detail')).not.toBeNull()
		// et ses lignes portent le nom de la règle liée et sa valeur, comme toute ligne
		expect(
			boundLine(container, 'Taux')?.querySelector('.publicodes-value')
				?.textContent,
		).toBe('20 %')
		expect(
			boundLine(container, 'Forfait')?.querySelector('.publicodes-value')
				?.textContent,
		).toBe('5 €')
	})

	it('opens the computation a bound value holds, from the line itself', () => {
		const { container } = renderContextPage()
		// `forfait` lie la référence `base` : sa ligne s'ouvre comme une référence du calcul
		const line = boundLine(container, 'Forfait')
		const control = line?.querySelector('button.publicodes-row__control')
		expect(control).not.toBeNull()
		expect(control?.getAttribute('aria-expanded')).toBe('false')
		fireEvent.click(control!)
		expect(
			line?.parentElement?.querySelector('.publicodes-detail'),
		).not.toBeNull()
	})

	it('offers no control where the binding holds nothing but a constant', () => {
		const { container } = renderContextPage()
		expect(boundLine(container, 'Taux')?.querySelector('button')).toBeNull()
	})

	it('leads to the rule a bound line names', () => {
		const onNavigate = vi.fn()
		const publicBase = {
			...contextAst,
			base: { ...contextAst.base, public: true },
		} as unknown as PublicodeAST
		const { container } = render(
			<Autodoc Link={buttonTo(onNavigate)}>
				<Page
					ast={publicBase}
					rule="honoraire"
					evaluation={{ trace: contextTrace }}
				/>
			</Autodoc>,
		)
		fireEvent.click(container.querySelector('button.publicodes-row__control')!)
		fireEvent.click(container.querySelector('.publicodes-page-link')!)
		expect(onNavigate).toHaveBeenCalledWith('base', '-ctx1')
	})
})

describe('the line a value ends on', () => {
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
	} satisfies Trace
	const renderAnnotated = () =>
		render(
			<Page
				ast={annotatedAst}
				rule="total"
				evaluation={{ trace: annotatedTrace }}
				context={context}
			/>,
		)

	it('is the one just before the chain, and carries the plain filet', () => {
		const { container } = renderAnnotated()
		const rows = Array.from(container.querySelectorAll('.publicodes-row'))
		const marked = rows.findIndex((row) =>
			row.classList.contains('publicodes-row--last-value'),
		)
		const chained = rows.findIndex(
			(row) =>
				row.querySelector('.publicodes-row__gutter')?.textContent === 'arrondi',
		)
		expect(marked).toBeGreaterThanOrEqual(0)
		expect(chained - marked).toBe(1)
	})

	it('est la ligne d’entrée quand rien d’autre n’est imprimé avant la chaîne', () => {
		// `forfait` ne porte qu'un `par défaut` : ce qui entre, puis ce que le défaut en fait
		const { container } = render(
			<Page
				ast={ast}
				rule="forfait"
				evaluation={{ trace }}
				context={context}
			/>,
		)
		const marked = Array.from(
			container.querySelectorAll('.publicodes-row--last-value'),
		)
		expect(marked).toHaveLength(1)
		expect(
			marked[0].querySelector('.publicodes-row__gutter')?.textContent,
		).toBe('paramètre d’entrée')
	})
})

describe('the results a parameter serves', () => {
	const outputs = {
		total: { params: ['part', 'forfait'] },
		forfait: { params: ['part'] },
	}

	it('lists them under a heading of its own, named as the model names them', () => {
		const { container } = render(
			<Page ast={ast} rule="part" module={moduleWith(outputs)} />,
		)
		const block = container.querySelector('.publicodes-rule-usage')
		expect(block?.querySelector('h2')?.textContent).toBe(
			'Utilisé pour le calcul',
		)
		expect(
			Array.from(block!.querySelectorAll('.publicodes-row__term')).map(
				(term) => term.textContent,
			),
		).toEqual(['Total', 'Forfait'])
	})

	it('says nothing on the page of a result: the module lists parameters, never results', () => {
		const { container } = render(
			<Page
				ast={ast}
				rule="total"
				evaluation={{ trace }}
				context={context}
				module={moduleWith(outputs)}
			/>,
		)
		expect(container.querySelector('.publicodes-rule-usage')).toBeNull()
	})

	it('is a parameter’s page: no context block to name what the page is', () => {
		const { container } = render(
			<RulePage
				module={{ default: {}, outputs: {}, parameters: { part: {} } }}
				ast={ast}
				rule="part"
			/>,
		)
		expect(container.querySelector('.publicodes-rule-context')).toBeNull()
	})

	it('has nothing to list without the compiled module', () => {
		const { container } = render(<Page ast={ast} rule="part" />)
		expect(container.querySelector('.publicodes-rule-usage')).toBeNull()
	})

	it('names no context when the page documents the model: there is no computation to read', () => {
		// sans contexte, la page n'a rien calculé : ni bloc de contexte, ni note, ni chiffre
		const { container } = render(<Page ast={ast} rule="total" />)
		expect(container.querySelector('.publicodes-rule-context')).toBeNull()
		expect(container.querySelector('.publicodes-note')).toBeNull()
	})

	it('opens the result’s explanation, not a page: no title line under the row', () => {
		const { container } = render(
			<Page ast={ast} rule="part" module={moduleWith(outputs)} />,
		)
		const block = container.querySelector(
			'.publicodes-rule-usage',
		) as HTMLElement
		fireEvent.click(block.querySelector('button.publicodes-row__control')!)
		const sheet = block.querySelector('.publicodes-detail')
		expect(sheet).not.toBeNull()
		expect(sheet?.querySelector('.publicodes-row--head')).toBeNull()
		expect(sheet?.querySelectorAll('.publicodes-row').length).toBeGreaterThan(0)
	})

	it('leads to their pages by the URL the host writes', () => {
		const { container } = render(
			<Autodoc Link={linkTo((rule) => `/documentation/${rule}`)}>
				<Page ast={ast} rule="part" module={moduleWith(outputs)} />
			</Autodoc>,
		)
		expect(
			Array.from(container.querySelectorAll('.publicodes-rule-usage a')).map(
				(link) => link.getAttribute('href'),
			),
		).toEqual(['/documentation/total', '/documentation/forfait'])
	})
})

describe('the index of the declared API', () => {
	const indexModule = {
		default: {},
		outputs: { 'revenu net': {} },
		parameters: { part: { title: 'La part saisie' } },
	}
	const renderIndex = ({
		current,
		outputs = indexModule.outputs,
		parameters = indexModule.parameters,
		getHref = (rule) => `#/documentation/${rule}`,
	}: {
		current?: string
		outputs?: CompiledRules
		parameters?: CompiledRules
		getHref?: (rule: string) => string
	} = {}) =>
		render(
			<Autodoc Link={linkTo(getHref)}>
				<RuleIndex
					module={{ default: {}, outputs, parameters }}
					current={current}
				/>
			</Autodoc>,
		)

	it('groups the results before the parameters, and names them as the model does', () => {
		const { container } = renderIndex()
		const groups = Array.from(
			container.querySelectorAll('.publicodes-rule-index section'),
		)
		expect(
			groups.map((group) => group.querySelector('h2')?.textContent),
		).toEqual(['Résultats', 'Paramètres'])
		expect(
			Array.from(container.querySelectorAll('.publicodes-rule-index li')).map(
				(item) => item.textContent,
			),
		).toEqual(['Revenu net', 'La part saisie'])
	})

	it('leads to each page by the URL the host writes', () => {
		const { container } = renderIndex({
			getHref: (rule) => `#/doc/${rule}`,
		})
		expect(
			Array.from(container.querySelectorAll('.publicodes-rule-index a')).map(
				(link) => link.getAttribute('href'),
			),
		).toEqual(['#/doc/revenu net', '#/doc/part'])
	})

	it('marks the page the reader is on, and only that one', () => {
		const { container } = renderIndex({ current: 'part' })
		const marked = Array.from(
			container.querySelectorAll('.publicodes-rule-index [aria-current]'),
		)
		expect(marked).toHaveLength(1)
		expect(marked[0].textContent).toBe('La part saisie')
	})

	it('skips a group the model declares nothing in, and prints nothing without an API', () => {
		const { container } = renderIndex({ parameters: {} })
		expect(
			container.querySelectorAll('.publicodes-rule-index section'),
		).toHaveLength(1)

		const empty = renderIndex({ outputs: {}, parameters: {} })
		expect(empty.container.querySelector('.publicodes-rule-index')).toBeNull()
	})
})
