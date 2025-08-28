import Engine, { utils } from 'publicodes'
import { ComponentProps, useContext } from 'react'
import {
	BasepathContext,
	DottedNameContext,
	RenderersContext,
	SupportedRenderers,
} from './contexts'
import { useEngine } from './hooks'

const { encodeRuleName } = utils

/**
 * Create a link to a rule in the documentation.
 *
 * @param props
 * @group Components
 *
 */
export function RuleLink<Name extends string>({
	dottedName,
	engine,
	currentEngineId,
	documentationPath,
	displayIcon,
	linkComponent,
	children,
	...propsRest
}: {
	/**
	 * The dotted name of the rule.
	 */
	dottedName: Name
	/**
	 * The engine instance containing the rule.
	 */
	engine: Engine<Name>
	/**
	 * The base path for the documentation.
	 */
	documentationPath: string
	/**
	 * Whether to display an icon next to the link.
	 */
	displayIcon?: boolean
	/**
	 * The current engine ID, if applicable.
	 */
	currentEngineId?: number
	/**
	 * A custom link component to use for rendering the link.
	 */
	linkComponent?: SupportedRenderers['Link']
	/**
	 * The children to render inside the link
	 * @default The title of the rule
	 */
	children?: React.ReactNode
	/**
	 * The href attribute for the link.
	 */
	href?: string
	/**
	 * The title attribute for the link.
	 */
	title?: string
	/**
	 * Whether to render the link in a smaller size.
	 */
	small?: boolean
	/**
	 * The aria-label attribute for the link.
	 */
	'aria-label'?: string
	/**
	 * * Custom function when the link is clicked
	 */
	onClick?: () => void
}) {
	const renderers = useContext(RenderersContext)
	const dottedNameContext = utils.findCommonAncestor(
		useContext(DottedNameContext) ?? dottedName,
		dottedName,
	)
	const Link = linkComponent || renderers.Link
	if (!Link) {
		throw new Error('You must provide a <Link /> component.')
	}
	const rule = engine.context.parsedRules[dottedName]
	const newPath = documentationPath + '/' + encodeRuleName(dottedName)
	const contextTitle = [
		...utils
			.ruleParents(dottedName)
			.reverse()
			.filter((name) => name.startsWith(`${dottedNameContext} . `))
			.map((name) => engine.context.parsedRules[name]?.title.trim()),
		rule.title?.trim(),
	].join(' › ')

	if (!rule) {
		throw new Error(`Unknown rule: ${dottedName}`)
	}

	return (
		<Link
			{...propsRest}
			aria-label={
				propsRest['aria-label'] ??
				(rule.title &&
					rule.title + ', voir les détails du calcul pour : ' + rule.title)
			}
			to={
				newPath + (currentEngineId ? `?currentEngineId=${currentEngineId}` : '')
			}
		>
			{children || contextTitle || rule.dottedName.split(' . ').slice(-1)[0]}{' '}
			{displayIcon && rule.rawNode.icônes && <span>{rule.rawNode.icônes}</span>}
		</Link>
	)
}

export function RuleLinkWithContext(
	props: Omit<
		ComponentProps<typeof RuleLink>,
		'engine' | 'documentationPath'
	> & {
		useSubEngine?: boolean
	},
) {
	const engine = useEngine()
	const documentationPath = useContext(BasepathContext)
	const currentEngineIdFromUrl =
		typeof window !== 'undefined' &&
		new URLSearchParams(window.location.search).get('currentEngineId')
	const currentEngineId =
		(props.useSubEngine !== false &&
			(props.currentEngineId ||
				engine.context.subEngineId ||
				(currentEngineIdFromUrl && Number.parseInt(currentEngineIdFromUrl)))) ||
		undefined
	return (
		<RuleLink
			engine={engine}
			currentEngineId={currentEngineId}
			documentationPath={documentationPath}
			{...props}
		/>
	)
}
