import rules from '$RULES$'
import situations from '$SITUATIONS$'
import Engine, { Situation } from 'publicodes'
import { useCallback, useEffect, useState } from 'react'
// Create a custom event for engine updates

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
			const engine = new Engine(rules)
			setState({
				engine,
				error: [],
				situationList: situations,
				currentSituation: '',
			})
		} catch (e) {
			if (e instanceof Error) {
				setState({
					...state,
					error: [e.message],
					situationList: situations,
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
		import.meta.hot.accept('$RULES$', (rules) => {
			try {
				const engine = new Engine(rules.default)
				engine.setSituation(state.situationList[state.currentSituation])
				setState({ ...state, engine, error: [] })
			} catch (e) {
				if (e instanceof Error) {
					setState({ ...state, error: [e.message] })
				}
			}
		})
		import.meta.hot.accept('$SITUATIONS$', (situations) => {
			const newSituations = situations.default
			try {
				const currentSituation =
					state.currentSituation in newSituations ? state.currentSituation : ''
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
		})
	}

	return [state, setCurrentSituation]
}
