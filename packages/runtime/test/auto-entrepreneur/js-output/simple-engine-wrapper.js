export default class Engine {
	evaluate(ruleName, ctx) {
		return this.rules[ruleName](ctx)
	}

	rules = {
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base . taux de répartition':
			(ctx) => {
				return 41.8
			},
		'entreprise . activité': (ctx) => {
			return ctx['entreprise . activité']
		},
		'dirigeant . auto-entrepreneur . DROM': (ctx) => {
			return (
					this.evaluate(
						'établissement . commune . département . outre-mer',
						ctx,
					) === false ||
						this.evaluate(
							'établissement . commune . département . outre-mer',
							ctx,
						) === undefined
				) ?
					null
				:	true
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . invalidité-décès':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès',
						ctx,
					) +
					(this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès',
						ctx,
					) +
						(this.evaluate(
							'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès',
							ctx,
						) +
							(this.evaluate(
								'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès',
								ctx,
							) +
								0.0)))
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . CFP': (
			ctx,
		) => {
			return (
				this.evaluate("entreprise . chiffre d'affaires . BIC", ctx) *
					(((
						(this.evaluate('entreprise . activité . nature', ctx) ===
							'artisanale') ===
							null ||
						(this.evaluate('entreprise . activité . nature', ctx) ===
							'artisanale') ===
							false
					) ?
						0.1
					:	0.3) *
						1.0) *
					0.01 +
				(this.evaluate("entreprise . chiffre d'affaires . service BNC", ctx) *
					(((
						(this.evaluate('date', ctx) < new Date('2022-01') &&
							this.evaluate('dirigeant . auto-entrepreneur . Cipav', ctx) ===
								false &&
							true) === null ||
						(this.evaluate('date', ctx) < new Date('2022-01') &&
							this.evaluate('dirigeant . auto-entrepreneur . Cipav', ctx) ===
								false &&
							true) === false
					) ?
						0.2
					:	0.1) *
						1.0) *
					0.01 +
					0.0)
			)
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès . taux de répartition',
						ctx,
					)
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès . taux de répartition',
						ctx,
					)
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions . taux de répartition':
			(ctx) => {
				return 29.7
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions . taux de répartition':
			(ctx) => {
				return (
						this.evaluate('date', ctx) >= new Date('2024-07') === null ||
							this.evaluate('date', ctx) >= new Date('2024-07') === false
					) ?
						36.3
					:	34.0
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		établissement: (ctx) => {
			return ctx['établissement']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès . taux de répartition':
			(ctx) => {
				return (
					(
						this.evaluate('date', ctx) >= new Date('2026-01') === null ||
							this.evaluate('date', ctx) >= new Date('2026-01') === false
					) ?
						(
							this.evaluate('date', ctx) >= new Date('2025-01') === null ||
							this.evaluate('date', ctx) >= new Date('2025-01') === false
						) ?
							(
								this.evaluate('date', ctx) >= new Date('2024-07') === null ||
								this.evaluate('date', ctx) >= new Date('2024-07') === false
							) ?
								4.1
							:	3.7
						:	3.5
					:	3.25
				)
			},
		rémunération: (ctx) => {
			return ctx['rémunération']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement':
			(ctx) => {
				return (
					this.evaluate(
						"entreprise . chiffre d'affaires . vente restauration hébergement",
						ctx,
					) *
					(this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux',
						ctx,
					) *
						1.0) *
					0.01
				)
			},
		entreprise: (ctx) => {
			return ctx['entreprise']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès . taux de répartition',
						ctx,
					)
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite de base',
						ctx,
					) +
					(this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite complémentaire',
						ctx,
					) +
						0.0)
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . maladie-maternité':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité',
						ctx,
					) +
					(this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité',
						ctx,
					) +
						(this.evaluate(
							'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité',
							ctx,
						) +
							(this.evaluate(
								'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité',
								ctx,
							) +
								0.0)))
				)
			},
		'revenu imposable': (ctx) => {
			return ctx['revenu imposable']
		},
		'dirigeant . auto-entrepreneur . impôt . versement libératoire . montant': (
			ctx,
		) => {
			return (
				this.evaluate(
					"entreprise . chiffre d'affaires . vente restauration hébergement",
					ctx,
				) *
					(1.0 * 1.0) *
					0.01 +
				(this.evaluate("entreprise . chiffre d'affaires . service BIC", ctx) *
					(1.7 * 1.0) *
					0.01 +
					(this.evaluate("entreprise . chiffre d'affaires . service BNC", ctx) *
						(2.2 * 1.0) *
						0.01 +
						0.0))
			)
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux vente':
			(ctx) => {
				return 0.37
			},
		'dirigeant . auto-entrepreneur . DROM . seconde période': (ctx) => {
			return (
				this.evaluate("entreprise . durée d'activité . années civiles", ctx) <=
				3.0
			)
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité . taux de répartition':
			(ctx) => {
				return 8.9
			},
		'dirigeant . auto-entrepreneur . Acre . taux service BIC': (ctx) => {
			return (
				this.evaluate('dirigeant . auto-entrepreneur . Acre . taux Acre', ctx) *
				this.evaluate(
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux',
					ctx,
				) *
				0.01
			)
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité . taux de répartition':
			(ctx) => {
				return (
					(
						this.evaluate('date', ctx) >= new Date('2026-01') === null ||
							this.evaluate('date', ctx) >= new Date('2026-01') === false
					) ?
						(
							this.evaluate('date', ctx) >= new Date('2025-01') === null ||
							this.evaluate('date', ctx) >= new Date('2025-01') === false
						) ?
							(
								this.evaluate('date', ctx) >= new Date('2024-07') === null ||
								this.evaluate('date', ctx) >= new Date('2024-07') === false
							) ?
								3.9
							:	3.6
						:	3.4
					:	3.0
				)
			},
		'dirigeant . auto-entrepreneur . revenu net': (ctx) => {
			return (
				this.evaluate("entreprise . chiffre d'affaires", ctx) -
				this.evaluate(
					'dirigeant . auto-entrepreneur . cotisations et contributions',
					ctx,
				)
			)
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . formation professionnelle':
			(ctx) => {
				return this.evaluate(
					'dirigeant . auto-entrepreneur . cotisations et contributions . CFP',
					ctx,
				)
			},
		'dirigeant . auto-entrepreneur . DROM . taux CIPAV': (ctx) => {
			return (
				(
					this.evaluate(
						'dirigeant . auto-entrepreneur . DROM . première période',
						ctx,
					) === null ||
						this.evaluate(
							'dirigeant . auto-entrepreneur . DROM . première période',
							ctx,
						) === false
				) ?
					(
						this.evaluate(
							'dirigeant . auto-entrepreneur . DROM . seconde période',
							ctx,
						) === null ||
						this.evaluate(
							'dirigeant . auto-entrepreneur . DROM . seconde période',
							ctx,
						) === false
					) ?
						14.2
					:	10.6
				:	7.1
			)
		},
		"entreprise . chiffre d'affaires . vente restauration hébergement": (
			ctx,
		) => {
			return ctx[
				"entreprise . chiffre d'affaires . vente restauration hébergement"
			]
		},
		date: (ctx) => {
			return ctx['date']
		},
		'dirigeant . auto-entrepreneur . Acre . taux Acre': (ctx) => {
			return (
				(
					this.evaluate('entreprise . date de création', ctx) <
						new Date('2019-04-01') ===
						null ||
						this.evaluate('entreprise . date de création', ctx) <
							new Date('2019-04-01') ===
							false
				) ?
					(
						this.evaluate('entreprise . date de création', ctx) <
							new Date('2020-04-01') ===
							null ||
						this.evaluate('entreprise . date de création', ctx) <
							new Date('2020-04-01') ===
							false
					) ?
						(
							this.evaluate("entreprise . durée d'activité", ctx) < 1.0 ===
								null ||
							this.evaluate("entreprise . durée d'activité", ctx) < 1.0 ===
								false
						) ?
							null
						:	50.0
					:	75.0
				:	50.0
			)
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux vente':
			(ctx) => {
				return 0.22
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition':
			(ctx) => {
				return ctx[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition'
				]
			},
		'dirigeant . auto-entrepreneur . DROM . première période': (ctx) => {
			return (
				this.evaluate(
					"entreprise . durée d'activité . trimestres civils",
					ctx,
				) <= 8.0
			)
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux':
			(ctx) => {
				return (
					(
						this.evaluate('date', ctx) >= new Date('2026-01') === null ||
							this.evaluate('date', ctx) >= new Date('2026-01') === false
					) ?
						(
							this.evaluate('date', ctx) >= new Date('2025-01') === null ||
							this.evaluate('date', ctx) >= new Date('2025-01') === false
						) ?
							(
								this.evaluate('date', ctx) >= new Date('2024-07') === null ||
								this.evaluate('date', ctx) >= new Date('2024-07') === false
							) ?
								(
									this.evaluate('date', ctx) >= new Date('2022-10') === null ||
									this.evaluate('date', ctx) >= new Date('2022-10') === false
								) ?
									22.0
								:	21.1
							:	23.1
						:	24.6
					:	26.1
				)
			},
		"entreprise . durée d'activité . années civiles": (ctx) => {
			return ctx["entreprise . durée d'activité . années civiles"]
		},
		"entreprise . chiffre d'affaires . BIC": (ctx) => {
			return ctx["entreprise . chiffre d'affaires . BIC"]
		},
		'dirigeant . auto-entrepreneur . affiliation CIPAV': (ctx) => {
			return this.evaluate('dirigeant . auto-entrepreneur . Cipav', ctx)
		},
		'dirigeant . auto-entrepreneur . DROM . taux vente restauration hébergement':
			(ctx) => {
				return (
					(
						this.evaluate(
							'dirigeant . auto-entrepreneur . DROM . première période',
							ctx,
						) === null ||
							this.evaluate(
								'dirigeant . auto-entrepreneur . DROM . première période',
								ctx,
							) === false
					) ?
						(
							this.evaluate(
								'dirigeant . auto-entrepreneur . DROM . seconde période',
								ctx,
							) === null ||
							this.evaluate(
								'dirigeant . auto-entrepreneur . DROM . seconde période',
								ctx,
							) === false
						) ?
							8.2
						:	6.2
					:	2.1
				)
			},
		'établissement . commune . département . outre-mer': (ctx) => {
			return ctx['établissement . commune . département . outre-mer']
		},
		impôt: (ctx) => {
			return ctx['impôt']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire . taux de répartition':
			(ctx) => {
				return 16.5
			},
		"dirigeant . auto-entrepreneur . chiffre d'affaires": (ctx) => {
			return this.evaluate("entreprise . chiffre d'affaires", ctx)
		},
		'dirigeant . auto-entrepreneur . DROM . taux service BIC': (ctx) => {
			return (
				(
					this.evaluate(
						'dirigeant . auto-entrepreneur . DROM . première période',
						ctx,
					) === null ||
						this.evaluate(
							'dirigeant . auto-entrepreneur . DROM . première période',
							ctx,
						) === false
				) ?
					(
						this.evaluate(
							'dirigeant . auto-entrepreneur . DROM . seconde période',
							ctx,
						) === null ||
						this.evaluate(
							'dirigeant . auto-entrepreneur . DROM . seconde période',
							ctx,
						) === false
					) ?
						14.2
					:	10.6
				:	3.6
			)
		},
		"entreprise . durée d'activité . trimestres civils": (ctx) => {
			return ctx["entreprise . durée d'activité . trimestres civils"]
		},
		'entreprise . activité . nature . libérale . réglementée': (ctx) => {
			return ctx['entreprise . activité . nature . libérale . réglementée']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire . taux de répartition':
			(ctx) => {
				return (
						this.evaluate('date', ctx) >= new Date('2024-07') === null ||
							this.evaluate('date', ctx) >= new Date('2024-07') === false
					) ?
						20.75
					:	25.6
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès . taux de répartition':
			(ctx) => {
				return 3.1
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition':
			(ctx) => {
				return ctx[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition'
				]
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		'dirigeant . auto-entrepreneur . Acre . taux vente restauration hébergement':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . Acre . taux Acre',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux',
						ctx,
					) *
					0.01
				)
			},
		'entreprise . activité . nature . libérale': (ctx) => {
			return ctx['entreprise . activité . nature . libérale']
		},
		"entreprise . chiffre d'affaires . service BIC": (ctx) => {
			return ctx["entreprise . chiffre d'affaires . service BIC"]
		},
		'entreprise . activité . nature': (ctx) => {
			return ctx['entreprise . activité . nature']
		},
		'dirigeant . auto-entrepreneur . Cipav . adhérent': (ctx) => {
			return (
					ctx['dirigeant . auto-entrepreneur . Cipav . adhérent'] === undefined
				) ?
					false
				:	ctx['dirigeant . auto-entrepreneur . Cipav . adhérent']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire . taux de répartition':
			(ctx) => {
				return (
					(
						this.evaluate('date', ctx) >= new Date('2026-01') === null ||
							this.evaluate('date', ctx) >= new Date('2026-01') === false
					) ?
						(
							this.evaluate('date', ctx) >= new Date('2025-01') === null ||
							this.evaluate('date', ctx) >= new Date('2025-01') === false
						) ?
							(
								this.evaluate('date', ctx) >= new Date('2024-07') === null ||
								this.evaluate('date', ctx) >= new Date('2024-07') === false
							) ?
								0.0
							:	7.85
						:	13.0
					:	17.7
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions . taux de répartition':
			(ctx) => {
				return (
					(
						this.evaluate('date', ctx) >= new Date('2026-01') === null ||
							this.evaluate('date', ctx) >= new Date('2026-01') === false
					) ?
						(
							this.evaluate('date', ctx) >= new Date('2025-01') === null ||
							this.evaluate('date', ctx) >= new Date('2025-01') === false
						) ?
							(
								this.evaluate('date', ctx) >= new Date('2024-07') === null ||
								this.evaluate('date', ctx) >= new Date('2024-07') === false
							) ?
								36.5
							:	34.1
						:	32.5
					:	31.2
				)
			},
		'dirigeant . auto-entrepreneur . impôt . versement libératoire': (ctx) => {
			return (
					ctx[
						'dirigeant . auto-entrepreneur . impôt . versement libératoire'
					] === undefined
				) ?
					false
				:	ctx['dirigeant . auto-entrepreneur . impôt . versement libératoire']
		},
		'établissement . commune': (ctx) => {
			return ctx['établissement . commune']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire . taux de répartition':
			(ctx) => {
				return 16.5
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité . taux de répartition':
			(ctx) => {
				return 8.9
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC':
			(ctx) => {
				return (
					this.evaluate("entreprise . chiffre d'affaires . service BIC", ctx) *
					(this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux',
						ctx,
					) *
						1.0) *
					0.01
				)
			},
		'dirigeant . auto-entrepreneur . Acre . notification calcul ACRE annuel': (
			ctx,
		) => {
			return this.evaluate('dirigeant . exonérations . ACRE', ctx)
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition':
			(ctx) => {
				return ctx[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition'
				]
			},
		'dirigeant . exonérations . ACRE': (ctx) => {
			return ctx['dirigeant . exonérations . ACRE']
		},
		'impôt . foyer fiscal . revenu fiscal de référence': (ctx) => {
			return ctx['impôt . foyer fiscal . revenu fiscal de référence']
		},
		'rémunération . impôt': (ctx) => {
			return ctx['rémunération . impôt']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux service':
			(ctx) => {
				return 0.48
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux':
			(ctx) => {
				return (
						this.evaluate('date', ctx) >= new Date('2024-07') === null ||
							this.evaluate('date', ctx) >= new Date('2024-07') === false
					) ?
						21.2
					:	23.2
			},
		'dirigeant . auto-entrepreneur . DROM . taux service BNC': (ctx) => {
			return (
				(
					this.evaluate(
						'dirigeant . auto-entrepreneur . DROM . première période',
						ctx,
					) === null ||
						this.evaluate(
							'dirigeant . auto-entrepreneur . DROM . première période',
							ctx,
						) === false
				) ?
					(
						this.evaluate(
							'dirigeant . auto-entrepreneur . DROM . seconde période',
							ctx,
						) === null ||
						this.evaluate(
							'dirigeant . auto-entrepreneur . DROM . seconde période',
							ctx,
						) === false
					) ?
						(
							this.evaluate('date', ctx) >= new Date('2026-01') === null ||
							this.evaluate('date', ctx) >= new Date('2026-01') === false
						) ?
							(
								this.evaluate('date', ctx) >= new Date('2025-01') === null ||
								this.evaluate('date', ctx) >= new Date('2025-01') === false
							) ?
								(
									this.evaluate('date', ctx) >= new Date('2024-07') === null ||
									this.evaluate('date', ctx) >= new Date('2024-07') === false
								) ?
									14.1
								:	15.4
							:	16.4
						:	17.4
					: (
						this.evaluate('date', ctx) >= new Date('2026-01') === null ||
						this.evaluate('date', ctx) >= new Date('2026-01') === false
					) ?
						(
							this.evaluate('date', ctx) >= new Date('2025-01') === null ||
							this.evaluate('date', ctx) >= new Date('2025-01') === false
						) ?
							(
								this.evaluate('date', ctx) >= new Date('2024-07') === null ||
								this.evaluate('date', ctx) >= new Date('2024-07') === false
							) ?
								10.6
							:	11.6
						:	12.3
					:	13.1
				: (
					this.evaluate('date', ctx) >= new Date('2026-01') === null ||
					this.evaluate('date', ctx) >= new Date('2026-01') === false
				) ?
					(
						this.evaluate('date', ctx) >= new Date('2025-01') === null ||
						this.evaluate('date', ctx) >= new Date('2025-01') === false
					) ?
						(
							this.evaluate('date', ctx) >= new Date('2024-07') === null ||
							this.evaluate('date', ctx) >= new Date('2024-07') === false
						) ?
							3.6
						:	3.9
					:	4.1
				:	4.4
			)
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès . taux de répartition':
			(ctx) => {
				return 3.1
			},
		"entreprise . durée d'activité . en début d'année": (ctx) => {
			return ctx["entreprise . durée d'activité . en début d'année"]
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		'dirigeant . auto-entrepreneur': (ctx) => {
			return ctx['dirigeant . auto-entrepreneur']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . TFC': (
			ctx,
		) => {
			return (
				this.evaluate(
					'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . commerce',
					ctx,
				) +
				(this.evaluate(
					'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers',
					ctx,
				) +
					0.0)
			)
		},
		'dirigeant . exonérations': (ctx) => {
			return ctx['dirigeant . exonérations']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux service':
			(ctx) => {
				return 0.83
			},
		'établissement . commune . département': (ctx) => {
			return ctx['établissement . commune . département']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux service':
			(ctx) => {
				return 0.65
			},
		'entreprise . activités . revenus mixtes': (ctx) => {
			return ctx['entreprise . activités . revenus mixtes']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC',
						ctx,
					) +
					(this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC',
						ctx,
					) +
						(this.evaluate(
							'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement',
							ctx,
						) +
							(this.evaluate(
								'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
								ctx,
							) +
								0.0)))
				)
			},
		'dirigeant . auto-entrepreneur . Cipav . retraite complémentaire': (
			ctx,
		) => {
			return this.evaluate(
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire',
				ctx,
			)
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC':
			(ctx) => {
				return (
						(this.evaluate(
							'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
							ctx,
						) !==
							null) ===
							false ||
							(this.evaluate(
								'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
								ctx,
							) !==
								null) ===
								undefined
					) ?
						this.evaluate(
							"entreprise . chiffre d'affaires . service BNC",
							ctx,
						) *
							(this.evaluate(
								'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux',
								ctx,
							) *
								1.0) *
							0.01
					:	null
			},
		"entreprise . durée d'activité": (ctx) => {
			return ctx["entreprise . durée d'activité"]
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions . taux de répartition':
			(ctx) => {
				return 29.7
			},
		'dirigeant . auto-entrepreneur . revenu net . après impôt': (ctx) => {
			return (
				this.evaluate('dirigeant . auto-entrepreneur . revenu net', ctx) -
				this.evaluate('rémunération . impôt', ctx)
			)
		},
		'dirigeant . auto-entrepreneur . Acre . taux service BNC': (ctx) => {
			return (
				this.evaluate('dirigeant . auto-entrepreneur . Acre . taux Acre', ctx) *
				this.evaluate(
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux',
					ctx,
				) *
				0.01
			)
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité . taux de répartition':
			(ctx) => {
				return (
						this.evaluate('date', ctx) >= new Date('2024-07') === null ||
							this.evaluate('date', ctx) >= new Date('2024-07') === false
					) ?
						9.05
					:	10.2
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . autres contributions':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions',
						ctx,
					) +
					(this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions',
						ctx,
					) +
						(this.evaluate(
							'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions',
							ctx,
						) +
							(this.evaluate(
								'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions',
								ctx,
							) +
								0.0)))
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès . taux de répartition',
						ctx,
					)
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers':
			(ctx) => {
				return (
						(this.evaluate('entreprise . activité . nature', ctx) ===
							'artisanale') ===
							false ||
							(this.evaluate('entreprise . activité . nature', ctx) ===
								'artisanale') ===
								undefined
					) ?
						null
					:	this.evaluate("entreprise . chiffre d'affaires . service BIC", ctx) *
							(this.evaluate(
								'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux service',
								ctx,
							) *
								1.0) *
							0.01 +
							(this.evaluate(
								"entreprise . chiffre d'affaires . vente restauration hébergement",
								ctx,
							) *
								(this.evaluate(
									'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux vente',
									ctx,
								) *
									1.0) *
								0.01 +
								0.0)
			},
		"entreprise . chiffre d'affaires": (ctx) => {
			return (
				this.evaluate("entreprise . chiffre d'affaires . BIC", ctx) +
				(this.evaluate("entreprise . chiffre d'affaires . service BIC", ctx) +
					(this.evaluate("entreprise . chiffre d'affaires . service BNC", ctx) +
						(this.evaluate(
							"entreprise . chiffre d'affaires . vente restauration hébergement",
							ctx,
						) +
							0.0)))
			)
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux':
			(ctx) => {
				return (
						this.evaluate('date', ctx) >= new Date('2022-10') === null ||
							this.evaluate('date', ctx) >= new Date('2022-10') === false
					) ?
						12.8
					:	12.3
			},
		'entreprise . date de création': (ctx) => {
			return ctx['entreprise . date de création']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base . taux de répartition':
			(ctx) => {
				return (
					(
						this.evaluate('date', ctx) >= new Date('2026-01') === null ||
							this.evaluate('date', ctx) >= new Date('2026-01') === false
					) ?
						(
							this.evaluate('date', ctx) >= new Date('2025-01') === null ||
							this.evaluate('date', ctx) >= new Date('2025-01') === false
						) ?
							(
								this.evaluate('date', ctx) >= new Date('2024-07') === null ||
								this.evaluate('date', ctx) >= new Date('2024-07') === false
							) ?
								55.5
							:	50.75
						:	47.6
					:	44.85
				)
			},
		'dirigeant . auto-entrepreneur . Cipav': (ctx) => {
			return (
				this.evaluate(
					'entreprise . activité . nature . libérale . réglementée',
					ctx,
				) ||
				(this.evaluate('entreprise . activité . nature', ctx) === 'libérale' &&
					this.evaluate('entreprise . date de création', ctx) <
						new Date('2018-01') &&
					this.evaluate(
						'dirigeant . auto-entrepreneur . Cipav . adhérent',
						ctx,
					) === true &&
					true) ||
				false
			)
		},
		'dirigeant . auto-entrepreneur . impôt': (ctx) => {
			return true
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle':
			(ctx) => {
				return (
						(this.evaluate('établissement . commune . département', ctx) ===
							'Moselle') ===
							undefined
					) ?
						false
					:	this.evaluate('établissement . commune . département', ctx) ===
							'Moselle'
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition':
			(ctx) => {
				return ctx[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition'
				]
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux':
			(ctx) => {
				return (
						this.evaluate('date', ctx) >= new Date('2022-10') === null ||
							this.evaluate('date', ctx) >= new Date('2022-10') === false
					) ?
						22.0
					:	21.2
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite de base':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base',
						ctx,
					) +
					(this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base',
						ctx,
					) +
						(this.evaluate(
							'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base',
							ctx,
						) +
							(this.evaluate(
								'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base',
								ctx,
							) +
								0.0)))
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite complémentaire':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire',
						ctx,
					) +
					(this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire',
						ctx,
					) +
						(this.evaluate(
							'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire',
							ctx,
						) +
							(this.evaluate(
								'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire',
								ctx,
							) +
								0.0)))
				)
			},
		'dirigeant . auto-entrepreneur . Acre . taux CIPAV': (ctx) => {
			return (
				(
					this.evaluate('dirigeant . auto-entrepreneur . Cipav', ctx) ===
						false ||
						this.evaluate('dirigeant . auto-entrepreneur . Cipav', ctx) ===
							undefined
				) ?
					null
				: (
					this.evaluate('entreprise . date de création', ctx) >=
						new Date('2020-04-01') ===
						null ||
					this.evaluate('entreprise . date de création', ctx) >=
						new Date('2020-04-01') ===
						false
				) ?
					this.evaluate(
						'dirigeant . auto-entrepreneur . Acre . taux Acre',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux',
						ctx,
					) *
					0.01
				: (
					this.evaluate('date', ctx) >= new Date('2024-07') === null ||
					this.evaluate('date', ctx) >= new Date('2024-07') === false
				) ?
					12.1
				:	13.9
			)
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		'impôt . foyer fiscal': (ctx) => {
			return ctx['impôt . foyer fiscal']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav':
			(ctx) => {
				return (
						this.evaluate('dirigeant . auto-entrepreneur . Cipav', ctx) ===
							false ||
							this.evaluate('dirigeant . auto-entrepreneur . Cipav', ctx) ===
								undefined
					) ?
						null
					:	this.evaluate("entreprise . chiffre d'affaires . service BNC", ctx) *
							(this.evaluate(
								'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux',
								ctx,
							) *
								1.0) *
							0.01
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux vente':
			(ctx) => {
				return 0.29
			},
		'dirigeant . auto-entrepreneur . Acre': (ctx) => {
			return (
					this.evaluate('dirigeant . exonérations . ACRE', ctx) === false ||
						this.evaluate('dirigeant . exonérations . ACRE', ctx) === undefined
				) ?
					null
				:	ctx['dirigeant . auto-entrepreneur . Acre']
		},
		dirigeant: (ctx) => {
			return ctx['dirigeant']
		},
		'dirigeant . auto-entrepreneur . impôt . versement libératoire . seuil dépassé':
			(ctx) => {
				return (
					this.evaluate(
						'impôt . foyer fiscal . revenu fiscal de référence',
						ctx,
					) > 27519.0
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès . taux de répartition':
			(ctx) => {
				return (
						this.evaluate('date', ctx) >= new Date('2024-07') === null ||
							this.evaluate('date', ctx) >= new Date('2024-07') === false
					) ?
						2.6
					:	1.4
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base . taux de répartition':
			(ctx) => {
				return (
						this.evaluate('date', ctx) >= new Date('2024-07') === null ||
							this.evaluate('date', ctx) >= new Date('2024-07') === false
					) ?
						31.3
					:	28.8
			},
		"dirigeant . auto-entrepreneur . éligible à l'ACRE": (ctx) => {
			return (
				(
					this.evaluate(
						"entreprise . durée d'activité . en début d'année",
						ctx,
					) <
						1.0 ===
						false ||
						this.evaluate(
							"entreprise . durée d'activité . en début d'année",
							ctx,
						) <
							1.0 ===
							undefined
				) ?
					null
				: (
					ctx["dirigeant . auto-entrepreneur . éligible à l'ACRE"] === undefined
				) ?
					false
				:	ctx["dirigeant . auto-entrepreneur . éligible à l'ACRE"]
			)
		},
		"entreprise . chiffre d'affaires . service BNC": (ctx) => {
			return ctx["entreprise . chiffre d'affaires . service BNC"]
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . commerce':
			(ctx) => {
				return (
						(this.evaluate('entreprise . activité . nature', ctx) ===
							'commerciale') ===
							false ||
							(this.evaluate('entreprise . activité . nature', ctx) ===
								'commerciale') ===
								undefined
					) ?
						null
					:	this.evaluate("entreprise . chiffre d'affaires . service BIC", ctx) *
							(0.044 * 1.0) *
							0.01 +
							(this.evaluate(
								"entreprise . chiffre d'affaires . vente restauration hébergement",
								ctx,
							) *
								(0.015 * 1.0) *
								0.01 +
								0.0)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions': (ctx) => {
			return (
				this.evaluate(
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations',
					ctx,
				) +
				(this.evaluate(
					'dirigeant . auto-entrepreneur . cotisations et contributions . TFC',
					ctx,
				) +
					(this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . CFP',
						ctx,
					) +
						0.0))
			)
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base . taux de répartition':
			(ctx) => {
				return 41.8
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace':
			(ctx) => {
				return (
						(this.evaluate('établissement . commune . département', ctx) ===
							'Bas-Rhin' ||
							this.evaluate('établissement . commune . département', ctx) ===
								'Haut-Rhin' ||
							false) === undefined
					) ?
						false
					:	this.evaluate('établissement . commune . département', ctx) ===
							'Bas-Rhin' ||
							this.evaluate('établissement . commune . département', ctx) ===
								'Haut-Rhin' ||
							false
			},
		'entreprise . activités': (ctx) => {
			return ctx['entreprise . activités']
		},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition':
			(ctx) => {
				return ctx[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition'
				]
			},
		'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire':
			(ctx) => {
				return (
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC',
						ctx,
					) *
					this.evaluate(
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire . taux de répartition',
						ctx,
					) *
					0.01
				)
			},
	}
}
