import type {
	CompiledModule,
	OperandView,
	TraceValue,
} from '@publicodes/autodoc-core'
import {
	evaluateRule,
	projectExplanation,
	projectUsageRows,
	usedForComputation,
} from '@publicodes/autodoc-core'
import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import { useMemo } from 'react'

/**
 * Les résultats qui se servent de cette règle, une ligne chacun, valeur comprise : chacune se
 * calcule donc comme une page, dans le contexte du lecteur.
 */
export function useUsage({
	module,
	ast,
	rule,
	context,
	pages,
	expanded,
}: {
	module: CompiledModule
	ast: PublicodeAST
	rule: string
	context?: Record<string, TraceValue>
	pages: ReadonlySet<string>
	expanded: ReadonlySet<string>
}): OperandView[] {
	return useMemo(() => {
		const rows = usedForComputation(module.outputs, rule).map((target) => ({
			...target,
			explanation:
				projectExplanation(ast, target.address, {
					// sans contexte, la page documente : ces lignes n'ont pas de valeur à donner
					evaluation:
						context === undefined ? undefined : (
							evaluateRule(module, target.address, context)
						),
					context,
					expanded,
					pages,
				}) ?? undefined,
		}))
		return projectUsageRows(ast, rows, { expanded, pages })
	}, [module, ast, rule, context, pages, expanded])
}
