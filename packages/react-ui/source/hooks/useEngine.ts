import { createContext, useContext } from 'react'
import { WorkerEngine } from '@publicodes/worker-react'
import Engine from 'publicodes'

const EngineContext = createContext<{
	engine?: Engine | WorkerEngine
	subEngineId?: number
}>({})

export const EngineContextProvider = EngineContext.Provider

export const useEngine = () => {
	const { engine } = useContext(EngineContext)
	if (!engine) {
		throw new Error('Engine expected')
	}

	return engine
}

export const useSubEngineId = () => {
	const { engine, subEngineId } = useContext(EngineContext)
	if (!engine) {
		throw new Error('Engine expected')
	}

	return subEngineId
}
