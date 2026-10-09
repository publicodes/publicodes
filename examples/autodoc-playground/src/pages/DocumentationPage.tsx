import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import type { Trace, TraceValue } from '@publicodes/autodoc-core'
import { createPathNavigation, displayName } from '@publicodes/autodoc-core'
import {
	AutodocButtonNavigationContext,
	RulePage,
} from '@publicodes/autodoc-react'
import { useState } from 'react'

export interface DocumentationPageProps {
	title: string
	ast: PublicodeAST
	outputs: Record<string, unknown>
	parameters: Record<string, unknown>
	start: string
	context: Record<string, TraceValue>
	trace: Trace
	usedParameters: readonly string[]
	missing: readonly string[]
	evaluatedRule: string
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
	trace,
	usedParameters,
	missing,
	evaluatedRule,
}: DocumentationPageProps) {
	const [current, setCurrent] = useState(start)
	const [contextStackId, setContextStackId] = useState('')
	const navigation = createPathNavigation({ outputs, parameters, basePath: title })

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
					trace={trace}
					context={context}
					contextStackId={contextStackId}
					usedParameters={usedParameters}
					missing={missing}
					evaluatedRule={evaluatedRule}
				/>
			</div>
		</AutodocButtonNavigationContext.Provider>
	)
}
