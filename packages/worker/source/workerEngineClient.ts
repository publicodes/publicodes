import type { ActionType, GetAction, WorkerEngineActions } from './workerEngine'

// if (typeof Worker === 'undefined') {
// 	throw new Error('Worker is not supported.')
// }

/**
 * This file is a client to communicate with workerEngine.
 */

const isObject = (val: unknown): val is object =>
	typeof val === 'object' && val !== null

const isId = (val: object): val is { id: number } =>
	'id' in val && typeof val.id === 'number'

const isBatch = (val: object): val is { batch: unknown[] } =>
	'batch' in val && Array.isArray(val.batch)

interface WorkerEnginePromise<
	Actions extends ActionType = ActionType,
	ActionNames extends Actions['action'] = Actions['action']
	// InitParams extends unknown[] = unknown[],
	// Name extends string = string,
	// T extends Actions['action'] = Actions['action'],
> {
	engineId: number
	action: ActionNames
	resolve: (value: unknown) => void
	reject: (value: unknown) => void
}

interface GlobalCtx<
	AdditionalActions extends ActionType = ActionType
	// Actions extends WorkerEngineActions = WorkerEngineActions
	// Promises extends WorkerEnginePromise = WorkerEnginePromise,
	// >
	// Actions extends WorkerEngineActions<InitParams, Name>,
	// InitParams extends unknown[] = unknown[],
	// Name extends string = string,
> {
	// engineId: number
	promises: (
		| WorkerEnginePromise<WorkerEngineActions>
		| WorkerEnginePromise<AdditionalActions>
	)[]
	lastCleanup: null | NodeJS.Timeout
	worker: Worker
	isWorkerReady: Promise<number>
}

export interface WorkerEngineClient<
	AdditionalActions extends ActionType = ActionType,
	Actions extends WorkerEngineActions = WorkerEngineActions
> {
	engineId: number
	worker: Worker
	isWorkerReady: Promise<number>
	onSituationChange?: (engineId: number) => void
	postMessage: <
		ActionNames extends Actions['action'] | AdditionalActions['action'],
		Action extends ActionNames extends Actions['action']
			? GetAction<Actions, ActionNames>
			: GetAction<AdditionalActions, ActionNames>
	>(
		action: ActionNames,
		...params: Action['params']
	) => Promise<Action['result']>
	terminate: () => void
	asyncSetSituation: (
		...params: GetAction<Actions, 'setSituation'>['params']
	) => Promise<GetAction<Actions, 'setSituation'>['result']>
	asyncEvaluate: (
		...params: GetAction<Actions, 'evaluate'>['params']
	) => Promise<GetAction<Actions, 'evaluate'>['result']>
	asyncGetRule: (
		...params: GetAction<Actions, 'getRule'>['params']
	) => Promise<GetAction<Actions, 'getRule'>['result']>
	asyncGetParsedRules: () => Promise<
		GetAction<Actions, 'getParsedRules'>['result']
	>
	asyncShallowCopy: (
		onSituationChange?: () => void
	) => Promise<WorkerEngineClient<AdditionalActions, Actions>>
	asyncDeleteShallowCopy: () => Promise<
		GetAction<Actions, 'deleteShallowCopy'>['result']
	>
}
// ReturnType<typeof createWorkerEngineClient<AdditionalActions>>

export const createWorkerEngineClient = <AdditionalActions extends ActionType>(
	worker: Worker,
	options: {
		initParams: GetAction<WorkerEngineActions, 'init'>['params']
		onSituationChange?: (engineId: number) => void
	}
) => {
	console.log('{createWorker}')

	const globalCtx: GlobalCtx<AdditionalActions> = {
		// engineId: 0,
		promises: [],
		lastCleanup: null,
		worker,
		isWorkerReady: null as unknown as Promise<number>, // will be set later in the function
	}

	worker.onmessageerror = function (e) {
		console.error('{onmessageerror}', e)
	}

	worker.onerror = function (e) {
		console.error('{onerror}')
		console.error(e)
		console.error(e.message)
	}

	const resolvePromise = (data: {
		id: number
		result?: unknown
		error?: string
	}) => {
		console.timeEnd(`execute-${data.id}`)
		if (data.id === 0) {
			console.timeEnd('loading')
		}

		if ('error' in data) {
			return globalCtx.promises[data.id].reject?.(data.error)
		}
		console.log('ctx.promises', globalCtx.promises.length, data, globalCtx)

		globalCtx.promises[data.id].resolve?.(data.result)
	}

	worker.onmessage = function (e: MessageEvent<unknown>) {
		const data = e.data

		console.log('{onmessage}', data)

		if (isObject(data)) {
			if (isId(data)) {
				resolvePromise(data)

				return
			} else if (isBatch(data)) {
				data.batch.forEach((d) => isObject(d) && isId(d) && resolvePromise(d))

				return
			}
		}

		console.error('{unknown message}', data)

		throw new Error('unknown message')
	}

	const { initParams, onSituationChange } = options

	// const engineId = 0
	// globalCtx.isWorkerReady = postMessage(
	// 	globalCtx,
	// 	engineId,
	// 	'init',
	// 	...initParams
	// )

	const workerEngine = workerEngineConstruct(globalCtx, {
		onSituationChange,
		engineId: 0,
	})

	workerEngine.postMessage('init', ...initParams)

	return workerEngine
}

/**
 * Post message to worker engine and return a promise to get the result,
 * if the promise is not resolved in 10 seconds, it will be rejected.
 * @param globalCtx
 * @param action
 * @param params
 */
