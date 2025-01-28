import Engine from 'publicodes'

// Create a custom event for engine updates
const ENGINE_UPDATED = 'engine-updated'
const engineUpdate = new EventTarget()

export let error: string[] = []
export let log: string[] = []
export let warning: string[] = []

const logger = {
	log: (message: string) => log.push(message),
	warn: (message: string) => warning.push(message),
	error: (message: string) => error.push(message),
}

export let engine = new Engine()
try {
	engine = new Engine(__INJECTED_RULES__, { logger })
} catch (e) {
	error = [e.message]
	engineUpdate.dispatchEvent(new Event(ENGINE_UPDATED))
}

// Helper to subscribe to engine updates
export function onEngineUpdate(callback: () => void) {
	engineUpdate.addEventListener(ENGINE_UPDATED, callback)
	return () => engineUpdate.removeEventListener(ENGINE_UPDATED, callback)
}
function clearLogs() {
	error = []
	log = []
	warning = []
}

if (import.meta.hot) {
	import.meta.hot.on('rules-updated', (newRules) => {
		const previousEngine = engine
		clearLogs()
		try {
			engine = new Engine(newRules, { logger })
			engine.setSituation(previousEngine.getSituation())
		} catch (e) {
			error = [e.message]
		}
		// Dispatch event to notify subscribers
		engineUpdate.dispatchEvent(new Event(ENGINE_UPDATED))
	})
}
