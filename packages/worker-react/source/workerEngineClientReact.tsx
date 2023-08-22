import React, {
	createContext,
	useContext,
	useMemo,
	useRef,
	useState,
} from 'react'

import { usePromise } from './hooks/usePromise'

import {
	AZE,
	ActionType,
	Test,
	WorkerEngineActions,
	WorkerEngineClient,
} from '@publicodes/worker'
import EngineType from 'publicodes'

const useTransition =
	React.version.split('.')[0] >= '18'
		? React.useTransition
		: () => [false, (cb: () => void) => cb()] as const

/**
 * This interface is the default config, user can augment UserConfig if needed.
 */
export interface DefaultConfig {
	additionalActions: ActionType
	engine: EngineType
}

/**
 * This interface can be augmented by users to set global types of this package.
 */
export interface UserConfig extends DefaultConfig {}

type MergeBy<T, K> = Omit<T, keyof K> & K
export type Config = MergeBy<DefaultConfig, UserConfig>

// export type ConfigAdditionalActions = Config['additionalActions']

export interface WorkerEngine<
	Cfg extends Config = Config,
	AdditionalActions extends ActionType = Cfg['additionalActions'],
	Engine extends EngineType = Cfg['engine']
> extends WorkerEngineClient<
		AdditionalActions,
		WorkerEngineActions<unknown[], Engine>
	> {
	situationVersion: number

	'~type'?: AdditionalActions
	'~config'?: Config
}

const WorkerEngineContext = createContext<WorkerEngine<Config>>(
	undefined as unknown as WorkerEngine<Config>
)

/**
 */
export const useWorkerEngine = <
	Cfg extends Config
	// AdditionalActions extends ActionType = Cfg['additionalActions']
>() => {
	const context = useContext(WorkerEngineContext)

	//  && !import.meta.env.SSR
	if (!context) {
		throw new Error(
			'You are trying to use the worker engine outside of its provider'
		)
	}

	return context as WorkerEngine<Cfg>
}

/**
 */
const useSynchronizedWorkerEngine = <
	Cfg extends Config,
	AdditionalActions extends ActionType = Cfg['additionalActions'],
	Engine extends EngineType = Cfg['engine']
>(
	workerClient: WorkerEngineClient<
		AdditionalActions,
		WorkerEngineActions<unknown[], Engine>
	>
): WorkerEngine<Cfg> => {
	const [transition, startTransition] = useTransition()

	const [situationVersion, setSituationVersion] = useState(0)
	const [workerEngine, setWorkerEngine] = useState<
		WorkerEngineClient<
			AdditionalActions,
			WorkerEngineActions<unknown[], Engine>
		>
	>(() => {
		console.log('********', workerClient.onSituationChange, workerClient)

		workerClient.onSituationChange = function () {
			console.log('onSituationChange', workerClient.engineId)

			startTransition(() => {
				setSituationVersion((situationVersion) => {
					return situationVersion + 1
				})
			})
		}

		return workerClient
	})

	const memo = useMemo(() => {
		return { ...workerEngine, situationVersion }
	}, [situationVersion, workerEngine])

	return memo
}

/**
 */
export const WorkerEngineProvider = <
	Cfg extends Config,
	AdditionalActions extends ActionType = Cfg['additionalActions']
>({
	workerClient,
	children,
}: {
	workerClient: WorkerEngineClient<AdditionalActions>
	children: React.ReactNode
}) => {
	const workerEngine = useSynchronizedWorkerEngine(workerClient)

	// useSetupSafeSituation(workerEngine)

	if (workerEngine === undefined) {
		return children
	}

	return (
		<WorkerEngineContext.Provider value={workerEngine}>
			{children}
		</WorkerEngineContext.Provider>
	)
}

interface AsyncSetSituationOptions {
	options?: Parameters<WorkerEngine['asyncSetSituation']>[1]
	workerEngine?: WorkerEngine
}

/**
 */
export const useAsyncSetSituation = (
	situation: Parameters<WorkerEngine['asyncSetSituation']>[0],
	{ options, workerEngine: workerEngineOption }: AsyncSetSituationOptions
) => {
	const defaultWorkerEngine = useWorkerEngine()
	const workerEngine = workerEngineOption ?? defaultWorkerEngine

	return usePromise(
		() => workerEngine.asyncSetSituation(situation, options),
		[workerEngine, situation, options]
	)
}

interface Options<DefaultValue> {
	workerEngine?: WorkerEngine
	defaultValue?: DefaultValue
}

/**
 * This hook is used to get a rule in the worker engine.
 */
export const useAsyncGetRule = <
	Name extends string = string,
	DefaultValue extends unknown = undefined
>(
	dottedName: Name,
	{ defaultValue, workerEngine: workerEngineOption }: Options<DefaultValue> = {}
) => {
	const defaultWorkerEngine = useWorkerEngine()
	const workerEngine = workerEngineOption ?? defaultWorkerEngine

	return usePromise(
		async () => workerEngine.asyncGetRule(dottedName),
		[dottedName, workerEngine],
		defaultValue
	)
}

/**
 * This hook is used to get parsed rules in the worker engine.
 */
export const useAsyncParsedRules = <DefaultValue extends unknown = undefined>({
	workerEngine: workerEngineOption,
	defaultValue,
}: Options<DefaultValue> = {}) => {
	const defaultWorkerEngine = useWorkerEngine()
	const workerEngine = workerEngineOption ?? defaultWorkerEngine

	return usePromise(
		async () => workerEngine.asyncGetParsedRules(),
		[workerEngine],
		defaultValue
	)
}

/**
 * This hook is used to make a shallow copy of the worker engine.
 */
export const useAsyncShallowCopy = (
	workerEngine: WorkerEngine
): WorkerEngine | undefined => {
	const [transition, startTransition] = useTransition()

	const [situationVersion, setSituationVersion] = useState(0)

	const lastPromise = useRef<Promise<WorkerEngineClient> | null>(null)
	const workerEngineShallowCopy = usePromise(async () => {
		if (lastPromise.current) {
			lastPromise.current.then((last) =>
				setTimeout(() => {
					console.log('deleteShallowCopy', last.engineId)
					last.asyncDeleteShallowCopy()
				}, 10000)
			)
		}

		lastPromise.current = workerEngine.asyncShallowCopy(() => {
			console.log('onSituationChange in shallow copy', copy.engineId)

			startTransition(() => {
				setSituationVersion((x) => x + 1)
			})
		})

		const copy = await lastPromise.current

		return copy
	}, [workerEngine])

	const memo = useMemo(
		() =>
			workerEngineShallowCopy
				? { ...workerEngineShallowCopy, situationVersion }
				: undefined,
		[situationVersion, workerEngineShallowCopy]
	)

	return memo
}

// export function useInversionFail() {
// 	 return useContext(EngineContext).inversionFail()
// }

export const reactActions = {
	test: (engine: EngineType) => {
		console.log('ACTION OK')

		return engine.evaluate('21 + 21')
	},
} satisfies AZE

export type ReactActions = Test<typeof reactActions>
