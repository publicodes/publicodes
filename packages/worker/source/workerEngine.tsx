import EngineType from 'publicodes'

/**
 * This file run any publicodes engine in a web worker.
 */

type MergeBy<T, K> = Omit<T, keyof K> & K

type DistributiveOmit<T, K extends keyof T> = T extends unknown
	? Omit<T, K>
	: never

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

/**
 * ...
 */
export type Config = MergeBy<DefaultConfig, UserConfig>

/**
 * ...
 */
export interface ActionType<
	ActionName extends string = string,
	Params extends unknown[] = unknown[],
	Result = unknown
> {
	action: ActionName
	params: Params
	result: Result
}

/**
 * Get action by action name from actions (union of ActionType)
 * @example GetAction<ActionType<'a', [], 1> | ActionType<'b', [], 2>, 'a'> // return: ActionType<'a', [], 1>
 */
export type GetAction<
	Actions extends ActionType,
	Action extends Actions['action']
> = Extract<Actions, { action: Action }>

/**
 * Basic parameters added to the action by the client
 */
interface BaseParams {
	/**
	 * The id of the message, used to identify the response
	 */
	id: number

	/**
	 * The id of the engine to use, the default engine is 0
	 */
	engineId?: number
}

/**
 * Returns the action parameters received from the client with no result
 * @example Params<ActionType<'a', [], 1> | ActionType<'b', [], 2>>
 * 		// return: { action: 'a', params: [], id: number, engineId?: number } | { action: 'b', params: [], id: number, engineId?: number }
 */
type Params<Actions extends ActionType> = DistributiveOmit<
	Actions & BaseParams,
	'result'
>

/**
 * Like Params but with engineId defined
 */
type Queue<Action extends ActionType = ActionType> = Params<Action> & {
	engineId: number
}

/**
 * Context of the worker
 */
interface Context<
	Cfg extends Config = Config,
	Engine extends Cfg['engine'] = Cfg['engine'],
	Dictionary extends GenericActionsDictionary<Cfg> = GenericActionsDictionary<Cfg>
> {
	/**
	 * List of engines, shallow copy are saved here too
	 */
	engines: (Engine | undefined)[]
	/**
	 * List of actions to execute, we try to batch them for better performance
	 */
	queue: Queue[]
	/**
	 * Promise resolved when the default engine is ready
	 */
	isDefaultEngineReadyPromise: Promise<number>
	/**
	 * Is the default engine ready
	 */
	isDefaultEngineReady: boolean
	/**
	 * Internal function to resolve the default engine promise
	 * @private
	 */
	triggerDefaultEngineReady: ((v: number) => void) | null
	/**
	 * Every actions available in the worker
	 */
	actions: Dictionary
}

/**
 * Create a worker engine, required a function to init the default engine.
 * You can add additional actions to the engine with the second parameter.
 */
export const createWorkerEngine = <
	InitParams extends unknown[] = unknown[],
	Cfg extends Config = Config,
	Engine extends Cfg['engine'] = Cfg['engine'],
	AddActionsDictionary extends GenericActionsDictionary = {}
>(
	init: (...params: InitParams) => Engine,
	additionalActions: AddActionsDictionary = {} as AddActionsDictionary
) => {
	type ActionsDictionary = MergeBy<
		AddActionsDictionary,
		WorkerEngineActionsDictionary
	>
	type Actions = GenerateActions<AddActionsDictionary> | LocalActions

	console.log('[createWorkerEngine] additionalActions:', additionalActions)

	const ctx: Context<Cfg, Engine, ActionsDictionary> = {
		engines: [] as (Engine | undefined)[],
		queue: [] as Queue[],
		triggerDefaultEngineReady: null,
		isDefaultEngineReady: false,
		isDefaultEngineReadyPromise:
			null as unknown as Context['isDefaultEngineReadyPromise'],
		actions: {} as ActionsDictionary,
	}

	ctx.isDefaultEngineReadyPromise = new Promise<number>(
		(resolve) => (ctx.triggerDefaultEngineReady = resolve)
	).then((x) => ((ctx.isDefaultEngineReady = true), x))

	ctx.actions = {
		...additionalActions,
		...internalActions(ctx),
	}

	let timeout: ReturnType<typeof setTimeout> | null = null
	const onMessage = async (e: MessageEvent) => {
		const sendMessage = postMessage
		console.log('[onmessage]', e.data)

		const {
			id,
			action,
			engineId = 0,
			params,
		} = e.data as Params<Actions | InitAction<InitParams>>

		try {
			if (action === 'init') {
				if (!ctx.isDefaultEngineReady) {
					const engine = init(...(params as InitParams))

					const engineId = ctx.engines.length
					ctx.engines.push(engine)

					ctx.triggerDefaultEngineReady?.(engineId)
					console.log('[engine ready]')

					return sendMessage({
						id,
						result: { engineId, parsedRules: engine.getParsedRules() },
					})
				}
				throw new Error("Initilisation already done, can't init twice")
			}

			await ctx.isDefaultEngineReadyPromise

			ctx.queue.push({ id, action, engineId, params } as Queue<Actions>)

			if (timeout !== null) {
				return
			}

			const WAITING_TIME_TO_START = 50

			timeout = setTimeout(() => {
				const aborts: number[] = []
				const setSituationEncountered: boolean[] = []
				const filteredQueue = [...ctx.queue]
					.reverse()
					.filter(({ action, engineId, id }) => {
						if (action === 'setSituation') {
							setSituationEncountered[engineId] = true
						}

						const keep =
							!setSituationEncountered[engineId] ||
							(setSituationEncountered[engineId] && action !== 'evaluate')

						if (!keep) {
							aborts.push(id)
						}

						return keep
					})
					.reverse()

				if (filteredQueue.length) {
					console.log(
						'[start queue] filteredQueue:',
						filteredQueue,
						'aborts:',
						aborts
					)

					const batch = filteredQueue.map((data, i) => {
						try {
							return executeAction(ctx, data)
						} catch (error) {
							return { id: data.id, error }
						}
					})

					sendMessage({ batch })

					console.log('[done]')
				}

				if (aborts.length) {
					const error = new Error(
						'aborts the action because the situation has changed'
					)
					sendMessage({ batch: aborts.map((id) => ({ id, error })) })
				}

				ctx.queue = []
				timeout = null
				console.log('[end queue]')
			}, WAITING_TIME_TO_START)
		} catch (error) {
			return sendMessage({ id, error })
		}
	}

	addEventListener('message', onMessage)
}

