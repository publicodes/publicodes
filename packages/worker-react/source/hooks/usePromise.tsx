import React, {
	DependencyList,
	Suspense,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'

interface CachePending {
	status: 'pending'
	promise: Promise<void>
}

interface CacheError {
	status: 'error'
	promise: Promise<void>
	result: Error
}

interface CacheDone<T> {
	status: 'done'
	promise: Promise<void>
	result: T
}

type Cache<T> = CachePending | CacheError | CacheDone<T>

export const SuspensePromiseCtx = createContext<{
	cache: React.MutableRefObject<Cache<unknown>[]>
	index: React.MutableRefObject<number>
	done: React.MutableRefObject<boolean>
	isSSR: boolean
} | null>(null)

interface SuspensePromiseProps {
	isSSR: boolean
	children: React.ReactNode
	fallback?: React.ReactNode
}

/**
 * ...
 */
export const SuspensePromise = ({
	isSSR,
	children,
	fallback,
}: SuspensePromiseProps) => {
	const cache = useRef<Cache<unknown>[]>([])
	const index = useRef<number>(0)
	const done = useRef<boolean>(false)
	console.time('render')

	return (
		<SuspensePromiseCtx.Provider
			value={isSSR ? { cache, index, done, isSSR } : null}
		>
			<Suspense fallback={fallback}>
				{children}
				<Throw />
			</Suspense>
		</SuspensePromiseCtx.Provider>
	)
}

/**
 * ...
 */
const Throw = () => {
	const context = useContext(SuspensePromiseCtx)

	if (!context) {
		return null
	}
	const { cache, index, done } = context

	if (done.current) {
		return null
	}

	index.current = 0
	console.log('###### reset index')

	if (cache.current[cache.current.length - 1]?.status === 'pending') {
		// console.log('### Throw', [...cache.current], index.current, done.current)
		throw cache.current[cache.current.length - 1].promise
	}
	console.log('### DONE !!!')
	console.timeEnd('render')
	done.current = true
	cache.current = []

	return null
}

/**
 * ...
 */
const useThrowToSuspense = <T extends unknown>(promise: () => Promise<T>) => {
	const context = useContext(SuspensePromiseCtx)

	if (context && !context.done.current) {
		const { cache, index } = context
		const key = index.current

		if (cache.current[key - 1]?.status === 'pending') {
			throw cache.current[key - 1].promise
		}

		if (cache.current[key] === undefined) {
			const obj: Cache<T> = {
				status: 'pending',
				promise: promise()
					.then((res) => {
						obj.status = 'done'
						;(obj as CacheDone<T>).result = res
					})
					.catch((err) => {
						obj.status = 'error'
						;(obj as CacheError).result = err
					}),
			}

			cache.current.push(obj)
			index.current += 1

			console.log('### new key added', {
				key,
				cache,
				promise: promise.toString(),
			})

			throw obj.promise
		}
	}

	const key = context?.index.current ?? null
	const cache =
		(typeof key === 'number' && (context?.cache.current[key] as Cache<T>)) ||
		null

	if (cache?.status === 'pending') {
		throw cache.promise
	}
	if (cache?.status === 'error') {
		throw cache.result
	}

	return cache
}

/**
 * Executes an asynchronous function and returns its result (Returns the default value until the promise is completed).
 * The function is executed each time the dependencies change.
 */
export const usePromise = <T, Default = undefined>(
	promise: () => Promise<T>,
	deps: DependencyList,
	defaultValue?: Default
) => {
	const context = useContext(SuspensePromiseCtx)
	const cache = useThrowToSuspense(promise)

	console.log('### context', context?.cache.current.length)

	const [state, lazyPromise] = useLazyPromise(
		promise,
		deps,
		cache?.status === 'done' ? cache.result : defaultValue
	)

	if (context && cache?.status === 'done') {
		console.log(
			'### access cache ',
			promise.toString(),
			context.index.current,
			cache
		)
		if (context.isSSR) {
			context.cache.current = []
		} else {
			context.index.current += 1
		}
	}

	useEffect(() => void lazyPromise(), deps)

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
	defaultValue?: Default
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
