import Engine from 'publicodes'
import { ComponentProps, ComponentType, createContext, ReactNode } from 'react'
import { Accordion, AccordionProps, Code, CodeProps } from './component'
import References from './rule/References'

type PartialRequired<T, R extends keyof T> = Omit<T, R> & Required<Pick<T, R>>

export type AccordionItem = { title: string; id: string; children: ReactNode }

/**
 * The custom renderers for the markdown content.
 */
export type SupportedRenderers = {
	Link?: ComponentType<{
		children: ReactNode
		to?: string
		href?: string
		title?: string
		small?: boolean
		'aria-label'?: string
		onClick?: () => void
	}>

	Head?: ComponentType<{ children: ReactNode }>

	/**
	 * Used to render a rule description or title. Useful to parse markdown, links
	 * or emojies.
	 */
	Text?: ComponentType<{ children: string }>
	References?: typeof References
	/**
	 * Accordion used for developer documentation.
	 */
	Accordion?: ComponentType<AccordionProps>
	/**
	 * Block of code in pre
	 */
	Code?: ComponentType<CodeProps>
}

const DefaultTextRenderer = ({
	children,
}: ComponentProps<RenderersCtx['Text']>) => <p>{children}</p>

const DefaultLinkRenderer = (props: ComponentProps<RenderersCtx['Link']>) => (
	<a {...props} />
)

export type RenderersCtx = PartialRequired<
	SupportedRenderers,
	'References' | 'Text' | 'Code' | 'Link' | 'Accordion'
>

export const defaultRenderers = (renderers: SupportedRenderers = {}) => {
	const base: RenderersCtx = {
		References,
		Text: DefaultTextRenderer,
		Code,
		Accordion,
		Link: DefaultLinkRenderer,
	}

	return Object.fromEntries(
		(
			[...Object.keys(base), ...Object.keys(renderers)] as Array<
				keyof SupportedRenderers
			>
		)
			.map((key) => [key, renderers[key] ?? base[key]])
			.filter(([, val]) => val),
	) as RenderersCtx
}

export const RenderersContext = createContext<RenderersCtx>(defaultRenderers())

export const BasepathContext = createContext<string>('/documentation')

export const DottedNameContext = createContext<string | undefined>(undefined)

export const EngineContext = createContext<Engine<string> | undefined>(
	undefined,
)

export const DisplayOptionsContext = createContext<{
	rulesToHide: Array<string> | undefined
	displayIcon: boolean
	showDevSection: boolean
	searchBar?: boolean
}>({
	rulesToHide: undefined,
	displayIcon: true,
	showDevSection: true,
	searchBar: false,
})
