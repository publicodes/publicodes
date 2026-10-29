import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { RulePageState } from './useRulePage'
import { useRulePage } from './useRulePage'
import { RulePage } from './blocks/RulePage'
import { RuleIndex } from './blocks/RuleIndex'
import { useContextStack, useButtonNavigation } from './navigation'
import { Autodoc, type AutodocLinkProps } from './components/AutodocContext'
import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import { createPathNavigation } from '@publicodes/autodoc-core'
import type { Trace } from '@publicodes/autodoc-core'

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

afterEach(cleanup)

const position = {
	file: 'test.publicodes',
	start: { index: 0, line: 1, column: 1 },
	end: { index: 1, line: 1, column: 2 },
}

/** Deux règles suffisent : un résultat qui vaut 15, et un paramètre sans calcul. */
const ast = {
	total: {
		type: 'number',
		unit: '€',
		id: 't1',
		position,
		title: 'Total',
		parameters: ['part'],
		value_mechanism: {
			kind: 'expr',
			id: 't1',
			type: 'number',
			unit: '€',
			position,
			parameters: {
				kind: 'constant',
				id: 'c1',
				type: 'number',
				unit: '€',
				position,
				parameters: { kind: 'const_number', value: 15, unit: '€' },
			},
		},
		chained_mechanisms: [],
	},
	part: {
		type: 'number',
		unit: '€',
		id: 'p1',
		position,
		title: 'Part',
		public: true,
		parameters: [],
		value_mechanism: {
			kind: 'not_defined',
			id: 'p1',
			type: 'number',
			unit: '€',
			position,
		},
		chained_mechanisms: [],
	},
} as unknown as PublicodeAST

const trace = { c1: { '': 15 } } satisfies Trace

// un module dont l'évaluation rend la trace écrite ici : ce fichier éprouve le seam, pas
// le compilateur
const module = {
	default: {
		total: { evaluate: () => ({ trace, needed: [], missing: [], value: 15 }) },
	},
	outputs: { total: {} },
	parameters: { part: {} },
}

const Probe = ({ onState }: { onState: (state: RulePageState) => void }) => {
	onState(useRulePage({ module, ast, rule: 'total' }))
	return null
}

const renderState = (onState: (state: RulePageState) => void = () => {}) =>
	render(<Probe onState={onState} />)

describe('useRulePage', () => {
	it('evaluates the rule from the module, and projects it', () => {
		let state: RulePageState | undefined
		renderState((given) => (state = given))
		expect(state?.rule.address).toBe('total')
		expect(state?.rule.equation?.result.text).toBe('15 €')
	})

	it('lists the results that need the rule, and none for a result', () => {
		let state: RulePageState | undefined
		renderState((given) => (state = given))
		expect(state?.usage).toEqual([])
	})

	it('keeps the reader s own choices in the page context', () => {
		let state: RulePageState | undefined
		renderState((given) => (state = given))
		expect(state?.page.stack).toBe('')
		expect(typeof state?.page.toggleRow).toBe('function')
	})
})

describe('the page under a contexte stack', () => {
	// le module note la règle qu'on lui demande : une page qui se trompe de propriétaire
	// de pile se voit tout de suite
	const evaluated: string[] = []
	const recording = (name: string, value: number) => ({
		evaluate: () => {
			evaluated.push(name)
			return {
				trace: { c1: { '': value } },
				needed: [],
				missing: [],
				value,
			}
		},
	})
	const contextual = {
		default: {
			total: recording('total', 15),
			exemple: recording('exemple', 30),
		},
		outputs: {},
		parameters: {},
	}
	// le `contexte` vit dans une autre règle : c'est elle qui doit être évaluée
	const withContext = {
		...ast,
		exemple: {
			...ast.total,
			id: 'e1',
			title: 'Exemple',
			chained_mechanisms: [
				{
					kind: 'context',
					id: 'ctx',
					type: 'number',
					unit: '€',
					position,
					parameters: {},
				},
			],
		},
	} as unknown as PublicodeAST
	const Probe = ({ stack }: { stack: string }) => {
		useRulePage({
			module: contextual,
			ast: withContext,
			rule: 'total',
			context: {},
			stack,
		})
		return null
	}

	it('takes its trace from the rule that opened the stack', () => {
		evaluated.length = 0
		render(<Probe stack="-ctx" />)
		// la seconde évaluation n'apporte que les paramètres dont la page a eu besoin
		expect(evaluated[0]).toBe('exemple')
	})

	it('evaluates the page rule when no stack is named', () => {
		evaluated.length = 0
		render(<Probe stack="" />)
		expect(evaluated).toEqual(['total'])
	})

	it('reads the model’s own values under a stack no rule owns', () => {
		evaluated.length = 0
		const Seen = () => {
			const { rule } = useRulePage({
				module: contextual,
				ast: withContext,
				rule: 'total',
				context: {},
				stack: '-périmé',
			})
			return <p>{rule.equation?.result.text ?? 'aucune valeur'}</p>
		}
		render(<Seen />)
		expect(evaluated).toEqual(['total'])
		expect(screen.getByText('15 €')).toBeTruthy()
	})
})

