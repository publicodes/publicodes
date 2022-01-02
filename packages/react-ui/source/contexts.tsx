import Engine from 'publicodes'
import React, { createContext } from 'react'
import References from './rule/References'

export type SupportedRenderers = {
	Link: React.ComponentType<{ to: string }>
	Head?: React.ComponentType

	/**
	 * Used to render a rule description or title. Useful to parse markdown, links
	 * or emojies.
	 */
	Text?: React.ComponentType
	References?: typeof References
}

export const DefaultTextRenderer: React.ComponentType = ({ children }) => (
	<>{children}</>
)
export const BasepathContext = createContext<string>('/documentation')
export const EngineContext = createContext<Engine<string> | null>(null)
export const RenderersContext = createContext<
	Partial<Omit<SupportedRenderers, 'Text'>> &
		Required<Pick<SupportedRenderers, 'Text'>>
>({
	References,
	Text: DefaultTextRenderer,
})
