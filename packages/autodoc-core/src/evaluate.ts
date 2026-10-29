import type { PublicodeAST } from './ast'
import type { CompiledModule } from './declared-api'
import type { TraceValue } from './trace'
import { contextOwner } from './context-stack'
import type { Evaluation } from './projection/types'

/** Ce qu'une règle vaut sous un contexte, tel que le module compilé le rend. */
export function evaluateRule(
	module: CompiledModule,
	rule: string,
	context: Record<string, TraceValue>,
): Evaluation | undefined {
	const evaluate = module.default[rule]?.evaluate
	if (evaluate === undefined) return undefined
	const { trace, needed, missing } = evaluate(context, { trace: true })
	return { trace, needed: needed, missing, evaluatedRule: rule }
}

/** Ce qu'une page lit : l'évaluation qui porte ses valeurs, et la pile où les lire. */
export interface PageEvaluation {
	evaluation: Evaluation | undefined
	/** '' quand la page se lit au contexte du modèle — ce que le cas courant donne. */
	stack: string
}

/**
 * L'évaluation d'une page. Sans contexte, la page documente le modèle : elle n'évalue rien,
 * et n'imprime donc aucune valeur calculée. Une page lue sous un `contexte` prend sa trace de
 * la règle qui a ouvert la pile : c'est la seule qui porte ce qu'elle montre. Les paramètres
 * dont le calcul a eu besoin, eux, restent ceux de la page. Une pile qu'aucune règle ne
 * reconnaît — un lien d'un autre modèle, plus ancien — se lit au contexte du modèle.
 */
export function evaluatePage({
	module,
	ast,
	rule,
	context,
	stack = '',
	evaluation: given,
}: {
	module: CompiledModule
	ast: PublicodeAST
	rule: string
	context?: Record<string, TraceValue>
	/** La pile du `contexte` sous lequel la page se lit. */
	stack?: string
	/** Un hôte qui évalue ailleurs (un moteur complet) donne sa propre évaluation. */
	evaluation?: Evaluation
}): PageEvaluation {
	if (given !== undefined) return { evaluation: given, stack }
	// aucun contexte : la page est la fiche du modèle, pas un calcul
	if (context === undefined) return { evaluation: undefined, stack }
	const owner = stack === '' ? null : contextOwner(ast, stack)
	if (owner === null)
		return { evaluation: evaluateRule(module, rule, context), stack: '' }
	if (owner === rule)
		return { evaluation: evaluateRule(module, rule, context), stack }
	// la trace vient du propriétaire de la pile ; le compte des paramètres, de la page
	const trace = evaluateRule(module, owner, context)
	const own = evaluateRule(module, rule, context)
	return {
		evaluation:
			trace === undefined ? undefined : (
				{
					trace: trace.trace,
					needed: own?.needed,
					missing: own?.missing,
					evaluatedRule: rule,
				}
			),
		stack,
	}
}
