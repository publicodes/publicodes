import type { Situation } from 'publicodes'

declare const __INJECTED_SITUATIONS__: Situation<string>

export let situations = __INJECTED_SITUATIONS__
const situationUpdate = new EventTarget()
const SITUATION_UPDATED = 'situations-updated'

export function onSituationUpdate(callback: () => void) {
	situationUpdate.addEventListener(SITUATION_UPDATED, callback)
	return () => situationUpdate.removeEventListener(SITUATION_UPDATED, callback)
}

if (import.meta.hot) {
	import.meta.hot.on(
		'situations-updated',
		(newSituations: Situation<string>) => {
			situations = newSituations
			situationUpdate.dispatchEvent(new Event(SITUATION_UPDATED))
		},
	)
}