const postMessage = async <
	AdditionalActions extends ActionType,
	// ActionNames extends WorkerEngineActions['action'],
	// Action extends GetAction<WorkerEngineActions, ActionNames>
	ActionNames extends
		| WorkerEngineActions['action']
		| AdditionalActions['action'],
	Action extends ActionNames extends WorkerEngineActions['action']
		? GetAction<WorkerEngineActions, ActionNames>
		: GetAction<AdditionalActions, ActionNames>
>(
	globalCtx: GlobalCtx<AdditionalActions>,
	engineId: number,
	action: ActionNames,
	...params: Action['params']
) => {
	const promiseTimeout = 10000
	const warning = setTimeout(() => {
		console.log(
			'{promise waiting for too long, aborting!}',
			engineId,
			action,
			params
		)
		globalCtx.promises[id].reject?.(new Error('timeout'))
	}, promiseTimeout)

	globalCtx.lastCleanup !== null && clearInterval(globalCtx.lastCleanup)
	globalCtx.lastCleanup = setTimeout(() => {
		if (globalCtx.promises.length) {
			console.log('{cleanup}', globalCtx.promises.length, engineId, globalCtx)
			globalCtx.promises = []
			globalCtx.lastCleanup = null
		}
	}, promiseTimeout * 2)

	console.log('id ctx.promises', globalCtx.promises.length, engineId, globalCtx)

	const id = globalCtx.promises.length
	console.time(`execute-${id}`)

	const stack = new Error().stack

	const promise = new Promise<Action['result']>((resolve, reject) => {
		globalCtx.promises[id] = {
			engineId,
			action,
			resolve: (...params: unknown[]) => {
				clearTimeout(warning)

				return resolve(...(params as Parameters<typeof resolve>))
			},
			reject: (err: unknown) => {
				clearTimeout(warning)

				console.error(err)
				console.error(stack)
				// console.error(new Error((err as Error).message, { cause: stack }))

				return reject(err)
			},
		}
	})

	const msg = { engineId, action, params, id }
	console.log('{postMessage}', msg)
	globalCtx.worker.postMessage(msg)

	return promise
}

/**
 */
const wrappedPostMessage =
	<AdditionalActions extends ActionType>(
		ctx: GlobalCtx<AdditionalActions>,
		engineId: number
	) =>
	<
		ActionNames extends
			| WorkerEngineActions['action']
			| AdditionalActions['action'],
		Action extends ActionNames extends WorkerEngineActions['action']
			? GetAction<WorkerEngineActions, ActionNames>
			: GetAction<AdditionalActions, ActionNames>
	>(
		action: ActionNames,
		...params: Action['params']
	) =>
		postMessage<AdditionalActions, ActionNames, Action>(
			ctx,
			engineId,
			action,
			...params
		)

/**
 */
const workerEngineConstruct = <AdditionalActions extends ActionType>(
	globalCtx: GlobalCtx<AdditionalActions>,
	options: {
		onSituationChange?: (engineId: number) => void
		engineId: number
	}
) => {
	type Action<T extends WorkerEngineActions['action']> = GetAction<
		WorkerEngineActions,
		T
	>

	const context = {
		engineId: options.engineId,
		worker: globalCtx.worker,
		isWorkerReady: globalCtx.isWorkerReady,
		onSituationChange: options.onSituationChange,
		postMessage: wrappedPostMessage(globalCtx, options.engineId),
		ctx: globalCtx,

		terminate: () => {
			context.worker.terminate()
			globalCtx.promises.forEach((promise) =>
				promise.reject?.('worker terminated')
			)
			globalCtx.promises = []
		},

		/**
		 * This function is used to set the situation in the worker with a specific engineId.
		 */
		asyncSetSituation: async (
			...params: Action<'setSituation'>['params']
		): Promise<Action<'setSituation'>['result']> => {
			const ret = await context.postMessage('setSituation', ...params)

			context.onSituationChange?.(context.engineId)

			return ret
		},

		/**
		 * This function is used to evaluate a publicodes expression in the worker with a specific engineId.
		 */
		asyncEvaluate: async (
			...params: Action<'evaluate'>['params']
		): Promise<Action<'evaluate'>['result']> => {
			const promise = await context.postMessage('evaluate', ...params)

			// console.trace('{asyncEvaluate}')

			return promise
		},

		/**
		 * This function is used to get a publicodes rule that is in the worker with a specific EngineId.
		 */
		asyncGetRule: async (
			...params: Action<'getRule'>['params']
		): Promise<Action<'getRule'>['result']> => {
			return await context.postMessage('getRule', ...params)
		},

		/**
		 * This function is used to get all the parsed rules in the worker with a specific engineId.
		 */
		asyncGetParsedRules: async (): Promise<
			Action<'getParsedRules'>['result']
		> => {
			return await context.postMessage('getParsedRules')
		},

		/**
		 * This function is used to shallow copy an engine in the worker with a specific engineId.
		 */
		asyncShallowCopy: async (
			onSituationChange: () => void = () => {}
		): Promise<WorkerEngineClient<AdditionalActions>> => {
			const engineId = await context.postMessage('shallowCopy')

			// const newCtx = { ...ctx, engineId }
			// newCtx.promises = ctx.promises
			const ret = workerEngineConstruct(globalCtx, {
				onSituationChange,
				engineId,
			})
			// ret.engineId = engineId
			// ret.postMessage = wrappedPostMessage({ ...globalCtx, engineId })

			return ret
		},

		/**
		 * This function is used to delete a shallow copy of an engine in the worker.
		 */
		asyncDeleteShallowCopy: async (): Promise<
			Action<'deleteShallowCopy'>['result']
		> => {
			console.log('{client deleteShallowCopy}', context)

			return context.postMessage('deleteShallowCopy')
		},
	}

	return context
}
