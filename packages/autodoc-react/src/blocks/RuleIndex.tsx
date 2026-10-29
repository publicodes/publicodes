import type { CompiledModule } from '@publicodes/autodoc-core'
import { namesOf, nameOf } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { RuleLink } from './RuleLink'

const GROUPS = [
	{ role: 'output', label: 'Résultats' },
	{ role: 'parameter', label: 'Paramètres' },
] as const

/**
 * The model's declared API as an index: its results, then the parameters those results
 * need — the compiled module's own exports, so the index lists exactly the rules the
 * model promises a page for.
 */
export function RuleIndex({
	module,
	current,
}: {
	module: CompiledModule
	/** The rule the reader is on: the index marks it rather than leading to it. */
	current?: string
}): ReactElement | null {
	const groups = GROUPS.map(({ role, label }) => ({
		label,
		rules: namesOf(role === 'output' ? module.outputs : module.parameters),
		source: role === 'output' ? module.outputs : module.parameters,
	})).filter((group) => group.rules.length > 0)
	if (groups.length === 0) return null
	return (
		<nav className="publicodes-rule-index" aria-label="Règles du modèle">
			{groups.map(({ label, rules, source }) => (
				<section key={label}>
					<h2>{label}</h2>
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
				</section>
			))}
		</nav>
	)
}
