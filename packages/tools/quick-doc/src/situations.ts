import type { Situation } from 'publicodes'
import { useState } from 'react'

declare const __INJECTED_SITUATIONS__: Record<string, Situation<string>>

const emptySituation: Situation<string> = {}
export function useSituation(currentSituation: string) {
	const situations = useSituationList()
	return currentSituation in situations ?
			situations[currentSituation]
		:	emptySituation
}

export function useSituationList() {
	const [situations, setSituations] = useState(__INJECTED_SITUATIONS__)

	if (import.meta.hot) {
		import.meta.hot.on(
			'situations-updated',
			(newSituations: typeof __INJECTED_SITUATIONS__) => {
				setSituations(newSituations)
			},
		)
	}
	return situations
}
