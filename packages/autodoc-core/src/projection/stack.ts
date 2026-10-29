import type * as Ast from '../ast'
import type { ContextStackId, TraceValue } from '../trace'
import {
	contextCrumbs,
	contextOwner,
	type ContextCrumb,
} from '../context-stack'
import {
	BOUND_NOTE,
	CONTEXT_NAME,
	CONTEXT_VALUE,
	contextFoldLabel,
	PARAMETER_NOTES,
} from './copy'
import { projectContext } from './context'
import { displayName } from './names'
import { pageOf } from './pages'
import { isRecord } from '../record'
import type {
	ContextEntryView,
	EquationView,
	Evaluation,
	FoldView,
	LookupCtx,
	OperandView,
	ValueView,
} from './types'
import { ABSENT } from './value'
import { lookupValue, unitOf } from './value'

/** What the block that names the evaluation's context shows. */
export interface ContextBlockView {
	/** Where the reader stands among stacked contexts; the base one comes first. */
	crumbs: ContextCrumb[]
	/**
	 * The context as the computation writes one: the `contexte` line, and what it reads
	 * underneath. The same shape and the same renderer as the sheet a `contexte` mechanism
	 * opens inside a rule's explanation.
	 */
	equation: EquationView
}

/** The parameters a computation did not take from the reader: a default, or nothing. */
const heldBack = (entry: ContextEntryView): boolean =>
	!entry.bound && entry.state !== 'fournie'

/**
 * The context the page is read in: what the stacked contexts bind, then the parameters the
 * computation of this very rule used. A parameter a context binds is listed once, with the
 * value the computation actually read — the reader's own value is then not what was used.
 */
export function projectContextBlock(
	ast: Ast.PublicodeAST,
	rule: string,
	options: {
		evaluation?: Evaluation
		context?: Record<string, TraceValue>
		contextStackId?: ContextStackId
		folds?: Readonly<Record<string, boolean>>
		pages?: ReadonlySet<string>
	} = {},
): ContextBlockView {
	const stack = options.contextStackId ?? ''
	const ctx: LookupCtx = {
		ast,
		trace: options.evaluation?.trace,
		context: options.context,
		contextStackId: stack,
		pages: options.pages,
	}
	const bound = boundByStack(ast, ctx)
	const boundAddresses = new Set(bound.map((entry) => entry.address))
	const all = [
		...bound,
		...projectContext(
			ast[rule],
			ctx,
			options.evaluation?.needed,
			options.evaluation?.missing,
		).filter((entry) => !boundAddresses.has(entry.address)),
	]
	const id = `${rule}#context`
	const expanded = options.folds?.[id] === true
	// une page sans évaluation n'a rien lu : tous ses paramètres sont montrés
	const held = options.evaluation === undefined ? [] : all.filter(heldBack)
	const printed =
		held.length === 0 || expanded ?
			all
		:	all.filter((entry) => !heldBack(entry))
	const fold: FoldView | null =
		held.length === 0 ?
			null
		:	{
				id,
				count: held.length,
				label: contextFoldLabel(held.length, expanded),
				expanded,
			}
	// ce que le pli cache reste dans la feuille : une ligne retirée du document ne peut pas se
	// fermer, et sa disparition remonterait celles qui la suivent
	const rows = all.map((entry) => rowOf(entry, !printed.includes(entry)))
	return {
		crumbs: contextCrumbs(ast, rule, stack),
		equation: {
			keyword: null,
			inlineTerm: null,
			rows: [contextLine(sheetOf(rows), fold)],
			size: 1,
			result: ABSENT,
			fold: null,
			note: null,
			contextId: null,
			depth: 0,
			header: null,
		},
	}
}

/**
 * What the contexts of the stack bind, innermost last: a context read later overrides what
 * an earlier one bound to the same rule.
 */
const boundByStack = (
	ast: Ast.PublicodeAST,
	ctx: LookupCtx,
): ContextEntryView[] => {
	const bound = new Map<string, ContextEntryView>()
	let prefix = ''
	for (const id of (ctx.contextStackId ?? '').split('-').filter(Boolean)) {
		const owner = contextOwner(ast, `-${id}`)
		const mechanism = owner === null ? null : contextMechanism(ast[owner], id)
		for (const [address, value] of Object.entries(
			mechanism?.parameters ?? {},
		)) {
			const target = ast[address]?.value_mechanism ?? value.value_mechanism
			const read: ValueView = lookupValue(
				// les liaisons d'un `contexte` sont écrites chez son appelant, une pile au-dessus
				{ ...ctx, contextStackId: prefix },
				value.value_mechanism.id,
				target.type,
				unitOf(target),
			)
			bound.set(address, {
				name: displayName(ast, address),
				address,
				state: 'fournie',
				bound: true,
				page: pageOf(ctx, address),
				value: read,
			})
		}
		prefix = `${prefix}-${id}`
	}
	return [...bound.values()]
}

/** La ligne du bloc : le mot `contexte`, la fiche de ce qu'il lit, et le pli. */
const contextLine = (
	sheet: EquationView,
	fold: FoldView | null,
): OperandView => ({
	id: 'context-header',
	gutter: CONTEXT_NAME,
	gutterIsMechanism: true,
	key: null,
	depth: 0,
	termIsMechanism: false,
	control: null,
	label: null,
	value: ABSENT,
	address: null,
	page: null,
	description: null,
	parameterNote: null,
	// la fiche est toujours imprimée : le lecteur n'a rien à demander pour lire son contexte
	detail: sheet,
	open: true,
	fold,
	inert: false,
	folded: false,
	modifier: false,
	applicability: false,
})

/**
 * Un paramètre, écrit comme une ligne de calcul : son nom, sa valeur, ses marques. Une ligne
 * retenue par le pli reste dans la feuille, fermée — c'est ce qui la rend animable.
 */
const rowOf = (entry: ContextEntryView, folded: boolean): OperandView => ({
	id: entry.address,
	key: null,
	gutter: '',
	gutterIsMechanism: false,
	depth: 1,
	termIsMechanism: false,
	control: null,
	label: entry.name,
	value: entry.value,
	address: entry.address,
	page: entry.page,
	description: null,
	parameterNote: entry.bound ? BOUND_NOTE : PARAMETER_NOTES[entry.state],
	detail: null,
	open: false,
	fold: null,
	inert: false,
	folded,
	modifier: false,
	applicability: false,
})

/** La fiche que la ligne `contexte` ouvre : les paramètres lus, un cran plus loin. */
const sheetOf = (rows: OperandView[]): EquationView => ({
	keyword: null,
	inlineTerm: null,
	rows,
	size: rows.length,
	result: ABSENT,
	fold: null,
	note: null,
	contextId: null,
	depth: 1,
	header: CONTEXT_VALUE,
})

/** The `contexte` mechanism a stack names, wherever the rule writes it. */
const contextMechanism = (
	node: unknown,
	id: string,
): Ast.ContextMechanism | null => {
	if (Array.isArray(node)) {
		for (const child of node) {
			const found = contextMechanism(child, id)
			if (found !== null) return found
		}
		return null
	}
	if (!isRecord(node)) return null
	if (node.kind === 'context' && node.id === id)
		// le nœud est celui qu'on cherche : son `kind` et son `id` sont les deux champs qui
		// identifient un mécanisme, et l'AST porte le reste
		return node as unknown as Ast.ContextMechanism
	for (const child of Object.values(node)) {
		const found = contextMechanism(child, id)
		if (found !== null) return found
	}
	return null
}
