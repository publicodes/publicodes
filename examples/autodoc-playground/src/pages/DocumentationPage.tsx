import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import type { Evaluation, Trace, TraceValue } from '@publicodes/autodoc-core'
import { createPathNavigation, displayName } from '@publicodes/autodoc-core'
import {
	AutodocButtonNavigationContext,
	RulePage,
} from '@publicodes/autodoc-react'
import { useMemo, useState } from 'react'

export interface DocumentationPageProps {
	title: string
	ast: PublicodeAST
	outputs: Record<string, unknown>
	parameters: Record<string, unknown>
	start: string
	context: Record<string, TraceValue>
	/** Les règles compilées du modèle : c'est la page qui évalue celle qu'elle affiche. */
	rules: Record<string, unknown>
}

/** Ce qu'une règle compilée sait faire : s'évaluer, et rendre de quoi lire sa trace. */
type CompiledRule = {
	evaluate?: (
		params?: Record<string, TraceValue>,
		options?: { trace?: boolean },
	) => { trace: Trace; needed: string[]; missing: string[] }
}

/**
 * A complete documentation example: the model's declared API as pages, and
 * button navigation between them, so a reference leads somewhere real.
 */
export function DocumentationPage({
	title,
	ast,
	outputs,
	parameters,
	start,
	context,
	rules,
}: DocumentationPageProps) {
	const [current, setCurrent] = useState(start)
	const [contextStackId, setContextStackId] = useState('')
	const navigation = createPathNavigation({
		outputs,
		parameters,
		basePath: title,
	})
	// la page montre l'évaluation de la règle qu'elle affiche, et d'aucune autre : une règle
	// que cette évaluation n'a pas atteinte n'a rien à lire
	const evaluation = useMemo((): Evaluation | undefined => {
		const { evaluate } = (rules[current] ?? {}) as CompiledRule
		if (evaluate === undefined) return undefined
		const { trace, needed, missing } = evaluate(context, { trace: true })
		return { trace, usedParameters: needed, missing, evaluatedRule: current }
	}, [rules, current, context])

	return (
		<AutodocButtonNavigationContext.Provider
			value={{
				rule: current,
				contextStackId,
				onNavigate: (rule, stack) => {
					setCurrent(rule)
					setContextStackId(stack)
				},
			}}
		>
			<div className="doc-shell">
				<nav className="doc-index">
					<h2 className="doc-title">{title}</h2>
					{(
						[
							['output', 'Résultats'],
							['parameter', 'Paramètres'],
						] as const
					).map(([role, label]) => {
						const routes = navigation.routes.filter(
							(route) => route.role === role,
						)
						if (routes.length === 0) return null
						return (
							<div key={role}>
								<h3 className="doc-group">{label}</h3>
								<ul>
									{routes.map((route) => (
										<li key={route.rule}>
											<button
												type="button"
												className={route.rule === current ? 'on' : ''}
												onClick={() => setCurrent(route.rule)}
											>
												{displayName(ast, route.rule)}
											</button>
										</li>
									))}
								</ul>
							</div>
						)
					})}
				</nav>
				<RulePage
					ast={ast}
					rule={current}
					evaluation={evaluation}
					context={context}
					contextStackId={contextStackId}
				/>
			</div>
		</AutodocButtonNavigationContext.Provider>
	)
}
