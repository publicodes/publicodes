import { useContext } from 'react'
import { EngineContext, RulesToHideContext } from './contexts'

export const useEngine = () => {
	const engine = useContext(EngineContext)
	if (!engine) {
		throw new Error('Engine expected')
	}

	return engine
}

export const useHideValue = (dottedName: string | undefined) => {
	if (!dottedName) {
		return false
	}
	const rulesToHide = useContext(RulesToHideContext)
	if (!rulesToHide) {
		return false
	}

	return rulesToHide.includes(dottedName)
}