/**
 * Execute an action
 */
const executeAction = <AddActionsDictionary extends GenericActionsDictionary>(
	ctx: Context,
	data: Params<GenerateActions<AddActionsDictionary> | LocalActions>
) => {
	const { engineId = 0, id } = data

	const engine = ctx.engines[engineId]
	if (!engine) {
		throw new Error(`Engine does not exist (engineId: ${engineId})`)
	}

	const unknowAction = () => {
		throw new Error(`unknow action "${data.action}"`)
	}

	const execAction = ctx.actions[data.action] ?? unknowAction

	console.log('[action start]', data.action)

	const result = execAction(
		{ id, engine, engineId },
		...(data.params as FilterFirst<Parameters<typeof execAction>>)
	)

	console.log('[action done]', data.action)

	return { id, result }
}

/**
 * First parameters of every actions
 */
export interface ActionData<
	Cfg extends Config = Config,
	Engine extends Cfg['engine'] = Cfg['engine']
> {
	engine: Engine
	engineId: number
	id: number
}

/**
 * Dictionary of actions
 */
export type GenericActionsDictionary<Cfg extends Config = Config> = {
	[k: string]: (data: ActionData<Cfg>, ...params: any[]) => unknown
}

/**
 * Generate ActionType from a dictionary of actions
 */
export type GenerateActions<
	Obj extends GenericActionsDictionary,
	Key extends keyof Obj = keyof Obj
> = Key extends string
	? ActionType<Key, FilterFirst<Parameters<Obj[Key]>>, ReturnType<Obj[Key]>>
	: never

/**
 * Filter the first element of a tuple
 */
export type FilterFirst<T extends unknown[]> = T extends []
	? []
	: T extends [infer H, ...infer R]
	? R
	: []

/**
 * Internal actions
 */
const internalActions = <
	Ctx extends Context,
	Cfg extends Config = Config,
	Engine extends Cfg['engine'] = Cfg['engine']
>(
	ctx: Ctx
) => ({
	setSituation: (
		{ engine }: ActionData<Cfg>,
		...params: Parameters<Engine['setSituation']>
	) => {
		engine.setSituation(...(params as Parameters<typeof engine.setSituation>))
	},

	evaluate: (
		{ engine, id }: ActionData<Cfg>,
		...params: Parameters<Engine['evaluate']>
	) => {
		const result = engine.evaluate(
			...(params as Parameters<typeof engine.evaluate>)
		)
		console.log('[evaluate]', 'id:', id, 'result:', result)

		return result
	},

	getRule: (
		{ engine }: ActionData<Cfg>,
		...params: Parameters<Engine['getRule']>
	) => {
		const result = engine.getRule(
			...(params as Parameters<typeof engine.getRule>)
		)

		return result
	},

	getParsedRules: ({ engine }: ActionData<Cfg>) => {
		const result = engine.getParsedRules()

		return result
	},

	shallowCopy: ({ engine }: ActionData<Cfg>) => {
		ctx.engines.push(engine.shallowCopy())
		console.log('[shallowCopy]:', ctx.engines)

		return ctx.engines.length - 1
	},

	deleteShallowCopy: ({ engineId }: ActionData<Cfg>) => {
		if (engineId === 0) {
			throw new Error('Cannot delete the default engine')
		}

		ctx.engines[engineId] = undefined

		console.log('[deleteShallowCopy] engines:', ctx.engines)
	},
})

/**
 * Dictionary of actions available in the worker
 */
type WorkerEngineActionsDictionary = ReturnType<typeof internalActions<Context>>

/**
 * Init action
 */
type InitAction<InitParams extends unknown[] = unknown[]> = ActionType<
	'init',
	InitParams,
	{
		engineId: number
		parsedRules: ReturnType<EngineType['getParsedRules']>
	}
>

/**
 * Actions available in the worker with init action
 */
type LocalActions = GenerateActions<WorkerEngineActionsDictionary>

/**
 * Actions available in the worker
 */
export type WorkerEngineActions<InitParams extends unknown[] = unknown[]> =
	| GenerateActions<WorkerEngineActionsDictionary>
	| InitAction<InitParams>

/**
 * Add a base to a string
 * @example AddBase<'base', 'a'> // return: 'base.a'
 */
type AddBase<A extends string, B extends string> = `${A}.${B}`

/**
 * Add a base to every keys of an object
 * @example addBase<'base', { a: 1, b: 2 }>('base', { a: 1, b: 2 }) // return: { 'base.a': 1, 'base.b': 2 }
 */
export const addBase = <
	const Base extends string,
	Obj extends { [k: string]: unknown },
	Keys extends keyof Obj & string
>(
	base: Base,
	actions: Obj
) =>
	Object.fromEntries(
		Object.entries(actions).map(([key, fun]) => [base + '.' + key, fun])
	) as { [K in AddBase<Base, Keys>]: Obj[Keys] }
