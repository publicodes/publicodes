import { WorkerEngine, usePromise } from '@publicodes/worker-react'
import Engine, { utils } from 'publicodes'
import { ComponentProps, useContext } from 'react'
import { ActionData } from '@publicodes/worker'
import { executeAction } from './actions'
import {
	BasepathContext,
	DottedNameContext,
	RenderersContext,
	SupportedRenderers,
} from './contexts'
import { useEngine, useSubEngineId } from './hooks/useEngine'

const { encodeRuleName } = utils

type RuleLinkProps<Name extends string> = {
	dottedName: Name
	engine: Engine<Name> | WorkerEngine
	documentationPath: string
	displayIcon?: boolean
	currentEngineId?: number
	linkComponent?: SupportedRenderers['Link']
	children?: React.ReactNode
} & Omit<
	ComponentProps<Required<SupportedRenderers>['Link']>,
	'to' | 'children'
>

export const getRuleLinkData = (
	{ engine }: ActionData,
	{
		dottedName,
		dottedNameContext,
	}: { dottedName: string; dottedNameContext: string }
) => {
	const rule = engine.context.parsedRules[dottedName]
	const contextTitle = [
		...utils
			.ruleParents(dottedName)
			.reverse()
			.filter((name) => name.startsWith(`${dottedNameContext} . `))
			.map((name) => engine.context.parsedRules[name]?.title.trim()),
		rule.title?.trim(),
	].join(' › ')

	return { rule, contextTitle }
}

export function RuleLink<Name extends string>({
	dottedName,
	engine,
	currentEngineId,
	documentationPath,
	displayIcon = false,
	linkComponent,
	children,
	...propsRest
}: RuleLinkProps<Name>) {
	const renderers = useContext(RenderersContext)
	const dottedNameContext = utils.findCommonAncestor(
		useContext(DottedNameContext) ?? dottedName,
		dottedName
	)
	const Link = linkComponent || renderers.Link
	if (!Link) {
		throw new Error('You must provide a <Link /> component.')
	}
	const newPath = documentationPath + '/' + encodeRuleName(dottedName)

	const data = usePromise(
		() =>
			executeAction(engine, 'getRuleLinkData', {
				dottedName,
				dottedNameContext,
			}),
		[engine, dottedName, dottedNameContext]
	)
	if (data === undefined) {
		return <>RuleLink loading...</>
	}

	const { rule, contextTitle } = data
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
	props: Omit<RuleLinkProps<string>, 'engine' | 'documentationPath'> & {
		useSubEngine?: boolean
	}
) {
	const engine = useEngine()
	const subEngineId = useSubEngineId()
	const documentationPath = useContext(BasepathContext)
	const currentEngineIdFromUrl =
		typeof window !== 'undefined' &&
		new URLSearchParams(window.location.search).get('currentEngineId')
	const currentEngineId =
		props.useSubEngine !== false
			? subEngineId ||
			  (currentEngineIdFromUrl ? Number(currentEngineIdFromUrl) : undefined)
			: undefined

	return (
		<RuleLink
			engine={engine}
			currentEngineId={currentEngineId}
			documentationPath={documentationPath}
			{...props}
		/>
	)
}
