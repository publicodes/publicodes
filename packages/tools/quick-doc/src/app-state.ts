import Engine, { RawPublicodes, Situation } from 'publicodes'
import { useCallback, useEffect, useState } from 'react'

// Create a custom event for engine updates
declare const __INJECTED_RULES__: RawPublicodes<string>

declare const __INJECTED_SITUATIONS__: Record<string, Situation<string>>

export type State = {
	engine: Engine
	error: string[]
	situationList: Record<string, Situation<string>>
	currentSituation: string
}

export function useAppState(): [
	state: State,
	changeSituation: (situation: string) => void,
] {
	const [state, setState] = useState<State>({
		engine: new Engine({}),
		error: [],
		situationList: {},
		currentSituation: '',
	})

	useEffect(() => {
		try {
			const engine = new Engine(__INJECTED_RULES__)
			setState({
				engine,
				error: [],
				situationList: __INJECTED_SITUATIONS__,
				currentSituation: '',
			})
		} catch (e) {
			if (e instanceof Error) {
				setState({
					...state,
					error: [e.message],
					situationList: __INJECTED_SITUATIONS__,
				})
			}
		}
	}, [])

	const setCurrentSituation = useCallback(
		(situation: string) => {
			try {
				state.engine?.setSituation(state.situationList[situation])
				setState({ ...state, error: [], currentSituation: situation })
			} catch (e) {
				if (e instanceof Error) {
					setState({ ...state, error: [e.message] })
				}
			}
		},
		[state],
	)

	if (import.meta.hot) {
		import.meta.hot.on(
			'rules-updated',
			(newRules: typeof __INJECTED_RULES__) => {
				try {
					const engine = new Engine(newRules)
					engine.setSituation(state.situationList[state.currentSituation])
					setState({ ...state, engine, error: [] })
				} catch (e) {
					if (e instanceof Error) {
						setState({ ...state, error: [e.message] })
					}
				}
			},
		)
		import.meta.hot.on(
			'situations-updated',
			(newSituations: typeof __INJECTED_SITUATIONS__) => {
				try {
					const currentSituation =
						state.currentSituation in newSituations ?
							state.currentSituation
						:	''
					state.engine?.setSituation(newSituations[currentSituation] || {})
					setState({
						...state,
						currentSituation,
						situationList: newSituations,
						error: [],
					})
				} catch (e) {
					if (e instanceof Error) {
						setState({ ...state, error: [e.message] })
					}
				}
			},
		)
	}

	return [state, setCurrentSituation]
}
