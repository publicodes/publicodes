import {
  add,
  eq,
  gte,
  lt,
  lte,
  mul,
  or,
  sub,
  neg,
  and,
} from '../auto-entrepreneur/js-output/runtime.js'

export default class Engine {
  traversedParameters = new Set()
  cache

  constructor(cache = false) {
    this.cache = cache ? {} : null
  }

  evaluate(ruleName, ctx) {
    this.traversedParameters = new Set()

    const value = this.ref(ruleName, ctx)
    const traversedParameters = Array.from(this.traversedParameters)
    const missingParameters = traversedParameters.filter(
      (param) => !(param in ctx),
    )

    return {
      value,
      traversedParameters,
      missingParameters,
    }
  }

  get(rule, ctx) {
    this.traversedParameters.add(rule)
    return ctx[rule]
  }

  get(rule, ctx) {
    this.traversedParameters.add(rule)
    return ctx[rule]
  }

  ref(rule, ctx = {}) {
    if (rule in ctx) {
      return ctx[rule]
    }

    const f = this.rules[rule]
    if (typeof f !== 'function') {
      return f
    }

    if (this.cache) {
      const cache = this.cache[rule] ?? new WeakMap()

      if (cache.has(ctx)) {
        return cache.get(ctx)
      }
      const value = f(ctx)
      cache.set(ctx, value)
      this.cache[rule] = cache
      console.log(rule, ', value = ', value)
      return value
    }

    return f(ctx)
  }

  rules = {
    'exemples . CA élevé': (ctx) =>
      ((ctx) => this.ref('revenu net', ctx))({
        ...ctx,
        "chiffre d'affaires . TJM": 600.0,
      }),
    cotisations: (ctx) =>
      mul(
        mul(this.ref('cotisations . taux', ctx), () =>
          this.ref("chiffre d'affaires", ctx),
        ),
        () => 0.01,
      ),
    'auto-entrepreneur': (ctx) =>
      this.get('auto-entrepreneur', ctx) === undefined ?
        false
      : this.get('auto-entrepreneur', ctx),
    'revenu net': (ctx) =>
      add(this.ref("chiffre d'affaires", ctx), () =>
        add(-this.ref('cotisations', ctx), () =>
          add(-this.ref('charges', ctx), () => 0.0),
        ),
      ),
    "chiffre d'affaires": (ctx) =>
      mul(this.ref("chiffre d'affaires . TJM", ctx), () =>
        mul(this.ref("chiffre d'affaires . nombre de jour", ctx), () => 1.0),
      ),
    "chiffre d'affaires . nombre de jour": (ctx) =>
      this.get("chiffre d'affaires . nombre de jour", ctx) === undefined ?
        16.0
      : this.get("chiffre d'affaires . nombre de jour", ctx),
    exemples: (ctx) => this.get('exemples', ctx),
    "chiffre d'affaires . TJM": (ctx) =>
      this.get("chiffre d'affaires . TJM", ctx),
    'cotisations . taux': (ctx) =>
      (
        or(
          eq(this.ref('auto-entrepreneur', ctx), () => null),
          () => eq(this.ref('auto-entrepreneur', ctx), () => false),
        )
      ) ?
        45.0
      : 30.0,
    charges: (ctx) =>
      (
        or(
          eq(this.ref('auto-entrepreneur', ctx), () => false),
          () => this.ref('auto-entrepreneur', ctx) === undefined,
        )
      ) ?
        this.get('charges', ctx) === undefined ?
          (
            and(
              neg(100.0, () => null),
              () =>
                gt(
                  mul(
                    mul(10.0, () => this.ref("chiffre d'affaires", ctx)),
                    () => 0.01,
                  ),
                  () => 100.0,
                ),
            )
          ) ?
            100.0
          : mul(
              mul(10.0, () => this.ref("chiffre d'affaires", ctx)),
              () => 0.01,
            )
        : this.get('charges', ctx)
      : null,
  }
}
