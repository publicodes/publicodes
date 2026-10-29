import type { CompiledModule, CompiledRules } from '@publicodes/autodoc-core'
import { namesOf, nameOf } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { RuleLink } from './RuleLink'

const GROUPS = [
	{ role: 'output' },
	{ role: 'parameter', label: 'Paramètres' },
] as const

interface Group {
	rules: string[]
	source: CompiledRules
	active: boolean
	/** Le nom du groupe ; les résultats n'en portent pas, ils ouvrent l'index. */
	label?: string
}

/**
 * The model's declared API as an index: its results, then the parameters those results
 * need — the compiled module's own exports, so the index lists exactly the rules the
 * model promises a page for. The parameters are many wherever the model is real, so they
 * come folded, and open on the reader standing among them.
 */
export function RuleIndex({
	module,
	current,
}: {
	module: CompiledModule
	/** The rule the reader is on: the index marks it rather than leading to it. */
	current?: string
}): ReactElement | null {
	const groups: Group[] = GROUPS.map((group) => {
		const source = group.role === 'output' ? module.outputs : module.parameters
		const rules = namesOf(source)
		return {
			...(group.role === 'parameter' ? { label: group.label } : {}),
			rules,
			source,
			active: current !== undefined && rules.includes(current),
		}
	}).filter((group) => group.rules.length > 0)
	if (groups.length === 0) return null
	return (
		<nav className="publicodes-rule-index" aria-label="Règles du modèle">
			{groups.map(({ label, rules, source, active }) => {
				const list = (
					<ul>
						{rules.map((rule) => (
							<li key={rule}>
								{rule === current ?
									// la page où le lecteur est se marque, elle ne se lie pas
									<span aria-current="page">{nameOf(rule, source)}</span>
								:	<RuleLink address={rule}>{nameOf(rule, source)}</RuleLink>}
							</li>
						))}
					</ul>
				)
				// un groupe qui a un nom se plie : c'est celui des paramètres, long sur un vrai
				// modèle. Les résultats n'en ont pas — ils ouvrent l'index et se lisent d'abord
				return label !== undefined ?
						<details
							key={label}
							className="publicodes-rule-group"
							open={active}
						>
							<summary>{label}</summary>
							{list}
						</details>
					:	<div key="outputs" className="publicodes-rule-group">
							{list}
						</div>
			})}
		</nav>
	)
}
