import EngineType from 'publicodes'
import type {
	ActionType,
	Config,
	GetAction,
	WorkerEngineActions,
} from './workerEngine'

/**
 * This file is a client to communicate with the worker engine.
 */

const isObject = (val: unknown): val is object =>
	typeof val === 'object' && val !== null

const isId = (val: object): val is { id: number } =>
	'id' in val && typeof val.id === 'number'

const isBatch = (val: object): val is { batch: unknown[] } =>
	'batch' in val && Array.isArray(val.batch)

/**
 * ...
 */
interface WorkerEnginePromise<
	Actions extends ActionType = ActionType,
	ActionNames extends Actions['action'] = Actions['action']
> {
	engineId: number
	action: ActionNames
	resolve: (value: unknown) => void
	reject: (value: unknown) => void
}

/**
 * ...
 */
interface GlobalCtx<AdditionalActions extends ActionType = ActionType> {
	promises: (
		| WorkerEnginePromise<WorkerEngineActions>
		| WorkerEnginePromise<AdditionalActions>
	)[]
	lastCleanup: null | NodeJS.Timeout
	worker: Worker
	isDefaultEngineReadyPromise: Promise<number>
}

/**
 * ...
 */
export const createWorkerEngineClient = <AdditionalActions extends ActionType>(
	worker: Worker,
	options: {
		initParams: GetAction<WorkerEngineActions, 'init'>['params']
		onSituationChange?: (engineId: number) => void
	}
) => {
	console.log('{createWorker}')

	const globalCtx: GlobalCtx<AdditionalActions> = {
		promises: [],
		lastCleanup: null,
		worker,
		// will be set later in the function
		isDefaultEngineReadyPromise: null as unknown as Promise<number>,
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
		if (data.id === 0) {
			console.timeEnd('loading')
		}

		if ('error' in data) {
			return globalCtx.promises[data.id].reject?.(data.error)
		}

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
 */
const postMessage = async <
	AdditionalActions extends ActionType,
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
	const PROMISE_TIMEOUT = 15_000
	const warning = setTimeout(() => {
		console.log(
			'{promise waiting for too long, aborting!}',
			engineId,
			action,
			params
		)
		globalCtx.promises[id].reject?.(new Error('timeout'))
	}, PROMISE_TIMEOUT)

	globalCtx.lastCleanup !== null && clearInterval(globalCtx.lastCleanup)
	globalCtx.lastCleanup = setTimeout(() => {
		if (globalCtx.promises.length) {
			console.log('{cleanup}', globalCtx.promises.length, engineId, globalCtx)
			globalCtx.promises = []
			globalCtx.lastCleanup = null
		}
	}, PROMISE_TIMEOUT * 2)

	const id = globalCtx.promises.length

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

				console.error(err, stack)

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
 * Wrap postMessage to link the context and the engineId that way
 * we don't have to pass it every time.
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
 * ...
 */
type ActionFunc<
	Actions extends ActionType,
	Action extends Actions['action']
> = (
	...params: GetAction<Actions, Action>['params']
) => Promise<GetAction<Actions, Action>['result']>

/**
 * ...
 */
export interface WorkerEngineClient<
	AdditionalActions extends ActionType = Config['additionalActions']
> {
	engineId: number
	worker: Worker
	isWorkerReady: Promise<number>
	onSituationChange?: (engineId: number) => void
	postMessage: <
		ActionNames extends
			| WorkerEngineActions['action']
			| AdditionalActions['action'],
		Action extends ActionNames extends WorkerEngineActions['action']
			? GetAction<WorkerEngineActions, ActionNames>
			: GetAction<AdditionalActions, ActionNames>
	>(
		action: ActionNames,
		...params: Action['params']
	) => Promise<Action['result']>
	terminate: () => void
	asyncSetSituation: ActionFunc<WorkerEngineActions, 'setSituation'>
	asyncEvaluate: ActionFunc<WorkerEngineActions, 'evaluate'>
	asyncGetRule: ActionFunc<WorkerEngineActions, 'getRule'>
	asyncGetParsedRules: ActionFunc<WorkerEngineActions, 'getParsedRules'>
	asyncShallowCopy: (
		onSituationChange?: () => void
	) => Promise<WorkerEngineClient<AdditionalActions>>
	asyncDeleteShallowCopy: ActionFunc<WorkerEngineActions, 'deleteShallowCopy'>

	/**
	 * Debug configuration type
	 * @private
	 * @readonly
	 */
	'~config'?: Config
}

type Action<T extends WorkerEngineActions['action']> = GetAction<
	WorkerEngineActions,
	T
>
class WorkerEngineClientImpl<
	Actions extends ActionType = Config['additionalActions']
> implements WorkerEngineClient
{
	engineId
	worker
	isWorkerReady
	onSituationChange
	postMessage
	private globalCtx: GlobalCtx<Actions>
	private parsedRules: ReturnType<EngineType['getParsedRules']> | undefined

	constructor(
		globalCtx: GlobalCtx<Actions>,
		options: {
			engineId: number
			onSituationChange?: (engineId: number) => void
		}
	) {
		this.engineId = options.engineId
		this.worker = globalCtx.worker
		this.isWorkerReady = globalCtx.isDefaultEngineReadyPromise
		this.onSituationChange = options.onSituationChange
		this.postMessage = wrappedPostMessage(globalCtx, options.engineId)
		this.globalCtx = globalCtx
		return this
	}

	terminate() {
		this.worker.terminate()
		this.globalCtx.promises.forEach((promise) =>
			promise.reject?.('worker terminated')
		)
		this.globalCtx.promises = []
	}

	/**
	 * Set the situation in the worker with a specific engineId.
	 */
	async asyncSetSituation(
		...params: Action<'setSituation'>['params']
	): Promise<Action<'setSituation'>['result']> {
		const ret = await this.postMessage('setSituation', ...params)

		this.onSituationChange?.(this.engineId)

		return ret
	}

	/**
	 * Evaluate a publicodes expression in the worker with a specific engineId.
	 */
	async asyncEvaluate(
		...params: Action<'evaluate'>['params']
	): Promise<Action<'evaluate'>['result']> {
		const promise = await this.postMessage('evaluate', ...params)

		// console.trace('{asyncEvaluate}')

		return promise
	}

	/**
	 * Get a publicodes rule that is in the worker with a specific EngineId.
	 */
	async asyncGetRule(
		...params: Action<'getRule'>['params']
	): Promise<Action<'getRule'>['result']> {
		return this.postMessage('getRule', ...params)
	}

	/**
	 * Get all the parsed rules in the worker with a specific engineId.
	 */
	async asyncGetParsedRules(): Promise<Action<'getParsedRules'>['result']> {
		if (!this.parsedRules) {
			this.parsedRules = await this.postMessage('getParsedRules')
		}
		return this.parsedRules
	}

	/**
	 * Shallow copy an engine in the worker with a specific engineId.
	 */
	async asyncShallowCopy(
		onSituationChange: () => void = () => {}
	): Promise<WorkerEngineClient<Actions>> {
		const engineId = await this.postMessage('shallowCopy')

		const ret = workerEngineConstruct(this.globalCtx, {
			onSituationChange,
			engineId,
		})

		return ret
	}

	/**
	 * Delete a shallow copy of an engine in the worker.
	 */
	async asyncDeleteShallowCopy(): Promise<
		Action<'deleteShallowCopy'>['result']
	> {
		console.log('{client deleteShallowCopy}', context)

		return this.postMessage('deleteShallowCopy')
	}
}

/**
 * ...
 */
const workerEngineConstruct = <AdditionalActions extends ActionType>(
	globalCtx: GlobalCtx<AdditionalActions>,
	options: {
		onSituationChange?: (engineId: number) => void
		engineId: number
	}
) => {
	console.log('bnihihiu')
	const workerEngine = new WorkerEngineClientImpl(globalCtx, options)

	return workerEngine
}

/**
 * Return true if the engine is a worker engine.
 */
export const isWorkerEngineClient = <
	E extends EngineType,
	W extends WorkerEngineClient
>(
	engine: E | W
): engine is W =>
	'worker' in engine &&
	'postMessage' in engine &&
	'isWorkerReady' in engine &&
	typeof engine.postMessage === 'function'
