export const rules = {
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base . taux de répartition'
			](ctx) *
			0.01,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base . taux de répartition': 41.8,
	'entreprise . activité': (ctx) => ctx['entreprise . activité'],
	'dirigeant . auto-entrepreneur . DROM': (ctx) =>
		(
			rules['établissement . commune . département . outre-mer'](ctx) ===
				false ||
			rules['établissement . commune . département . outre-mer'](ctx) ===
				undefined
		) ?
			null
		:	true,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . invalidité-décès':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès'
			](ctx) +
			(rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès'
			](ctx) +
				(rules[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès'
				](ctx) +
					(rules[
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès'
					](ctx) +
						0.0))),
	'dirigeant . auto-entrepreneur . cotisations et contributions . CFP': (ctx) =>
		rules["entreprise . chiffre d'affaires . BIC"](ctx) *
			(((
				(rules['entreprise . activité . nature'](ctx) === 'artisanale') ===
					null ||
				(rules['entreprise . activité . nature'](ctx) === 'artisanale') ===
					false
			) ?
				0.1
			:	0.3) *
				1.0) *
			0.01 +
		(rules["entreprise . chiffre d'affaires . service BNC"](ctx) *
			(((
				(rules['date'](ctx) < new Date('2022-01') &&
					rules['dirigeant . auto-entrepreneur . Cipav'](ctx) === false &&
					true) === null ||
				(rules['date'](ctx) < new Date('2022-01') &&
					rules['dirigeant . auto-entrepreneur . Cipav'](ctx) === false &&
					true) === false
			) ?
				0.2
			:	0.1) *
				1.0) *
			0.01 +
			0.0),
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès . taux de répartition'
			](ctx),
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès . taux de répartition'
			](ctx),
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions . taux de répartition': 29.7,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions . taux de répartition':
		(ctx) =>
			(
				rules['date'](ctx) >= new Date('2024-07') === null ||
				rules['date'](ctx) >= new Date('2024-07') === false
			) ?
				36.3
			:	34.0,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions . taux de répartition'
			](ctx) *
			0.01,
	établissement: (ctx) => ctx['établissement'],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès . taux de répartition':
		(ctx) =>
			(
				rules['date'](ctx) >= new Date('2026-01') === null ||
				rules['date'](ctx) >= new Date('2026-01') === false
			) ?
				(
					rules['date'](ctx) >= new Date('2025-01') === null ||
					rules['date'](ctx) >= new Date('2025-01') === false
				) ?
					(
						rules['date'](ctx) >= new Date('2024-07') === null ||
						rules['date'](ctx) >= new Date('2024-07') === false
					) ?
						4.1
					:	3.7
				:	3.5
			:	3.25,
	rémunération: (ctx) => ctx['rémunération'],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement':
		(ctx) =>
			rules["entreprise . chiffre d'affaires . vente restauration hébergement"](
				ctx,
			) *
			(rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux'
			](ctx) *
				1.0) *
			0.01,
	entreprise: (ctx) => ctx['entreprise'],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès . taux de répartition'
			](ctx),
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite de base'
			](ctx) +
			(rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite complémentaire'
			](ctx) +
				0.0),
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . maladie-maternité':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité'
			](ctx) +
			(rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité'
			](ctx) +
				(rules[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité'
				](ctx) +
					(rules[
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité'
					](ctx) +
						0.0))),
	'revenu imposable': (ctx) => ctx['revenu imposable'],
	'dirigeant . auto-entrepreneur . impôt . versement libératoire . montant': (
		ctx,
	) =>
		rules["entreprise . chiffre d'affaires . vente restauration hébergement"](
			ctx,
		) *
			(1.0 * 1.0) *
			0.01 +
		(rules["entreprise . chiffre d'affaires . service BIC"](ctx) *
			(1.7 * 1.0) *
			0.01 +
			(rules["entreprise . chiffre d'affaires . service BNC"](ctx) *
				(2.2 * 1.0) *
				0.01 +
				0.0)),
	'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux vente': 0.37,
	'dirigeant . auto-entrepreneur . DROM . seconde période': (ctx) =>
		rules["entreprise . durée d'activité . années civiles"](ctx) <= 3.0,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité . taux de répartition': 8.9,
	'dirigeant . auto-entrepreneur . Acre . taux service BIC': (ctx) =>
		rules['dirigeant . auto-entrepreneur . Acre . taux Acre'](ctx) *
		rules[
			'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux'
		](ctx) *
		0.01,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité . taux de répartition':
		(ctx) =>
			(
				rules['date'](ctx) >= new Date('2026-01') === null ||
				rules['date'](ctx) >= new Date('2026-01') === false
			) ?
				(
					rules['date'](ctx) >= new Date('2025-01') === null ||
					rules['date'](ctx) >= new Date('2025-01') === false
				) ?
					(
						rules['date'](ctx) >= new Date('2024-07') === null ||
						rules['date'](ctx) >= new Date('2024-07') === false
					) ?
						3.9
					:	3.6
				:	3.4
			:	3.0,
	'dirigeant . auto-entrepreneur . revenu net': (ctx) =>
		rules["entreprise . chiffre d'affaires"](ctx) -
		rules['dirigeant . auto-entrepreneur . cotisations et contributions'](ctx),
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité . taux de répartition'
			](ctx) *
			0.01,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . formation professionnelle':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . CFP'
			](ctx),
	'dirigeant . auto-entrepreneur . DROM . taux CIPAV': (ctx) =>
		(
			rules['dirigeant . auto-entrepreneur . DROM . première période'](ctx) ===
				null ||
			rules['dirigeant . auto-entrepreneur . DROM . première période'](ctx) ===
				false
		) ?
			(
				rules['dirigeant . auto-entrepreneur . DROM . seconde période'](ctx) ===
					null ||
				rules['dirigeant . auto-entrepreneur . DROM . seconde période'](ctx) ===
					false
			) ?
				14.2
			:	10.6
		:	7.1,
	"entreprise . chiffre d'affaires . vente restauration hébergement": (ctx) =>
		ctx["entreprise . chiffre d'affaires . vente restauration hébergement"],
	date: (ctx) => ctx['date'],
	'dirigeant . auto-entrepreneur . Acre . taux Acre': (ctx) =>
		(
			rules['entreprise . date de création'](ctx) < new Date('2019-04-01') ===
				null ||
			rules['entreprise . date de création'](ctx) < new Date('2019-04-01') ===
				false
		) ?
			(
				rules['entreprise . date de création'](ctx) < new Date('2020-04-01') ===
					null ||
				rules['entreprise . date de création'](ctx) < new Date('2020-04-01') ===
					false
			) ?
				(
					rules["entreprise . durée d'activité"](ctx) < 1.0 === null ||
					rules["entreprise . durée d'activité"](ctx) < 1.0 === false
				) ?
					null
				:	50.0
			:	75.0
		:	50.0,
	'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux vente': 0.22,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition':
		(ctx) =>
			ctx[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition'
			],
	'dirigeant . auto-entrepreneur . DROM . première période': (ctx) =>
		rules["entreprise . durée d'activité . trimestres civils"](ctx) <= 8.0,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux':
		(ctx) =>
			(
				rules['date'](ctx) >= new Date('2026-01') === null ||
				rules['date'](ctx) >= new Date('2026-01') === false
			) ?
				(
					rules['date'](ctx) >= new Date('2025-01') === null ||
					rules['date'](ctx) >= new Date('2025-01') === false
				) ?
					(
						rules['date'](ctx) >= new Date('2024-07') === null ||
						rules['date'](ctx) >= new Date('2024-07') === false
					) ?
						(
							rules['date'](ctx) >= new Date('2022-10') === null ||
							rules['date'](ctx) >= new Date('2022-10') === false
						) ?
							22.0
						:	21.1
					:	23.1
				:	24.6
			:	26.1,
	"entreprise . durée d'activité . années civiles": (ctx) =>
		ctx["entreprise . durée d'activité . années civiles"],
	"entreprise . chiffre d'affaires . BIC": (ctx) =>
		ctx["entreprise . chiffre d'affaires . BIC"],
	'dirigeant . auto-entrepreneur . affiliation CIPAV': (ctx) =>
		rules['dirigeant . auto-entrepreneur . Cipav'](ctx),
	'dirigeant . auto-entrepreneur . DROM . taux vente restauration hébergement':
		(ctx) =>
			(
				rules['dirigeant . auto-entrepreneur . DROM . première période'](
					ctx,
				) === null ||
				rules['dirigeant . auto-entrepreneur . DROM . première période'](
					ctx,
				) === false
			) ?
				(
					rules['dirigeant . auto-entrepreneur . DROM . seconde période'](
						ctx,
					) === null ||
					rules['dirigeant . auto-entrepreneur . DROM . seconde période'](
						ctx,
					) === false
				) ?
					8.2
				:	6.2
			:	2.1,
	'établissement . commune . département . outre-mer': (ctx) =>
		ctx['établissement . commune . département . outre-mer'],
	impôt: (ctx) => ctx['impôt'],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire . taux de répartition': 16.5,
	"dirigeant . auto-entrepreneur . chiffre d'affaires": (ctx) =>
		rules["entreprise . chiffre d'affaires"](ctx),
	'dirigeant . auto-entrepreneur . DROM . taux service BIC': (ctx) =>
		(
			rules['dirigeant . auto-entrepreneur . DROM . première période'](ctx) ===
				null ||
			rules['dirigeant . auto-entrepreneur . DROM . première période'](ctx) ===
				false
		) ?
			(
				rules['dirigeant . auto-entrepreneur . DROM . seconde période'](ctx) ===
					null ||
				rules['dirigeant . auto-entrepreneur . DROM . seconde période'](ctx) ===
					false
			) ?
				14.2
			:	10.6
		:	3.6,
	"entreprise . durée d'activité . trimestres civils": (ctx) =>
		ctx["entreprise . durée d'activité . trimestres civils"],
	'entreprise . activité . nature . libérale . réglementée': (ctx) =>
		ctx['entreprise . activité . nature . libérale . réglementée'],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions . taux de répartition'
			](ctx) *
			0.01,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire . taux de répartition':
		(ctx) =>
			(
				rules['date'](ctx) >= new Date('2024-07') === null ||
				rules['date'](ctx) >= new Date('2024-07') === false
			) ?
				20.75
			:	25.6,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base . taux de répartition'
			](ctx) *
			0.01,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès . taux de répartition': 3.1,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition':
		(ctx) =>
			ctx[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition'
			],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions . taux de répartition'
			](ctx) *
			0.01,
	'dirigeant . auto-entrepreneur . Acre . taux vente restauration hébergement':
		(ctx) =>
			rules['dirigeant . auto-entrepreneur . Acre . taux Acre'](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux'
			](ctx) *
			0.01,
	'entreprise . activité . nature . libérale': (ctx) =>
		ctx['entreprise . activité . nature . libérale'],
	"entreprise . chiffre d'affaires . service BIC": (ctx) =>
		ctx["entreprise . chiffre d'affaires . service BIC"],
	'entreprise . activité . nature': (ctx) =>
		ctx['entreprise . activité . nature'],
	'dirigeant . auto-entrepreneur . Cipav . adhérent': (ctx) =>
		ctx['dirigeant . auto-entrepreneur . Cipav . adhérent'] === undefined ?
			false
		:	ctx['dirigeant . auto-entrepreneur . Cipav . adhérent'],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire . taux de répartition':
		(ctx) =>
			(
				rules['date'](ctx) >= new Date('2026-01') === null ||
				rules['date'](ctx) >= new Date('2026-01') === false
			) ?
				(
					rules['date'](ctx) >= new Date('2025-01') === null ||
					rules['date'](ctx) >= new Date('2025-01') === false
				) ?
					(
						rules['date'](ctx) >= new Date('2024-07') === null ||
						rules['date'](ctx) >= new Date('2024-07') === false
					) ?
						0.0
					:	7.85
				:	13.0
			:	17.7,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions . taux de répartition':
		(ctx) =>
			(
				rules['date'](ctx) >= new Date('2026-01') === null ||
				rules['date'](ctx) >= new Date('2026-01') === false
			) ?
				(
					rules['date'](ctx) >= new Date('2025-01') === null ||
					rules['date'](ctx) >= new Date('2025-01') === false
				) ?
					(
						rules['date'](ctx) >= new Date('2024-07') === null ||
						rules['date'](ctx) >= new Date('2024-07') === false
					) ?
						36.5
					:	34.1
				:	32.5
			:	31.2,
	'dirigeant . auto-entrepreneur . impôt . versement libératoire': (ctx) =>
		(
			ctx['dirigeant . auto-entrepreneur . impôt . versement libératoire'] ===
			undefined
		) ?
			false
		:	ctx['dirigeant . auto-entrepreneur . impôt . versement libératoire'],
	'établissement . commune': (ctx) => ctx['établissement . commune'],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire . taux de répartition': 16.5,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité . taux de répartition': 8.9,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC':
		(ctx) =>
			rules["entreprise . chiffre d'affaires . service BIC"](ctx) *
			(rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux'
			](ctx) *
				1.0) *
			0.01,
	'dirigeant . auto-entrepreneur . Acre . notification calcul ACRE annuel': (
		ctx,
	) => rules['dirigeant . exonérations . ACRE'](ctx),
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
				rules['date'](ctx) >= new Date('2024-07') === null ||
				rules['date'](ctx) >= new Date('2024-07') === false
			) ?
				21.2
			:	23.2,
	'dirigeant . auto-entrepreneur . DROM . taux service BNC': (ctx) =>
		(
			rules['dirigeant . auto-entrepreneur . DROM . première période'](ctx) ===
				null ||
			rules['dirigeant . auto-entrepreneur . DROM . première période'](ctx) ===
				false
		) ?
			(
				rules['dirigeant . auto-entrepreneur . DROM . seconde période'](ctx) ===
					null ||
				rules['dirigeant . auto-entrepreneur . DROM . seconde période'](ctx) ===
					false
			) ?
				(
					rules['date'](ctx) >= new Date('2026-01') === null ||
					rules['date'](ctx) >= new Date('2026-01') === false
				) ?
					(
						rules['date'](ctx) >= new Date('2025-01') === null ||
						rules['date'](ctx) >= new Date('2025-01') === false
					) ?
						(
							rules['date'](ctx) >= new Date('2024-07') === null ||
							rules['date'](ctx) >= new Date('2024-07') === false
						) ?
							14.1
						:	15.4
					:	16.4
				:	17.4
			: (
				rules['date'](ctx) >= new Date('2026-01') === null ||
				rules['date'](ctx) >= new Date('2026-01') === false
			) ?
				(
					rules['date'](ctx) >= new Date('2025-01') === null ||
					rules['date'](ctx) >= new Date('2025-01') === false
				) ?
					(
						rules['date'](ctx) >= new Date('2024-07') === null ||
						rules['date'](ctx) >= new Date('2024-07') === false
					) ?
						10.6
					:	11.6
				:	12.3
			:	13.1
		: (
			rules['date'](ctx) >= new Date('2026-01') === null ||
			rules['date'](ctx) >= new Date('2026-01') === false
		) ?
			(
				rules['date'](ctx) >= new Date('2025-01') === null ||
				rules['date'](ctx) >= new Date('2025-01') === false
			) ?
				(
					rules['date'](ctx) >= new Date('2024-07') === null ||
					rules['date'](ctx) >= new Date('2024-07') === false
				) ?
					3.6
				:	3.9
			:	4.1
		:	4.4,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès . taux de répartition': 3.1,
	"entreprise . durée d'activité . en début d'année": (ctx) =>
		ctx["entreprise . durée d'activité . en début d'année"],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire . taux de répartition'
			](ctx) *
			0.01,
	'dirigeant . auto-entrepreneur': (ctx) =>
		ctx['dirigeant . auto-entrepreneur'],
	'dirigeant . auto-entrepreneur . cotisations et contributions . TFC': (ctx) =>
		rules[
			'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . commerce'
		](ctx) +
		(rules[
			'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers'
		](ctx) +
			0.0),
	'dirigeant . exonérations': (ctx) => ctx['dirigeant . exonérations'],
	'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux service': 0.83,
	'établissement . commune . département': (ctx) =>
		ctx['établissement . commune . département'],
	'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux service': 0.65,
	'entreprise . activités . revenus mixtes': (ctx) =>
		ctx['entreprise . activités . revenus mixtes'],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire . taux de répartition'
			](ctx) *
			0.01,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions . taux de répartition'
			](ctx) *
			0.01,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC'
			](ctx) +
			(rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC'
			](ctx) +
				(rules[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement'
				](ctx) +
					(rules[
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav'
					](ctx) +
						0.0))),
	'dirigeant . auto-entrepreneur . Cipav . retraite complémentaire': (ctx) =>
		rules[
			'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire'
		](ctx),
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC':
		(ctx) =>
			(
				(rules[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav'
				](ctx) !==
					null) ===
					false ||
				(rules[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav'
				](ctx) !==
					null) ===
					undefined
			) ?
				rules["entreprise . chiffre d'affaires . service BNC"](ctx) *
				(rules[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux'
				](ctx) *
					1.0) *
				0.01
			:	null,
	"entreprise . durée d'activité": (ctx) =>
		ctx["entreprise . durée d'activité"],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions . taux de répartition': 29.7,
	'dirigeant . auto-entrepreneur . revenu net . après impôt': (ctx) =>
		rules['dirigeant . auto-entrepreneur . revenu net'](ctx) -
		rules['rémunération . impôt'](ctx),
	'dirigeant . auto-entrepreneur . Acre . taux service BNC': (ctx) =>
		rules['dirigeant . auto-entrepreneur . Acre . taux Acre'](ctx) *
		rules[
			'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux'
		](ctx) *
		0.01,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité . taux de répartition':
		(ctx) =>
			(
				rules['date'](ctx) >= new Date('2024-07') === null ||
				rules['date'](ctx) >= new Date('2024-07') === false
			) ?
				9.05
			:	10.2,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . autres contributions':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions'
			](ctx) +
			(rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions'
			](ctx) +
				(rules[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions'
				](ctx) +
					(rules[
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions'
					](ctx) +
						0.0))),
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès . taux de répartition'
			](ctx),
	'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers':
		(ctx) =>
			(
				(rules['entreprise . activité . nature'](ctx) === 'artisanale') ===
					false ||
				(rules['entreprise . activité . nature'](ctx) === 'artisanale') ===
					undefined
			) ?
				null
			:	rules["entreprise . chiffre d'affaires . service BIC"](ctx) *
					(rules[
						'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux service'
					](ctx) *
						1.0) *
					0.01 +
				(rules[
					"entreprise . chiffre d'affaires . vente restauration hébergement"
				](ctx) *
					(rules[
						'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux vente'
					](ctx) *
						1.0) *
					0.01 +
					0.0),
	"entreprise . chiffre d'affaires": (ctx) =>
		rules["entreprise . chiffre d'affaires . BIC"](ctx) +
		(rules["entreprise . chiffre d'affaires . service BIC"](ctx) +
			(rules["entreprise . chiffre d'affaires . service BNC"](ctx) +
				(rules[
					"entreprise . chiffre d'affaires . vente restauration hébergement"
				](ctx) +
					0.0))),
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux':
		(ctx) =>
			(
				rules['date'](ctx) >= new Date('2022-10') === null ||
				rules['date'](ctx) >= new Date('2022-10') === false
			) ?
				12.8
			:	12.3,
	'entreprise . date de création': (ctx) =>
		ctx['entreprise . date de création'],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base . taux de répartition':
		(ctx) =>
			(
				rules['date'](ctx) >= new Date('2026-01') === null ||
				rules['date'](ctx) >= new Date('2026-01') === false
			) ?
				(
					rules['date'](ctx) >= new Date('2025-01') === null ||
					rules['date'](ctx) >= new Date('2025-01') === false
				) ?
					(
						rules['date'](ctx) >= new Date('2024-07') === null ||
						rules['date'](ctx) >= new Date('2024-07') === false
					) ?
						55.5
					:	50.75
				:	47.6
			:	44.85,
	'dirigeant . auto-entrepreneur . Cipav': (ctx) =>
		rules['entreprise . activité . nature . libérale . réglementée'](ctx) ||
		(rules['entreprise . activité . nature'](ctx) === 'libérale' &&
			rules['entreprise . date de création'](ctx) < new Date('2018-01') &&
			rules['dirigeant . auto-entrepreneur . Cipav . adhérent'](ctx) === true &&
			true) ||
		false,
	'dirigeant . auto-entrepreneur . impôt': true,
	'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle':
		(ctx) =>
			(
				(rules['établissement . commune . département'](ctx) === 'Moselle') ===
				undefined
			) ?
				false
			:	rules['établissement . commune . département'](ctx) === 'Moselle',
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire . taux de répartition'
			](ctx) *
			0.01,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition':
		(ctx) =>
			ctx[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition'
			],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux':
		(ctx) =>
			(
				rules['date'](ctx) >= new Date('2022-10') === null ||
				rules['date'](ctx) >= new Date('2022-10') === false
			) ?
				22.0
			:	21.2,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité . taux de répartition'
			](ctx) *
			0.01,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite de base':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base'
			](ctx) +
			(rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base'
			](ctx) +
				(rules[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base'
				](ctx) +
					(rules[
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base'
					](ctx) +
						0.0))),
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite complémentaire':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire'
			](ctx) +
			(rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire'
			](ctx) +
				(rules[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire'
				](ctx) +
					(rules[
						'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire'
					](ctx) +
						0.0))),
	'dirigeant . auto-entrepreneur . Acre . taux CIPAV': (ctx) =>
		(
			rules['dirigeant . auto-entrepreneur . Cipav'](ctx) === false ||
			rules['dirigeant . auto-entrepreneur . Cipav'](ctx) === undefined
		) ?
			null
		: (
			rules['entreprise . date de création'](ctx) >= new Date('2020-04-01') ===
				null ||
			rules['entreprise . date de création'](ctx) >= new Date('2020-04-01') ===
				false
		) ?
			rules['dirigeant . auto-entrepreneur . Acre . taux Acre'](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux'
			](ctx) *
			0.01
		: (
			rules['date'](ctx) >= new Date('2024-07') === null ||
			rules['date'](ctx) >= new Date('2024-07') === false
		) ?
			12.1
		:	13.9,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base . taux de répartition'
			](ctx) *
			0.01,
	'impôt . foyer fiscal': (ctx) => ctx['impôt . foyer fiscal'],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav':
		(ctx) =>
			(
				rules['dirigeant . auto-entrepreneur . Cipav'](ctx) === false ||
				rules['dirigeant . auto-entrepreneur . Cipav'](ctx) === undefined
			) ?
				null
			:	rules["entreprise . chiffre d'affaires . service BNC"](ctx) *
				(rules[
					'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux'
				](ctx) *
					1.0) *
				0.01,
	'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux vente': 0.29,
	'dirigeant . auto-entrepreneur . Acre': (ctx) =>
		(
			rules['dirigeant . exonérations . ACRE'](ctx) === false ||
			rules['dirigeant . exonérations . ACRE'](ctx) === undefined
		) ?
			null
		:	ctx['dirigeant . auto-entrepreneur . Acre'],
	dirigeant: (ctx) => ctx['dirigeant'],
	'dirigeant . auto-entrepreneur . impôt . versement libératoire . seuil dépassé':
		(ctx) =>
			rules['impôt . foyer fiscal . revenu fiscal de référence'](ctx) > 27519.0,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès . taux de répartition':
		(ctx) =>
			(
				rules['date'](ctx) >= new Date('2024-07') === null ||
				rules['date'](ctx) >= new Date('2024-07') === false
			) ?
				2.6
			:	1.4,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base . taux de répartition':
		(ctx) =>
			(
				rules['date'](ctx) >= new Date('2024-07') === null ||
				rules['date'](ctx) >= new Date('2024-07') === false
			) ?
				31.3
			:	28.8,
	"dirigeant . auto-entrepreneur . éligible à l'ACRE": (ctx) =>
		(
			rules["entreprise . durée d'activité . en début d'année"](ctx) < 1.0 ===
				false ||
			rules["entreprise . durée d'activité . en début d'année"](ctx) < 1.0 ===
				undefined
		) ?
			null
		: ctx["dirigeant . auto-entrepreneur . éligible à l'ACRE"] === undefined ?
			false
		:	ctx["dirigeant . auto-entrepreneur . éligible à l'ACRE"],
	"entreprise . chiffre d'affaires . service BNC": (ctx) =>
		ctx["entreprise . chiffre d'affaires . service BNC"],
	'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . commerce':
		(ctx) =>
			(
				(rules['entreprise . activité . nature'](ctx) === 'commerciale') ===
					false ||
				(rules['entreprise . activité . nature'](ctx) === 'commerciale') ===
					undefined
			) ?
				null
			:	rules["entreprise . chiffre d'affaires . service BIC"](ctx) *
					(0.044 * 1.0) *
					0.01 +
				(rules[
					"entreprise . chiffre d'affaires . vente restauration hébergement"
				](ctx) *
					(0.015 * 1.0) *
					0.01 +
					0.0),
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base . taux de répartition'
			](ctx) *
			0.01,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité . taux de répartition'
			](ctx) *
			0.01,
	'dirigeant . auto-entrepreneur . cotisations et contributions': (ctx) =>
		rules[
			'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations'
		](ctx) +
		(rules[
			'dirigeant . auto-entrepreneur . cotisations et contributions . TFC'
		](ctx) +
			(rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . CFP'
			](ctx) +
				0.0)),
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité . taux de répartition'
			](ctx) *
			0.01,
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base . taux de répartition': 41.8,
	'dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace':
		(ctx) =>
			(
				(rules['établissement . commune . département'](ctx) === 'Bas-Rhin' ||
					rules['établissement . commune . département'](ctx) === 'Haut-Rhin' ||
					false) === undefined
			) ?
				false
			:	rules['établissement . commune . département'](ctx) === 'Bas-Rhin' ||
				rules['établissement . commune . département'](ctx) === 'Haut-Rhin' ||
				false,
	'entreprise . activités': (ctx) => ctx['entreprise . activités'],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition':
		(ctx) =>
			ctx[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition'
			],
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire':
		(ctx) =>
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC'
			](ctx) *
			rules[
				'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire . taux de répartition'
			](ctx) *
			0.01,
}
