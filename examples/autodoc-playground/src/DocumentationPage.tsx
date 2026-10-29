import type {
	CompiledModule,
	PathNavigation,
	TraceValue,
} from '@publicodes/autodoc-core'
import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import { RuleIndex, RulePage } from '@publicodes/autodoc-react'
import { useEffect } from 'react'
import { useHashRoute } from './hash-route'

/**
 * The page of one rule of a model: the index beside it. The rule and the `contexte`
 * stack are whichever the address names; an address of this model that names no page of
 * it is replaced by the model's own entry, so the bar and the page never disagree.
 */
export function DocumentationPage({
	module,
	ast,
	pages,
	title,
	start,
	context,
}: {
	module: CompiledModule
	ast: PublicodeAST
	/** Les adresses du modèle : quel chemin nomme quelle règle, et réciproquement. */
	pages: PathNavigation
	title: string
	start: string
	/**
	 * Le contexte du calcul, quand la page doit en montrer un. Sans lui, le modèle parle
	 * seul : ses `par défaut` et ses valeurs non renseignées, comme sur une page ouverte
	 * à froid.
	 */
	context?: Record<string, TraceValue>
}) {
	const { path } = useHashRoute()
	const rule = pages.ruleOf(path)

	useEffect(() => {
		// une adresse de ce modèle qui ne nomme aucune de ses pages repart de son entrée
		if (rule !== null || !path.startsWith(pages.basePath)) return
		window.location.replace(pages.href(start, ''))
	}, [rule, path, pages, start])

	if (rule === null) return null
	return (
		<div className="doc-shell">
			<div className="doc-index">
				<p className="doc-title">{title}</p>
				<RuleIndex module={module} current={rule} />
			</div>
			<RulePage module={module} ast={ast} rule={rule} context={context} />
		</div>
	)
}
