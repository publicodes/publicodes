import type {
	CompiledModule,
	ContextBlockView,
	Evaluation,
	OperandView,
	RuleView,
	TraceValue,
} from '@publicodes/autodoc-core'
import {
	namesOf,
	projectContextBlock,
	projectRule,
} from '@publicodes/autodoc-core'
import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import { useMemo } from 'react'
import type { AutodocPage } from './components/AutodocPageContext'
import { useEvaluation } from './hooks/useEvaluation'
import { useFolds } from './hooks/useFolds'
import { useUnfoldedRows } from './hooks/useUnfoldedRows'
import { useUsage } from './hooks/useUsage'

export interface RulePageOptions {
	/**
	 * The reader's inputs — the context the page is read under. Defaults to none: the
	 * model's own values, its defaults included.
	 */
	context?: Record<string, TraceValue>
	/** The `contexte` stack to read the page under, '' for the model's own. */
	stack?: string
	/** A host that evaluates elsewhere (a full engine) passes its own trace. */
	evaluation?: Evaluation
}

export interface RulePageState {
	/** The rule as a page: its name, its description, its answer and its equation. */
	rule: RuleView
	/**
	 * The block that names the context the page was read in: its trail, and what it bound.
	 * Null for a parameter, whose page is the input itself.
	 */
	contextBlock: ContextBlockView | null
	/** The results whose computation needs the rule: a parameter's own block. */
	usage: OperandView[]
	/** What the blocks under this page need, `RulePage` puts it in the context. */
	page: AutodocPage
}

interface RulePageInput extends RulePageOptions {
	module: CompiledModule
	ast: PublicodeAST
	rule: string
}

/**
 * The seam between the model and the page: it evaluates the rule, projects it, and owns
 * the only state the library keeps — which rows are open, the reader's own and the ones
 * the page opened for them, and which held-back terms they asked for.
 *
 * Each piece is a hook of its own; a host that recomposes its page uses this one and
 * arranges the blocks as it wishes.
 */
export function useRulePage({
	module,
	ast,
	rule: ruleName,
	context,
	stack = '',
	evaluation: given,
}: RulePageInput): RulePageState {
	const { evaluation, stack: stackId } = useEvaluation({
		module,
		ast,
		rule: ruleName,
		context,
		stack,
		evaluation: given,
	})
	// les règles pour lesquelles le modèle promet une page : l'API déclarée, dont l'index est
	// la liste — l'auteur n'y met pas `public`, le compilateur les dérive
	const pages = useMemo(
		() => new Set([...namesOf(module.outputs), ...namesOf(module.parameters)]),
		[module],
	)
	const { folds, toggleFold } = useFolds()
	const projection = { evaluation, context, contextStackId: stackId }
	const { expanded, toggleRow } = useUnfoldedRows({
		ast,
		rule: ruleName,
		options: { ...projection, folds },
	})
	const rule = projectRule(ast, ruleName, {
		...projection,
		folds,
		expanded,
		pages,
	})
	// la valeur d'une règle qui écrit un `contexte` est lue un cran plus bas que la page : le
	// contexte courant est celui-là, et ce qu'il lie s'y lit
	const valueStack =
		rule.equation?.contextId == null ?
			stackId
		:	`${stackId}-${rule.equation.contextId}`
	// une page sans évaluation n'a rien lu : il n'y a pas de contexte à nommer
	const contextBlock =
		module.parameters[ruleName] !== undefined || evaluation === undefined ?
			null
		:	projectContextBlock(ast, ruleName, {
				evaluation,
				context,
				contextStackId: valueStack,
				folds,
				pages,
			})
	const usage = useUsage({
		module,
		ast,
		rule: ruleName,
		context,
		pages,
		expanded,
	})
	return {
		rule,
		contextBlock,
		usage,
		page: { stack, toggleRow, toggleFold },
	}
}
