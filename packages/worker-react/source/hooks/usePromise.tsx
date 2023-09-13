import React, {
	DependencyList,
	Suspense,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	use,
	useState,
} from 'react'

// interface CachePending {
// 	status: 'pending'
// 	promise: Promise<void>
// }

// interface CacheError {
// 	status: 'error'
// 	promise: Promise<void>
// 	result: Error
// }

// interface CacheDone<T> {
// 	status: 'done'
// 	promise: Promise<void>
// 	result: T
// }

// type Cache<T> = CachePending | CacheError | CacheDone<T>

// export const SuspensePromiseCtx = createContext<{
// 	cache: React.MutableRefObject<Cache<unknown>[]>
// 	index: React.MutableRefObject<number>
// 	done: React.MutableRefObject<boolean>
// 	isSSR: boolean
// } | null>(null)

// interface SuspensePromiseProps {
// 	isSSR: boolean
// 	/**
// 	 * Activate Suspense in the browser too.
// 	 * By default, Suspense is only active in SSR mode.
// 	 */
// 	activateInBrowser?: boolean
// 	children: React.ReactNode
// 	fallback?: React.ReactNode
// }

/**
 * ...
 */
// export const SuspensePromise = ({
// isSSR,
// 	activateInBrowser,
// 	children,
// 	fallback,
// }: SuspensePromiseProps) => {
// 	// const context = useContext(SuspensePromiseCtx)
// 	// console.log('PARENT CTX', context)

// 	const cache = useRef<Cache<unknown>[]>([])
// 	const index = useRef<number>(0)
// 	const done = useRef<boolean>(false)
// 	console.time('render')

// 	return (
// 		<SuspensePromiseCtx.Provider
// 			value={isSSR || activateInBrowser ? { cache, index, done, isSSR } : null}
// 		>
// 			<Suspense fallback={fallback}>
// 				{children}
// 				<Throw />
// 			</Suspense>
// 		</SuspensePromiseCtx.Provider>
// 	)
// }

/**
 * ...
 */
// const Throw = () => {
// 	const context = useContext(SuspensePromiseCtx)

// 	if (!context) {
// 		return null
// 	}
// 	const { cache, index, done } = context

// 	if (done.current) {
// 		return null
// 	}

// 	index.current = 0
// 	console.log('###### reset index')

// 	if (cache.current[cache.current.length - 1]?.status === 'pending') {
// 		// console.log('### Throw', [...cache.current], index.current, done.current)
// 		cache.current[cache.current.length - 1].promise.then(() =>
// 			console.log('### LAST PROMISE DONE !!!')
// 		)
// 		throw cache.current[cache.current.length - 1].promise
// 	}
// 	console.log('### DONE !!!')
// 	console.timeEnd('render')
// 	done.current = true
// 	cache.current = []

// 	return null
// }

/**
 * ...
 */
// const useThrowToSuspense = <T extends unknown>(promise: () => Promise<T>) => {
// 	const context = useContext(SuspensePromiseCtx)

// 	if (context && !context.done.current) {
// 		const { cache, index } = context
// 		const key = index.current

// 		if (cache.current[key - 1]?.status === 'pending') {
// 			throw cache.current[key - 1].promise
// 		}

// 		if (cache.current[key] === undefined) {
// 			const obj: Cache<T> = {
// 				status: 'pending',
// 				promise: promise()
// 					.then((res) => {
// 						obj.status = 'done'
// 						;(obj as CacheDone<T>).result = res
// 					})
// 					.catch((err) => {
// 						obj.status = 'error'
// 						;(obj as CacheError).result = err
// 					}),
// 			}

// 			cache.current.push(obj)
// 			index.current += 1

// 			console.log('### new key added', {
// 				key,
// 				cache,
// 				promise: promise.toString(),
// 			})

// 			throw obj.promise
// 		}
// 	}

// 	const key = context?.index.current ?? null
// 	const cache =
// 		(typeof key === 'number' && (context?.cache.current[key] as Cache<T>)) ||
// 		null

// 	if (cache?.status === 'pending') {
// 		throw cache.promise
// 	}
// 	if (cache?.status === 'error') {
// 		throw cache.result
// 	}

// 	return cache
// }

const PromiseSSRCtx = createContext<boolean>(false)

export const PromiseSSR = ({ children }: { children: React.ReactNode }) => {
	return (
		<PromiseSSRCtx.Provider value={true}>{children}</PromiseSSRCtx.Provider>
	)
}

/**
 * Executes an asynchronous function and returns its result (Returns the default value until the promise is completed).
 * The function is executed each time the dependencies change.
 */
export const usePromise = <T, Default = undefined>(
	promise: () => Promise<T>,
	deps: DependencyList,
	defaultValue?: Default | (() => Default)
) => {
	const isSSR = useContext(PromiseSSRCtx)
	const id = useRef(Math.random())

	// console.log('firstRender.current', id.current, firstRender.current)

	// firstRender.current ? console.log('===> USE') : console.log('===> not USE')

	// const defaultValue = useRef<T>(

	// )

	// console.log('end firstRender.current', firstRender.current)

	const firstRender = useRef(true)
	const [state, lazyPromise] = useLazyPromise(
		promise,
		deps,
		isSSR && firstRender.current
			? use(
					promise()
					// new Promise((res) => {
					// 	console.log('===> use in usePromise start', id.current)

					// 	const ret = .then((v) => {
					// 		console.log(
					// 			'===> use in usePromise end',
					// 			id.current,
					// 			firstRender.current,
					// 			v
					// 		)

					// 		return v
					// 	})
					// 	res(ret)
					// })
			  )
			: defaultValue
	)
	firstRender.current = false

	// console.log('#STATE#', id.current, state, defaultValue.current)

	const isFirst = useRef(true)
	useEffect(() => {
		isFirst.current ? null : void lazyPromise()
		isFirst.current = false
	}, deps)

	return state
}

/**
 * Return a typed tuple.
 */
const tuple = <T extends unknown[]>(args: [...T]): T => args

/**
 * Execute an asynchronous function and return its result (Return default value if the promise is not finished).
 * Use this hook if you want to fire the promise manually.
 */
export const useLazyPromise = <
	T,
	Params extends unknown[],
	Default = undefined
>(
	promise: (...params: Params) => Promise<T>,
	deps: DependencyList,
	defaultValue?: Default | (() => Default)
) => {
	const [state, setState] = useState<T | Default>(defaultValue as Default)

	const lazyPromise = useCallback(
		async (...params: Params) => {
			const result = await promise(...params)
			setState(result)

			return result as T
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		deps
	)

	return tuple([state, lazyPromise])
}
