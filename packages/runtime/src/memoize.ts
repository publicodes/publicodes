/**
 * Optimized memoization for functions with 3 arguments where only the last two change
 */

export class Memoizer<T1, T2, R> {
  private cache = new Map<T1, Map<T2, R>>()
  constructor(private fn: (arg1: T1, arg2: T2) => R) {}

  call(arg1: T1, arg2: T2): R {
    let level1Cache = this.cache.get(arg1)
    if (!level1Cache) {
      level1Cache = new Map<T2, R>()
      this.cache.set(arg1, level1Cache)
    }

    if (level1Cache.has(arg2)) {
      return level1Cache.get(arg2)!
    }

    const result = this.fn(arg1, arg2)
    level1Cache.set(arg2, result)
    return result
  }

  reset() {
    this.cache.clear()
  }
}
