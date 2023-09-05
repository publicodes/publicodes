import { useContext } from 'react'
import { EngineContext } from './contexts'

export const useEngine = () => {
	console.log('tya', EngineContext)
	const engine = useContext(EngineContext)
	if (!engine) {
		throw new Error('Engine expected')
	}

	return engine
}