describe('RulePage', () => {
	it('takes the model, the AST and the rule, and nothing else to be a page', () => {
		render(<RulePage module={module} ast={ast} rule="total" />)
		expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Total')
	})

	it('carries the stack of the page it was given', () => {
		const seen: string[] = []
		const Capture = () => {
			const { page } = useRulePage({
				module,
				ast,
				rule: 'total',
				stack: '-ctx',
			})
			seen.push(page.stack)
			return null
		}
		render(<Capture />)
		expect(seen).toContain('-ctx')
	})
})

describe('the host’s navigation modes', () => {
	const Index = () => <RuleIndex module={module} />
	const indexPaths = createPathNavigation({
		outputs: module.outputs,
		parameters: module.parameters,
		basePath: '/doc',
	})
	const ProbeStack = () => <p>{useContextStack() || 'aucune'}</p>

	it('writes paths of its own, under a prefix', () => {
		render(
			<Autodoc Link={linkTo((rule) => `/doc/${rule}`)}>
				<Index />
			</Autodoc>,
		)
		expect(
			screen.getAllByRole('link').map((link) => link.getAttribute('href')),
		).toEqual(['/doc/total', '/doc/part'])
	})

	it('lets the host own the URL scheme', () => {
		render(
			<Autodoc Link={linkTo((rule, stack) => `#/doc/${rule}?ctx=${stack}`)}>
				<Index />
			</Autodoc>,
		)
		expect(
			screen.getAllByRole('link').map((link) => link.getAttribute('href')),
		).toEqual(['#/doc/total?ctx=', '#/doc/part?ctx='])
	})

	it('renders the host’s own link', () => {
		render(
			<Autodoc
				Link={({ rule, className, children }) => (
					<a className={className} href={`/x/${rule}`} data-host="1">
						{children}
					</a>
				)}
			>
				<Index />
			</Autodoc>,
		)
		expect(
			screen.getAllByRole('link').map((link) => link.getAttribute('data-host')),
		).toEqual(['1', '1'])
	})

	it('navigates in place when the host keeps the rule in its own state', () => {
		render(
			<Autodoc Link={buttonTo(() => {})}>
				<Index />
			</Autodoc>,
		)
		expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
			'Total',
			'Part',
		])
	})

	it('reads the stack a URL carries', () => {
		window.history.replaceState(null, '', '/doc/a?ctx=-ctx')
		const links = { Link: linkTo(indexPaths.href) }
		render(
			<Autodoc {...links}>
				<ProbeStack />
			</Autodoc>,
		)
		expect(screen.getByText('-ctx')).toBeTruthy()
	})

	it('reads the stack the host says it keeps elsewhere', () => {
		render(
			<Autodoc Link={linkTo(indexPaths.href)} stackFrom={() => '-état'}>
				<ProbeStack />
			</Autodoc>,
		)
		expect(screen.getByText('-état')).toBeTruthy()
	})

	it('navigates to another rule, keeping the stack, when the host holds it', () => {
		const Navigate = () => {
			const { Link, rule, stack } = useButtonNavigation('total')
			return (
				<Autodoc Link={Link}>
					<Link rule="part" stack="-ctx">
						{`${rule}|${stack}`}
					</Link>
				</Autodoc>
			)
		}
		render(<Navigate />)
		expect(screen.getByRole('button').textContent).toBe('total|')
		fireEvent.click(screen.getByRole('button'))
		expect(screen.getByRole('button').textContent).toBe('part|-ctx')
	})

	it('renders plain text when the host offers no navigation at all', () => {
		render(<Index />)
		expect(screen.queryByRole('link')).toBeNull()
		expect(screen.getByText('Total')).toBeTruthy()
	})
})
