import type EngineType from 'publicodes'

/**
 * This file run any publicodes engine in a web worker.
 */

/**
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

export type WorkerEngineActions<
	InitParams extends unknown[] = unknown[],
	Engine extends EngineType = EngineType
> =
	| ActionType<'init', InitParams, number>
	| ActionType<'setSituation', Parameters<Engine['setSituation']>, undefined>
	| ActionType<
			'evaluate',
			Parameters<Engine['evaluate']>,
			ReturnType<Engine['evaluate']>
	  >
	| ActionType<
			'getRule',
			Parameters<Engine['getRule']>,
			ReturnType<Engine['getRule']>
	  >
	| ActionType<'getParsedRules', [], ReturnType<Engine['getParsedRules']>>
	| ActionType<'shallowCopy', [], number>
	| ActionType<'deleteShallowCopy', [], undefined>

export type GetAction<
	Actions extends ActionType,
	Action extends Actions['action']
> = Extract<Actions, { action: Action }>

type BaseParams = {
	/**
	 * The id of the engine to use, the default engine is 0
	 */
	engineId?: number

	/**
	 * The id of the message, used to identify the response
	 */
	id: number
}

type DistributiveOmit<T, K extends keyof T> = T extends unknown
	? Omit<T, K>
	: never

type Params<Actions extends ActionType> = DistributiveOmit<
	Actions & BaseParams,
	'result'
>

// type Queue = (Params<Exclude<ActionType, { action: 'init' }>> & {
type Queue = Params<ActionType> & { engineId: number }
interface Ctx {
	engines: (EngineType | undefined)[]
	queue: Queue[]
	isDefaultEngineReady: boolean
	isDefaultEngineReadyPromise: Promise<void | boolean>
}

/**
 */
export const createWorkerEngine = <
	Engine extends EngineType = EngineType,
	InitParams extends unknown[] = unknown[],
	Actions extends WorkerEngineActions<InitParams, Engine> = WorkerEngineActions<
		InitParams,
		Engine
	>
>(
	init: (...params: InitParams) => Engine,
	additionalActions: ActionsDictionary = {} as ActionsDictionary
) => {
	console.log('[createWorkerEngine] additionalActions:', additionalActions)

	let setDefaultEngineReady: ((v: unknown) => void) | null = null
	const ctx: Ctx = {
		engines: [] as (Engine | undefined)[],
		queue: [] as Queue[],
		isDefaultEngineReady: false,
		isDefaultEngineReadyPromise: new Promise(
			(resolve) => (setDefaultEngineReady = resolve)
		).then(() => (ctx.isDefaultEngineReady = true)),
	}

	let timeout: NodeJS.Timeout | null = null
	onmessage = async (e) => {
		console.log('[onmessage]', e.data)

		const { engineId = 0, id, action, params } = e.data as Params<Actions>

		try {
			if (action === 'init') {
				// console.log('[init engine]')
				// const [{ basename }] = params
				try {
					// let rules = rawRules
					// if (basename === 'infrance') {
					// 	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					// 	rules = translateRules('en', ruleTranslations, rules)
					// }
					// engineFactory(rules)

					const engine = init(...params)

					const engineId = ctx.engines.length
					ctx.engines.push(engine)

					postMessage({ id, result: engineId })
					setDefaultEngineReady?.(true)
					console.log('[engine ready]', ctx.engines[engineId])
				} catch (e) {
					console.error('[error]', e)
					// postMessage('error')
				}

				return
			}

			await ctx.isDefaultEngineReady

			ctx.queue.push({ engineId, id, action, params } as Params<
				Exclude<Actions, { action: 'init' }>
			> & { engineId: number })

			if (timeout !== null) {
				return
			}

			// timeout !== null && clearTimeout(timeout)
			timeout = setTimeout(() => {
				const aborts: number[] = []
				const setSituationEncountered: boolean[] = []
				const filteredQueue = [...ctx.queue]
					.reverse()
					.filter(({ action, engineId, id }) => {
						if (action === 'setSituation')
							setSituationEncountered[engineId] = true

						const keep =
							!setSituationEncountered[engineId] ||
							(setSituationEncountered[engineId] && action !== 'evaluate')

						if (!keep) aborts.push(id)

						return keep
					})
					.reverse()

				console.log('[start queue]', ctx.queue, filteredQueue)

				if (filteredQueue.length) {
					console.time('bench')
					postMessage({
						batch: filteredQueue.map((params) => {
							try {
								// @ts-ignore
								const res = actions(ctx, additionalActions, params)

								return res
							} catch (error) {
								return { id: params.id, error }
							}
						}),
					})
					console.timeEnd('bench')
				}

				if (aborts.length) {
					const error = new Error(
						'aborts the action because the situation has changed'
					)
					postMessage({ batch: aborts.map((id) => ({ id, error })) })
				}

				ctx.queue = []
				timeout = null
			}, 50)
		} catch (error) {
			return postMessage({ id, error })
		}
	}
}

type ActionsDictionary<Actions extends ActionType = WorkerEngineActions> = {
	[Action in Actions['action']]: (
		engine: EngineType,
		...params: GetAction<Actions, Action>['params']
	) => GetAction<Actions, Action>['result']
}

