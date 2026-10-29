import type {
	CompiledModule,
	Evaluation,
	PageEvaluation,
	TraceValue,
} from '@publicodes/autodoc-core'
import { evaluatePage } from '@publicodes/autodoc-core'
import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import { useMemo } from 'react'

/**
 * L'évaluation de la page : la trace où ses valeurs se lisent, et la pile sous laquelle
 * elle se lit. Tout est dans autodoc-core ; ce hook n'en garde que la mémoïsation.
 */
export function useEvaluation({
	module,
	ast,
	rule,
	context,
	stack,
	evaluation,
}: {
	module: CompiledModule
	ast: PublicodeAST
	rule: string
	context?: Record<string, TraceValue>
	stack?: string
	evaluation?: Evaluation
}): PageEvaluation {
	return useMemo(
		() => evaluatePage({ module, ast, rule, context, stack, evaluation }),
		[module, ast, rule, context, stack, evaluation],
	)
}
