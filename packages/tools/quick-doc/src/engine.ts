import Engine, { RawPublicodes } from 'publicodes'
import { useEffect, useMemo, useState } from 'react'
import { useSituation } from './situations'

// Create a custom event for engine updates
declare const __INJECTED_RULES__: RawPublicodes<string>

export function useEngine(currentSituation: string) {
	const [error, setError] = useState<string[]>([])
	const [log, setLog] = useState<string[]>([])
	const [warning, setWarning] = useState<string[]>([])
	const [engine, setEngine] = useState<Engine>(new Engine({}))
	const situation = useSituation(currentSituation)

	console.log(situation)

	const logger = useMemo(
		() => ({
			log: (message: string) => setLog((log) => [...log, message]),
			warn: (message: string) => setWarning((warning) => [...warning, message]),
			error: (message: string) => setError((error) => [...error, message]),
		}),
		[setLog, setWarning, setError],
	)
	useEffect(() => {
		try {
			setEngine(new Engine(__INJECTED_RULES__, { logger }))
		} catch (e) {
			if (e instanceof Error) {
				setError([e.message])
			}
		}
	}, [])

	function clearLogs() {
		setLog([])
		setWarning([])
		setError([])
	}

	useEffect(() => {
		try {
			clearLogs()
			engine.setSituation(situation)
		} catch (e) {
			if (e instanceof Error) {
				setError([e.message])
			}
		}
	}, [situation])

	if (import.meta.hot) {
		import.meta.hot.on(
			'rules-updated',
			(newRules: typeof __INJECTED_RULES__) => {
				const previousEngine = engine
				clearLogs()
				try {
					setEngine(new Engine(newRules, { logger }))
					engine.setSituation(previousEngine.getSituation())
				} catch (e) {
					if (e instanceof Error) {
						setError([e.message])
					}
				}
				// Dispatch event to notify subscribers
			},
		)
	}

	return { engine, error, log, warning }
}
