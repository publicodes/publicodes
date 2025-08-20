import { add, eq, gte, lt, lte, mul, or, sub, neg, and } from './runtime.js'

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

  ref(rule, ctx = {}) {
    // if (rule in ctx) {
    //   return ctx[rule]
    // }
    // We cannot do that as it is not correct:
    // - The rule won't appear in missingParameters
    // - The value of the context can change with some mecanisms (e.g. plafond, arrondi, unité)

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
      return value
    }

    return f(ctx)
  }

  rules = {
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base . taux de répartition': 41.8,
    'entreprise . activité': (ctx) => ctx['entreprise . activité'],
    'dirigeant . auto-entrepreneur . DROM': (ctx) =>
      (
        or(
          eq(
            this.ref('établissement . commune . département . outre-mer', ctx),
            () => false,
          ),
          () =>
            this.ref(
              'établissement . commune . département . outre-mer',
              ctx,
            ) === undefined,
        )
      ) ?
        null
      : true,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . invalidité-décès':
      (ctx) =>
        add(
          this.ref(
            'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès',
            ctx,
          ),
          () =>
            add(
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès',
                ctx,
              ),
              () =>
                add(
                  this.ref(
                    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès',
                    ctx,
                  ),
                  () =>
                    add(
                      this.ref(
                        'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès',
                        ctx,
                      ),
                      () => 0.0,
                    ),
                ),
            ),
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . CFP': (
      ctx,
    ) =>
      add(
        mul(
          mul(this.ref("entreprise . chiffre d'affaires . BIC", ctx), () =>
            mul(
              (
                or(
                  eq(
                    eq(
                      this.ref('entreprise . activité . nature', ctx),
                      () => 'artisanale',
                    ),
                    () => null,
                  ),
                  () =>
                    eq(
                      eq(
                        this.ref('entreprise . activité . nature', ctx),
                        () => 'artisanale',
                      ),
                      () => false,
                    ),
                )
              ) ?
                0.1
              : 0.3,
              () => 1.0,
            ),
          ),
          () => 0.01,
        ),
        () =>
          add(
            mul(
              mul(
                this.ref("entreprise . chiffre d'affaires . service BNC", ctx),
                () =>
                  mul(
                    (
                      or(
                        eq(
                          and(
                            lt(
                              this.ref('date', ctx),
                              () => new Date('2022-01'),
                            ),
                            () =>
                              and(
                                eq(
                                  this.ref(
                                    'dirigeant . auto-entrepreneur . Cipav',
                                    ctx,
                                  ),
                                  () => false,
                                ),
                                () => true,
                              ),
                          ),
                          () => null,
                        ),
                        () =>
                          eq(
                            and(
                              lt(
                                this.ref('date', ctx),
                                () => new Date('2022-01'),
                              ),
                              () =>
                                and(
                                  eq(
                                    this.ref(
                                      'dirigeant . auto-entrepreneur . Cipav',
                                      ctx,
                                    ),
                                    () => false,
                                  ),
                                  () => true,
                                ),
                            ),
                            () => false,
                          ),
                      )
                    ) ?
                      0.2
                    : 0.1,
                    () => 1.0,
                  ),
              ),
              () => 0.01,
            ),
            () => 0.0,
          ),
      ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions . taux de répartition': 29.7,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions . taux de répartition':
      (ctx) =>
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2024-07')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2024-07')),
                () => false,
              ),
          )
        ) ?
          36.3
        : 34.0,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    établissement: (ctx) => ctx['établissement'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès . taux de répartition':
      (ctx) =>
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2026-01')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2026-01')),
                () => false,
              ),
          )
        ) ?
          (
            or(
              eq(
                gte(this.ref('date', ctx), () => new Date('2025-01')),
                () => null,
              ),
              () =>
                eq(
                  gte(this.ref('date', ctx), () => new Date('2025-01')),
                  () => false,
                ),
            )
          ) ?
            (
              or(
                eq(
                  gte(this.ref('date', ctx), () => new Date('2024-07')),
                  () => null,
                ),
                () =>
                  eq(
                    gte(this.ref('date', ctx), () => new Date('2024-07')),
                    () => false,
                  ),
              )
            ) ?
              4.1
            : 3.7
          : 3.5
        : 3.25,
    rémunération: (ctx) => ctx['rémunération'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement':
      (ctx) =>
        mul(
          mul(
            this.ref(
              "entreprise . chiffre d'affaires . vente restauration hébergement",
              ctx,
            ),
            () =>
              mul(
                this.ref(
                  'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux',
                  ctx,
                ),
                () => 1.0,
              ),
          ),
          () => 0.01,
        ),
    entreprise: (ctx) => ctx['entreprise'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite':
      (ctx) =>
        add(
          this.ref(
            'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite de base',
            ctx,
          ),
          () =>
            add(
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite complémentaire',
                ctx,
              ),
              () => 0.0,
            ),
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . maladie-maternité':
      (ctx) =>
        add(
          this.ref(
            'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité',
            ctx,
          ),
          () =>
            add(
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité',
                ctx,
              ),
              () =>
                add(
                  this.ref(
                    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité',
                    ctx,
                  ),
                  () =>
                    add(
                      this.ref(
                        'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité',
                        ctx,
                      ),
                      () => 0.0,
                    ),
                ),
            ),
        ),
    'revenu imposable': (ctx) => ctx['revenu imposable'],
    'dirigeant . auto-entrepreneur . impôt . versement libératoire . montant': (
      ctx,
    ) =>
      add(
        mul(
          mul(
            this.ref(
              "entreprise . chiffre d'affaires . vente restauration hébergement",
              ctx,
            ),
            () => mul(1.0, () => 1.0),
          ),
          () => 0.01,
        ),
        () =>
          add(
            mul(
              mul(
                this.ref("entreprise . chiffre d'affaires . service BIC", ctx),
                () => mul(1.7, () => 1.0),
              ),
              () => 0.01,
            ),
            () =>
              add(
                mul(
                  mul(
                    this.ref(
                      "entreprise . chiffre d'affaires . service BNC",
                      ctx,
                    ),
                    () => mul(2.2, () => 1.0),
                  ),
                  () => 0.01,
                ),
                () => 0.0,
              ),
          ),
      ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux vente': 0.37,
    'dirigeant . auto-entrepreneur . DROM . seconde période': (ctx) =>
      lte(
        this.ref("entreprise . durée d'activité . années civiles", ctx),
        () => 3.0,
      ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité . taux de répartition': 8.9,
    'dirigeant . auto-entrepreneur . Acre . taux service BIC': (ctx) =>
      mul(
        mul(
          this.ref('dirigeant . auto-entrepreneur . Acre . taux Acre', ctx),
          () =>
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux',
              ctx,
            ),
        ),
        () => 0.01,
      ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité . taux de répartition':
      (ctx) =>
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2026-01')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2026-01')),
                () => false,
              ),
          )
        ) ?
          (
            or(
              eq(
                gte(this.ref('date', ctx), () => new Date('2025-01')),
                () => null,
              ),
              () =>
                eq(
                  gte(this.ref('date', ctx), () => new Date('2025-01')),
                  () => false,
                ),
            )
          ) ?
            (
              or(
                eq(
                  gte(this.ref('date', ctx), () => new Date('2024-07')),
                  () => null,
                ),
                () =>
                  eq(
                    gte(this.ref('date', ctx), () => new Date('2024-07')),
                    () => false,
                  ),
              )
            ) ?
              3.9
            : 3.6
          : 3.4
        : 3.0,
    'dirigeant . auto-entrepreneur . revenu net': (ctx) =>
      sub(this.ref("entreprise . chiffre d'affaires", ctx), () =>
        this.ref(
          'dirigeant . auto-entrepreneur . cotisations et contributions',
          ctx,
        ),
      ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . formation professionnelle':
      (ctx) =>
        this.ref(
          'dirigeant . auto-entrepreneur . cotisations et contributions . CFP',
          ctx,
        ),
    'dirigeant . auto-entrepreneur . DROM . taux CIPAV': (ctx) =>
      (
        or(
          eq(
            this.ref(
              'dirigeant . auto-entrepreneur . DROM . première période',
              ctx,
            ),
            () => null,
          ),
          () =>
            eq(
              this.ref(
                'dirigeant . auto-entrepreneur . DROM . première période',
                ctx,
              ),
              () => false,
            ),
        )
      ) ?
        (
          or(
            eq(
              this.ref(
                'dirigeant . auto-entrepreneur . DROM . seconde période',
                ctx,
              ),
              () => null,
            ),
            () =>
              eq(
                this.ref(
                  'dirigeant . auto-entrepreneur . DROM . seconde période',
                  ctx,
                ),
                () => false,
              ),
          )
        ) ?
          14.2
        : 10.6
      : 7.1,
    "entreprise . chiffre d'affaires . vente restauration hébergement": (ctx) =>
      ctx["entreprise . chiffre d'affaires . vente restauration hébergement"],
    date: (ctx) => ctx['date'],
    'dirigeant . auto-entrepreneur . Acre . taux Acre': (ctx) =>
      (
        or(
          eq(
            lt(
              this.ref('entreprise . date de création', ctx),
              () => new Date('2019-04-01'),
            ),
            () => null,
          ),
          () =>
            eq(
              lt(
                this.ref('entreprise . date de création', ctx),
                () => new Date('2019-04-01'),
              ),
              () => false,
            ),
        )
      ) ?
        (
          or(
            eq(
              lt(
                this.ref('entreprise . date de création', ctx),
                () => new Date('2020-04-01'),
              ),
              () => null,
            ),
            () =>
              eq(
                lt(
                  this.ref('entreprise . date de création', ctx),
                  () => new Date('2020-04-01'),
                ),
                () => false,
              ),
          )
        ) ?
          (
            or(
              eq(
                lt(this.ref("entreprise . durée d'activité", ctx), () => 1.0),
                () => null,
              ),
              () =>
                eq(
                  lt(this.ref("entreprise . durée d'activité", ctx), () => 1.0),
                  () => false,
                ),
            )
          ) ?
            null
          : 50.0
        : 75.0
      : 50.0,
    'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux vente': 0.22,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition':
      (ctx) =>
        ctx[
          'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition'
        ],
    'dirigeant . auto-entrepreneur . DROM . première période': (ctx) =>
      lte(
        this.ref("entreprise . durée d'activité . trimestres civils", ctx),
        () => 8.0,
      ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux':
      (ctx) =>
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2026-01')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2026-01')),
                () => false,
              ),
          )
        ) ?
          (
            or(
              eq(
                gte(this.ref('date', ctx), () => new Date('2025-01')),
                () => null,
              ),
              () =>
                eq(
                  gte(this.ref('date', ctx), () => new Date('2025-01')),
                  () => false,
                ),
            )
          ) ?
            (
              or(
                eq(
                  gte(this.ref('date', ctx), () => new Date('2024-07')),
                  () => null,
                ),
                () =>
                  eq(
                    gte(this.ref('date', ctx), () => new Date('2024-07')),
                    () => false,
                  ),
              )
            ) ?
              (
                or(
                  eq(
                    gte(this.ref('date', ctx), () => new Date('2022-10')),
                    () => null,
                  ),
                  () =>
                    eq(
                      gte(this.ref('date', ctx), () => new Date('2022-10')),
                      () => false,
                    ),
                )
              ) ?
                22.0
              : 21.1
            : 23.1
          : 24.6
        : 26.1,
    "entreprise . durée d'activité . années civiles": (ctx) =>
      ctx["entreprise . durée d'activité . années civiles"],
    "entreprise . chiffre d'affaires . BIC": (ctx) =>
      ctx["entreprise . chiffre d'affaires . BIC"],
    'dirigeant . auto-entrepreneur . affiliation CIPAV': (ctx) =>
      this.ref('dirigeant . auto-entrepreneur . Cipav', ctx),
    'dirigeant . auto-entrepreneur . DROM . taux vente restauration hébergement':
      (ctx) =>
        (
          or(
            eq(
              this.ref(
                'dirigeant . auto-entrepreneur . DROM . première période',
                ctx,
              ),
              () => null,
            ),
            () =>
              eq(
                this.ref(
                  'dirigeant . auto-entrepreneur . DROM . première période',
                  ctx,
                ),
                () => false,
              ),
          )
        ) ?
          (
            or(
              eq(
                this.ref(
                  'dirigeant . auto-entrepreneur . DROM . seconde période',
                  ctx,
                ),
                () => null,
              ),
              () =>
                eq(
                  this.ref(
                    'dirigeant . auto-entrepreneur . DROM . seconde période',
                    ctx,
                  ),
                  () => false,
                ),
            )
          ) ?
            8.2
          : 6.2
        : 2.1,
    'établissement . commune . département . outre-mer': (ctx) =>
      ctx['établissement . commune . département . outre-mer'],
    impôt: (ctx) => ctx['impôt'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire . taux de répartition': 16.5,
    "dirigeant . auto-entrepreneur . chiffre d'affaires": (ctx) =>
      this.ref("entreprise . chiffre d'affaires", ctx),
    'dirigeant . auto-entrepreneur . DROM . taux service BIC': (ctx) =>
      (
        or(
          eq(
            this.ref(
              'dirigeant . auto-entrepreneur . DROM . première période',
              ctx,
            ),
            () => null,
          ),
          () =>
            eq(
              this.ref(
                'dirigeant . auto-entrepreneur . DROM . première période',
                ctx,
              ),
              () => false,
            ),
        )
      ) ?
        (
          or(
            eq(
              this.ref(
                'dirigeant . auto-entrepreneur . DROM . seconde période',
                ctx,
              ),
              () => null,
            ),
            () =>
              eq(
                this.ref(
                  'dirigeant . auto-entrepreneur . DROM . seconde période',
                  ctx,
                ),
                () => false,
              ),
          )
        ) ?
          14.2
        : 10.6
      : 3.6,
    "entreprise . durée d'activité . trimestres civils": (ctx) =>
      ctx["entreprise . durée d'activité . trimestres civils"],
    'entreprise . activité . nature . libérale . réglementée': (ctx) =>
      ctx['entreprise . activité . nature . libérale . réglementée'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire . taux de répartition':
      (ctx) =>
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2024-07')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2024-07')),
                () => false,
              ),
          )
        ) ?
          20.75
        : 25.6,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès . taux de répartition': 3.1,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition':
      (ctx) =>
        ctx[
          'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition'
        ],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . Acre . taux vente restauration hébergement':
      (ctx) =>
        mul(
          mul(
            this.ref('dirigeant . auto-entrepreneur . Acre . taux Acre', ctx),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'entreprise . activité . nature . libérale': (ctx) =>
      ctx['entreprise . activité . nature . libérale'],
    "entreprise . chiffre d'affaires . service BIC": (ctx) =>
      ctx["entreprise . chiffre d'affaires . service BIC"],
    'entreprise . activité . nature': (ctx) =>
      ctx['entreprise . activité . nature'],
    'dirigeant . auto-entrepreneur . Cipav . adhérent': (ctx) =>
      ctx['dirigeant . auto-entrepreneur . Cipav . adhérent'] === undefined ?
        false
      : ctx['dirigeant . auto-entrepreneur . Cipav . adhérent'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire . taux de répartition':
      (ctx) =>
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2026-01')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2026-01')),
                () => false,
              ),
          )
        ) ?
          (
            or(
              eq(
                gte(this.ref('date', ctx), () => new Date('2025-01')),
                () => null,
              ),
              () =>
                eq(
                  gte(this.ref('date', ctx), () => new Date('2025-01')),
                  () => false,
                ),
            )
          ) ?
            (
              or(
                eq(
                  gte(this.ref('date', ctx), () => new Date('2024-07')),
                  () => null,
                ),
                () =>
                  eq(
                    gte(this.ref('date', ctx), () => new Date('2024-07')),
                    () => false,
                  ),
              )
            ) ?
              0.0
            : 7.85
          : 13.0
        : 17.7,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions . taux de répartition':
      (ctx) =>
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2026-01')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2026-01')),
                () => false,
              ),
          )
        ) ?
          (
            or(
              eq(
                gte(this.ref('date', ctx), () => new Date('2025-01')),
                () => null,
              ),
              () =>
                eq(
                  gte(this.ref('date', ctx), () => new Date('2025-01')),
                  () => false,
                ),
            )
          ) ?
            (
              or(
                eq(
                  gte(this.ref('date', ctx), () => new Date('2024-07')),
                  () => null,
                ),
                () =>
                  eq(
                    gte(this.ref('date', ctx), () => new Date('2024-07')),
                    () => false,
                  ),
              )
            ) ?
              36.5
            : 34.1
          : 32.5
        : 31.2,
    'dirigeant . auto-entrepreneur . impôt . versement libératoire': (ctx) =>
      (
        ctx['dirigeant . auto-entrepreneur . impôt . versement libératoire'] ===
        undefined
      ) ?
        false
      : ctx['dirigeant . auto-entrepreneur . impôt . versement libératoire'],
    'établissement . commune': (ctx) => ctx['établissement . commune'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire . taux de répartition': 16.5,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité . taux de répartition': 8.9,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC':
      (ctx) =>
        mul(
          mul(
            this.ref("entreprise . chiffre d'affaires . service BIC", ctx),
            () =>
              mul(
                this.ref(
                  'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux',
                  ctx,
                ),
                () => 1.0,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . Acre . notification calcul ACRE annuel': (
      ctx,
    ) => this.ref('dirigeant . exonérations . ACRE', ctx),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition':
      (ctx) =>
        ctx[
          'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition'
        ],
    'dirigeant . exonérations . ACRE': (ctx) =>
      ctx['dirigeant . exonérations . ACRE'],
    'impôt . foyer fiscal . revenu fiscal de référence': (ctx) =>
      ctx['impôt . foyer fiscal . revenu fiscal de référence'],
    'rémunération . impôt': (ctx) => ctx['rémunération . impôt'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux service': 0.48,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux':
      (ctx) =>
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2024-07')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2024-07')),
                () => false,
              ),
          )
        ) ?
          21.2
        : 23.2,
    'dirigeant . auto-entrepreneur . DROM . taux service BNC': (ctx) =>
      (
        or(
          eq(
            this.ref(
              'dirigeant . auto-entrepreneur . DROM . première période',
              ctx,
            ),
            () => null,
          ),
          () =>
            eq(
              this.ref(
                'dirigeant . auto-entrepreneur . DROM . première période',
                ctx,
              ),
              () => false,
            ),
        )
      ) ?
        (
          or(
            eq(
              this.ref(
                'dirigeant . auto-entrepreneur . DROM . seconde période',
                ctx,
              ),
              () => null,
            ),
            () =>
              eq(
                this.ref(
                  'dirigeant . auto-entrepreneur . DROM . seconde période',
                  ctx,
                ),
                () => false,
              ),
          )
        ) ?
          (
            or(
              eq(
                gte(this.ref('date', ctx), () => new Date('2026-01')),
                () => null,
              ),
              () =>
                eq(
                  gte(this.ref('date', ctx), () => new Date('2026-01')),
                  () => false,
                ),
            )
          ) ?
            (
              or(
                eq(
                  gte(this.ref('date', ctx), () => new Date('2025-01')),
                  () => null,
                ),
                () =>
                  eq(
                    gte(this.ref('date', ctx), () => new Date('2025-01')),
                    () => false,
                  ),
              )
            ) ?
              (
                or(
                  eq(
                    gte(this.ref('date', ctx), () => new Date('2024-07')),
                    () => null,
                  ),
                  () =>
                    eq(
                      gte(this.ref('date', ctx), () => new Date('2024-07')),
                      () => false,
                    ),
                )
              ) ?
                14.1
              : 15.4
            : 16.4
          : 17.4
        : (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2026-01')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2026-01')),
                () => false,
              ),
          )
        ) ?
          (
            or(
              eq(
                gte(this.ref('date', ctx), () => new Date('2025-01')),
                () => null,
              ),
              () =>
                eq(
                  gte(this.ref('date', ctx), () => new Date('2025-01')),
                  () => false,
                ),
            )
          ) ?
            (
              or(
                eq(
                  gte(this.ref('date', ctx), () => new Date('2024-07')),
                  () => null,
                ),
                () =>
                  eq(
                    gte(this.ref('date', ctx), () => new Date('2024-07')),
                    () => false,
                  ),
              )
            ) ?
              10.6
            : 11.6
          : 12.3
        : 13.1
      : (
        or(
          eq(
            gte(this.ref('date', ctx), () => new Date('2026-01')),
            () => null,
          ),
          () =>
            eq(
              gte(this.ref('date', ctx), () => new Date('2026-01')),
              () => false,
            ),
        )
      ) ?
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2025-01')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2025-01')),
                () => false,
              ),
          )
        ) ?
          (
            or(
              eq(
                gte(this.ref('date', ctx), () => new Date('2024-07')),
                () => null,
              ),
              () =>
                eq(
                  gte(this.ref('date', ctx), () => new Date('2024-07')),
                  () => false,
                ),
            )
          ) ?
            3.6
          : 3.9
        : 4.1
      : 4.4,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès . taux de répartition': 3.1,
    "entreprise . durée d'activité . en début d'année": (ctx) =>
      ctx["entreprise . durée d'activité . en début d'année"],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur': (ctx) =>
      ctx['dirigeant . auto-entrepreneur'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . TFC': (
      ctx,
    ) =>
      add(
        this.ref(
          'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . commerce',
          ctx,
        ),
        () =>
          add(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers',
              ctx,
            ),
            () => 0.0,
          ),
      ),
    'dirigeant . exonérations': (ctx) => ctx['dirigeant . exonérations'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux service': 0.83,
    'établissement . commune . département': (ctx) =>
      ctx['établissement . commune . département'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux service': 0.65,
    'entreprise . activités . revenus mixtes': (ctx) =>
      ctx['entreprise . activités . revenus mixtes'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations':
      (ctx) =>
        add(
          this.ref(
            'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC',
            ctx,
          ),
          () =>
            add(
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC',
                ctx,
              ),
              () =>
                add(
                  this.ref(
                    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement',
                    ctx,
                  ),
                  () =>
                    add(
                      this.ref(
                        'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
                        ctx,
                      ),
                      () => 0.0,
                    ),
                ),
            ),
        ),
    'dirigeant . auto-entrepreneur . Cipav . retraite complémentaire': (ctx) =>
      this.ref(
        'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire',
        ctx,
      ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC':
      (ctx) =>
        (
          or(
            eq(
              neg(
                this.ref(
                  'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
                  ctx,
                ),
                () => null,
              ),
              () => false,
            ),
            () =>
              neg(
                this.ref(
                  'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
                  ctx,
                ),
                () => null,
              ) === undefined,
          )
        ) ?
          mul(
            mul(
              this.ref("entreprise . chiffre d'affaires . service BNC", ctx),
              () =>
                mul(
                  this.ref(
                    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux',
                    ctx,
                  ),
                  () => 1.0,
                ),
            ),
            () => 0.01,
          )
        : null,
    "entreprise . durée d'activité": (ctx) =>
      ctx["entreprise . durée d'activité"],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions . taux de répartition': 29.7,
    'dirigeant . auto-entrepreneur . revenu net . après impôt': (ctx) =>
      sub(this.ref('dirigeant . auto-entrepreneur . revenu net', ctx), () =>
        this.ref('rémunération . impôt', ctx),
      ),
    'dirigeant . auto-entrepreneur . Acre . taux service BNC': (ctx) =>
      mul(
        mul(
          this.ref('dirigeant . auto-entrepreneur . Acre . taux Acre', ctx),
          () =>
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux',
              ctx,
            ),
        ),
        () => 0.01,
      ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité . taux de répartition':
      (ctx) =>
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2024-07')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2024-07')),
                () => false,
              ),
          )
        ) ?
          9.05
        : 10.2,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . autres contributions':
      (ctx) =>
        add(
          this.ref(
            'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions',
            ctx,
          ),
          () =>
            add(
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions',
                ctx,
              ),
              () =>
                add(
                  this.ref(
                    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions',
                    ctx,
                  ),
                  () =>
                    add(
                      this.ref(
                        'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions',
                        ctx,
                      ),
                      () => 0.0,
                    ),
                ),
            ),
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers':
      (ctx) =>
        (
          or(
            eq(
              eq(
                this.ref('entreprise . activité . nature', ctx),
                () => 'artisanale',
              ),
              () => false,
            ),
            () =>
              eq(
                this.ref('entreprise . activité . nature', ctx),
                () => 'artisanale',
              ) === undefined,
          )
        ) ?
          null
        : add(
            mul(
              mul(
                this.ref("entreprise . chiffre d'affaires . service BIC", ctx),
                () =>
                  mul(
                    this.ref(
                      'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux service',
                      ctx,
                    ),
                    () => 1.0,
                  ),
              ),
              () => 0.01,
            ),
            () =>
              add(
                mul(
                  mul(
                    this.ref(
                      "entreprise . chiffre d'affaires . vente restauration hébergement",
                      ctx,
                    ),
                    () =>
                      mul(
                        this.ref(
                          'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux vente',
                          ctx,
                        ),
                        () => 1.0,
                      ),
                  ),
                  () => 0.01,
                ),
                () => 0.0,
              ),
          ),
    "entreprise . chiffre d'affaires": (ctx) =>
      add(this.ref("entreprise . chiffre d'affaires . BIC", ctx), () =>
        add(
          this.ref("entreprise . chiffre d'affaires . service BIC", ctx),
          () =>
            add(
              this.ref("entreprise . chiffre d'affaires . service BNC", ctx),
              () =>
                add(
                  this.ref(
                    "entreprise . chiffre d'affaires . vente restauration hébergement",
                    ctx,
                  ),
                  () => 0.0,
                ),
            ),
        ),
      ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux':
      (ctx) =>
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2022-10')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2022-10')),
                () => false,
              ),
          )
        ) ?
          12.8
        : 12.3,
    'entreprise . date de création': (ctx) =>
      ctx['entreprise . date de création'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base . taux de répartition':
      (ctx) =>
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2026-01')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2026-01')),
                () => false,
              ),
          )
        ) ?
          (
            or(
              eq(
                gte(this.ref('date', ctx), () => new Date('2025-01')),
                () => null,
              ),
              () =>
                eq(
                  gte(this.ref('date', ctx), () => new Date('2025-01')),
                  () => false,
                ),
            )
          ) ?
            (
              or(
                eq(
                  gte(this.ref('date', ctx), () => new Date('2024-07')),
                  () => null,
                ),
                () =>
                  eq(
                    gte(this.ref('date', ctx), () => new Date('2024-07')),
                    () => false,
                  ),
              )
            ) ?
              55.5
            : 50.75
          : 47.6
        : 44.85,
    'dirigeant . auto-entrepreneur . Cipav': (ctx) =>
      or(
        this.ref(
          'entreprise . activité . nature . libérale . réglementée',
          ctx,
        ),
        () =>
          or(
            and(
              eq(
                this.ref('entreprise . activité . nature', ctx),
                () => 'libérale',
              ),
              () =>
                and(
                  lt(
                    this.ref('entreprise . date de création', ctx),
                    () => new Date('2018-01'),
                  ),
                  () =>
                    and(
                      eq(
                        this.ref(
                          'dirigeant . auto-entrepreneur . Cipav . adhérent',
                          ctx,
                        ),
                        () => true,
                      ),
                      () => true,
                    ),
                ),
            ),
            () => false,
          ),
      ),
    'dirigeant . auto-entrepreneur . impôt': true,
    'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle':
      (ctx) =>
        (
          eq(
            this.ref('établissement . commune . département', ctx),
            () => 'Moselle',
          ) === undefined
        ) ?
          false
        : eq(
            this.ref('établissement . commune . département', ctx),
            () => 'Moselle',
          ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition':
      (ctx) =>
        ctx[
          'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition'
        ],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux':
      (ctx) =>
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2022-10')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2022-10')),
                () => false,
              ),
          )
        ) ?
          22.0
        : 21.2,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite de base':
      (ctx) =>
        add(
          this.ref(
            'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base',
            ctx,
          ),
          () =>
            add(
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base',
                ctx,
              ),
              () =>
                add(
                  this.ref(
                    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base',
                    ctx,
                  ),
                  () =>
                    add(
                      this.ref(
                        'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base',
                        ctx,
                      ),
                      () => 0.0,
                    ),
                ),
            ),
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite complémentaire':
      (ctx) =>
        add(
          this.ref(
            'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire',
            ctx,
          ),
          () =>
            add(
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire',
                ctx,
              ),
              () =>
                add(
                  this.ref(
                    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire',
                    ctx,
                  ),
                  () =>
                    add(
                      this.ref(
                        'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire',
                        ctx,
                      ),
                      () => 0.0,
                    ),
                ),
            ),
        ),
    'dirigeant . auto-entrepreneur . Acre . taux CIPAV': (ctx) =>
      (
        or(
          eq(
            this.ref('dirigeant . auto-entrepreneur . Cipav', ctx),
            () => false,
          ),
          () =>
            this.ref('dirigeant . auto-entrepreneur . Cipav', ctx) ===
            undefined,
        )
      ) ?
        null
      : (
        or(
          eq(
            gte(
              this.ref('entreprise . date de création', ctx),
              () => new Date('2020-04-01'),
            ),
            () => null,
          ),
          () =>
            eq(
              gte(
                this.ref('entreprise . date de création', ctx),
                () => new Date('2020-04-01'),
              ),
              () => false,
            ),
        )
      ) ?
        mul(
          mul(
            this.ref('dirigeant . auto-entrepreneur . Acre . taux Acre', ctx),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux',
                ctx,
              ),
          ),
          () => 0.01,
        )
      : (
        or(
          eq(
            gte(this.ref('date', ctx), () => new Date('2024-07')),
            () => null,
          ),
          () =>
            eq(
              gte(this.ref('date', ctx), () => new Date('2024-07')),
              () => false,
            ),
        )
      ) ?
        12.1
      : 13.9,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'impôt . foyer fiscal': (ctx) => ctx['impôt . foyer fiscal'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav':
      (ctx) =>
        (
          or(
            eq(
              this.ref('dirigeant . auto-entrepreneur . Cipav', ctx),
              () => false,
            ),
            () =>
              this.ref('dirigeant . auto-entrepreneur . Cipav', ctx) ===
              undefined,
          )
        ) ?
          null
        : mul(
            mul(
              this.ref("entreprise . chiffre d'affaires . service BNC", ctx),
              () =>
                mul(
                  this.ref(
                    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux',
                    ctx,
                  ),
                  () => 1.0,
                ),
            ),
            () => 0.01,
          ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux vente': 0.29,
    'dirigeant . auto-entrepreneur . Acre': (ctx) =>
      (
        or(
          eq(this.ref('dirigeant . exonérations . ACRE', ctx), () => false),
          () => this.ref('dirigeant . exonérations . ACRE', ctx) === undefined,
        )
      ) ?
        null
      : ctx['dirigeant . auto-entrepreneur . Acre'],
    dirigeant: (ctx) => ctx['dirigeant'],
    'dirigeant . auto-entrepreneur . impôt . versement libératoire . seuil dépassé':
      (ctx) =>
        gt(
          this.ref('impôt . foyer fiscal . revenu fiscal de référence', ctx),
          () => 27519.0,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès . taux de répartition':
      (ctx) =>
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2024-07')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2024-07')),
                () => false,
              ),
          )
        ) ?
          2.6
        : 1.4,
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base . taux de répartition':
      (ctx) =>
        (
          or(
            eq(
              gte(this.ref('date', ctx), () => new Date('2024-07')),
              () => null,
            ),
            () =>
              eq(
                gte(this.ref('date', ctx), () => new Date('2024-07')),
                () => false,
              ),
          )
        ) ?
          31.3
        : 28.8,
    "dirigeant . auto-entrepreneur . éligible à l'ACRE": (ctx) =>
      (
        or(
          eq(
            lt(
              this.ref("entreprise . durée d'activité . en début d'année", ctx),
              () => 1.0,
            ),
            () => false,
          ),
          () =>
            lt(
              this.ref("entreprise . durée d'activité . en début d'année", ctx),
              () => 1.0,
            ) === undefined,
        )
      ) ?
        null
      : ctx["dirigeant . auto-entrepreneur . éligible à l'ACRE"] === undefined ?
        false
      : ctx["dirigeant . auto-entrepreneur . éligible à l'ACRE"],
    "entreprise . chiffre d'affaires . service BNC": (ctx) =>
      ctx["entreprise . chiffre d'affaires . service BNC"],
    'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . commerce':
      (ctx) =>
        (
          or(
            eq(
              eq(
                this.ref('entreprise . activité . nature', ctx),
                () => 'commerciale',
              ),
              () => false,
            ),
            () =>
              eq(
                this.ref('entreprise . activité . nature', ctx),
                () => 'commerciale',
              ) === undefined,
          )
        ) ?
          null
        : add(
            mul(
              mul(
                this.ref("entreprise . chiffre d'affaires . service BIC", ctx),
                () => mul(0.044, () => 1.0),
              ),
              () => 0.01,
            ),
            () =>
              add(
                mul(
                  mul(
                    this.ref(
                      "entreprise . chiffre d'affaires . vente restauration hébergement",
                      ctx,
                    ),
                    () => mul(0.015, () => 1.0),
                  ),
                  () => 0.01,
                ),
                () => 0.0,
              ),
          ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions': (ctx) =>
      add(
        this.ref(
          'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations',
          ctx,
        ),
        () =>
          add(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . TFC',
              ctx,
            ),
            () =>
              add(
                this.ref(
                  'dirigeant . auto-entrepreneur . cotisations et contributions . CFP',
                  ctx,
                ),
                () => 0.0,
              ),
          ),
      ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base . taux de répartition': 41.8,
    'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace':
      (ctx) =>
        (
          or(
            eq(
              this.ref('établissement . commune . département', ctx),
              () => 'Bas-Rhin',
            ),
            () =>
              or(
                eq(
                  this.ref('établissement . commune . département', ctx),
                  () => 'Haut-Rhin',
                ),
                () => false,
              ),
          ) === undefined
        ) ?
          false
        : or(
            eq(
              this.ref('établissement . commune . département', ctx),
              () => 'Bas-Rhin',
            ),
            () =>
              or(
                eq(
                  this.ref('établissement . commune . département', ctx),
                  () => 'Haut-Rhin',
                ),
                () => false,
              ),
          ),
    'entreprise . activités': (ctx) => ctx['entreprise . activités'],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition':
      (ctx) =>
        ctx[
          'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition'
        ],
    'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire':
      (ctx) =>
        mul(
          mul(
            this.ref(
              'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC',
              ctx,
            ),
            () =>
              this.ref(
                'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire . taux de répartition',
                ctx,
              ),
          ),
          () => 0.01,
        ),
  }
}