type ActionsWithoutInit = Exclude<WorkerEngineActions, { action: 'init' }>

const actions = <
	// Actions extends WorkerEngineActions,
	AdditionalActions extends ActionsDictionary
	// Name extends string = string,
	// InitParams extends unknown[] = unknown[]
>(
	ctx: { engines: (EngineType | undefined)[] },
	additionalActions: AdditionalActions,
	data: Params<ActionsWithoutInit>
	// & { engines: EngineType[] }
) => {
	const { engineId = 0, id } = data

	const engine = ctx.engines[engineId]
	if (!engine) {
		throw new Error(`Engine does not exist (engineId: ${engineId}`)
	}

	// type Actions<Actns extends WorkerEngineActions<InitParams, Name>> = {
	// 	[Action in Exclude<Actns['action'], 'init'>]: (
	// 		...params: WorkerEngineAction<Actns, Action>['params']
	// 	) => WorkerEngineAction<Actns, Action>['result']
	// }

	type Simplify<T> = { [P in keyof T]: T[P] }

	// const yyy: MMM<Actions>['setSituation'] = () => void yyy()

	const actions: ActionsDictionary<ActionsWithoutInit> = {
		setSituation: (engine, ...params) => {
			// safeSetSituation(
			// 	engine,
			// 	({ situation, <faultyDottedName> }) => {
			// 		console.error('setSituation', { situation, faultyDottedName })
			// 	},
			// 	...params
			// )
			engine.setSituation(...params)

			// return
			// { id }
		},
		evaluate: (engine, ...params) => {
			const result = engine.evaluate(...params)
			console.log('[evaluate]', 'id:', id, 'result:', result)

			return result
		},
		getRule: (engine, ...params) => {
			const result = engine.getRule(...params)

			return result
		},
		getParsedRules: () => {
			const result = engine.getParsedRules()

			return result
		},
		shallowCopy: () => {
			ctx.engines.push(engine.shallowCopy())
			console.log('[shallowCopy]:', ctx.engines)

			return ctx.engines.length - 1
		},
		deleteShallowCopy: () => {
			if (engineId === 0) {
				throw new Error('Cannot delete the default engine')
			}

			ctx.engines[engineId] = undefined
			// ctx.engines = ctx.engines.splice(engineId, 1)

			console.log('[deleteShallowCopy] engines:', ctx.engines)
		},
	}

	const unknowAction = () => {
		console.log(`unknow action "${data.action}"`, {
			actions,
			additionalActions,
		})

		throw new Error(`unknow action "${data.action}"`)
	}

	const actionFunction =
		actions[data.action] ?? additionalActions[data.action] ?? unknowAction

	const result = actionFunction(
		engine,
		// @ts-expect-error
		...(data.params as Parameters<typeof actionFunction>)
	)

	return { id, result }
}

const actionsTest = {
	setSituation: (
		engine: EngineType,
		...params: Parameters<EngineType['setSituation']>
	) =>
		// Parameters<Engine<Name>['setSituation']>
		{
			// safeSetSituation(
			// 	engine,
			// 	({ situation, <faultyDottedName> }) => {
			// 		console.error('setSituation', { situation, faultyDottedName })
			// 	},
			// 	...params
			// )
			engine.setSituation(...params)

			return { id: 42 }
		},
	evaluate: (
		engine: EngineType,
		...params: Parameters<EngineType['evaluate']>
	) => {
		const result = engine.evaluate(...params)
		// console.log('[evaluate]', 'id:', id, 'result:', result)

		return result
	},
	// getRule: (engine: Engine, ...params) => {
	// 	const result = engine.getRule(...params)

	// 	return result
	// },
	// getParsedRules: () => {
	// 	const result = engine.getParsedRules()

	// 	return result
	// },
	// shallowCopy: () => {
	// 	ctx.engines.push(engine.shallowCopy())

	// 	return ctx.engines.length - 1
	// },
	// deleteShallowCopy: () => {
	// 	if (engineId === 0) {
	// 		throw new Error('Cannot delete the default engine')
	// 	}

	// 	delete ctx.engines[engineId]
	// 	ctx.engines = ctx.engines.splice(engineId, 1)

	// 	console.log('[engines]', ctx.engines)
	// },
}
//  satisfies AZE;

// type XXX = { [k: string]: (engine: Engine, ...params: any[]) => unknown }
export type AZE = {
	[k: string]: (engine: EngineType, ...params: any[]) => unknown
}
export type Test<
	Obj extends AZE,
	Key extends keyof Obj = keyof Obj
> = Key extends string
	? // { action: Key; params: FilterFirst<Parameters<Obj[Key]>> }
	  //   & BaseParams
	  ActionType<Key, FilterFirst<Parameters<Obj[Key]>>, ReturnType<Obj[Key]>>
	: never

// const yyy: Test<typeof actionsTest>

type FilterFirst<T extends unknown[]> = T extends []
	? []
	: T extends [infer H, ...infer R]
	? R
	: []

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
