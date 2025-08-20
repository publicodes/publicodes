
export default class Engine {
	cache = undefined

	constructor(cache = {}) {
		this.cache = cache
	}

	evaluate(ruleName, ctx) {
		const cacheKey =
			this.cache !== undefined ?
				`${ruleName}-${JSON.stringify(ctx)}`
			:	undefined

		if (this.cache !== undefined && this.cache[cacheKey]) {
			return this.cache[cacheKey]
		}

		if (!this.rules[ruleName]) {
			throw new Error(`Rule ${ruleName} not found`)
		}

		const result = this.rules[ruleName](ctx)

		if (this.cache !== undefined) {
			this.cache[cacheKey] = result
		}

		return result
	}

  rules = {
		"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base . taux de répartition", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base . taux de répartition": (ctx) => {
return 41.800000
},
"entreprise . activité": (ctx) => {
return ctx["entreprise . activité"]
},
"dirigeant . auto-entrepreneur . DROM": (ctx) => {
return (((this.evaluate("établissement . commune . département . outre-mer", ctx) === false) || (this.evaluate("établissement . commune . département . outre-mer", ctx) === undefined)) ? null : true)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . invalidité-décès": (ctx) => {
return (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès", ctx) + 0.000000))))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . CFP": (ctx) => {
return (((this.evaluate("entreprise . chiffre d'affaires . BIC", ctx) * (((((this.evaluate("entreprise . activité . nature", ctx) === 'artisanale') === null) || ((this.evaluate("entreprise . activité . nature", ctx) === 'artisanale') === false)) ? 0.100000 : 0.300000) * 1.000000)) * 0.010000) + (((this.evaluate("entreprise . chiffre d'affaires . service BNC", ctx) * ((((((this.evaluate("date", ctx) < new Date('2022-01')) && ((this.evaluate("dirigeant . auto-entrepreneur . Cipav", ctx) === false) && true)) === null) || (((this.evaluate("date", ctx) < new Date('2022-01')) && ((this.evaluate("dirigeant . auto-entrepreneur . Cipav", ctx) === false) && true)) === false)) ? 0.200000 : 0.100000) * 1.000000)) * 0.010000) + 0.000000))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès": (ctx) => {
return (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès . taux de répartition", ctx))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès": (ctx) => {
return (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès . taux de répartition", ctx))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions . taux de répartition": (ctx) => {
return 29.700000
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions . taux de répartition": (ctx) => {
return ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 36.300000 : 34.000000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions . taux de répartition", ctx)) * 0.010000)
},
"établissement": (ctx) => {
return ctx["établissement"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès . taux de répartition": (ctx) => {
return ((((this.evaluate("date", ctx) >= new Date('2026-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2026-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2025-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2025-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 4.100000 : 3.700000) : 3.500000) : 3.250000)
},
"rémunération": (ctx) => {
return ctx["rémunération"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement": (ctx) => {
return ((this.evaluate("entreprise . chiffre d'affaires . vente restauration hébergement", ctx) * (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux", ctx) * 1.000000)) * 0.010000)
},
"entreprise": (ctx) => {
return ctx["entreprise"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès": (ctx) => {
return (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès . taux de répartition", ctx))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite": (ctx) => {
return (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite de base", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite complémentaire", ctx) + 0.000000))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . maladie-maternité": (ctx) => {
return (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité", ctx) + 0.000000))))
},
"revenu imposable": (ctx) => {
return ctx["revenu imposable"]
},
"dirigeant . auto-entrepreneur . impôt . versement libératoire . montant": (ctx) => {
return (((this.evaluate("entreprise . chiffre d'affaires . vente restauration hébergement", ctx) * (1.000000 * 1.000000)) * 0.010000) + (((this.evaluate("entreprise . chiffre d'affaires . service BIC", ctx) * (1.700000 * 1.000000)) * 0.010000) + (((this.evaluate("entreprise . chiffre d'affaires . service BNC", ctx) * (2.200000 * 1.000000)) * 0.010000) + 0.000000)))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux vente": (ctx) => {
return 0.370000
},
"dirigeant . auto-entrepreneur . DROM . seconde période": (ctx) => {
return (this.evaluate("entreprise . durée d'activité . années civiles", ctx) <= 3.000000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité . taux de répartition": (ctx) => {
return 8.900000
},
"dirigeant . auto-entrepreneur . Acre . taux service BIC": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . Acre . taux Acre", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité . taux de répartition": (ctx) => {
return ((((this.evaluate("date", ctx) >= new Date('2026-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2026-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2025-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2025-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 3.900000 : 3.600000) : 3.400000) : 3.000000)
},
"dirigeant . auto-entrepreneur . revenu net": (ctx) => {
return (this.evaluate("entreprise . chiffre d'affaires", ctx) - this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions", ctx))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité . taux de répartition", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . formation professionnelle": (ctx) => {
return this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . CFP", ctx)
},
"dirigeant . auto-entrepreneur . DROM . taux CIPAV": (ctx) => {
return (((this.evaluate("dirigeant . auto-entrepreneur . DROM . première période", ctx) === null) || (this.evaluate("dirigeant . auto-entrepreneur . DROM . première période", ctx) === false)) ? (((this.evaluate("dirigeant . auto-entrepreneur . DROM . seconde période", ctx) === null) || (this.evaluate("dirigeant . auto-entrepreneur . DROM . seconde période", ctx) === false)) ? 14.200000 : 10.600000) : 7.100000)
},
"entreprise . chiffre d'affaires . vente restauration hébergement": (ctx) => {
return ctx["entreprise . chiffre d'affaires . vente restauration hébergement"]
},
"date": (ctx) => {
return ctx["date"]
},
"dirigeant . auto-entrepreneur . Acre . taux Acre": (ctx) => {
return ((((this.evaluate("entreprise . date de création", ctx) < new Date('2019-04-01')) === null) || ((this.evaluate("entreprise . date de création", ctx) < new Date('2019-04-01')) === false)) ? ((((this.evaluate("entreprise . date de création", ctx) < new Date('2020-04-01')) === null) || ((this.evaluate("entreprise . date de création", ctx) < new Date('2020-04-01')) === false)) ? ((((this.evaluate("entreprise . durée d'activité", ctx) < 1.000000) === null) || ((this.evaluate("entreprise . durée d'activité", ctx) < 1.000000) === false)) ? null : 50.000000) : 75.000000) : 50.000000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux vente": (ctx) => {
return 0.220000
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition": (ctx) => {
return ctx["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition"]
},
"dirigeant . auto-entrepreneur . DROM . première période": (ctx) => {
return (this.evaluate("entreprise . durée d'activité . trimestres civils", ctx) <= 8.000000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux": (ctx) => {
return ((((this.evaluate("date", ctx) >= new Date('2026-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2026-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2025-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2025-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2022-10')) === null) || ((this.evaluate("date", ctx) >= new Date('2022-10')) === false)) ? 22.000000 : 21.100000) : 23.100000) : 24.600000) : 26.100000)
},
"entreprise . durée d'activité . années civiles": (ctx) => {
return ctx["entreprise . durée d'activité . années civiles"]
},
"entreprise . chiffre d'affaires . BIC": (ctx) => {
return ctx["entreprise . chiffre d'affaires . BIC"]
},
"dirigeant . auto-entrepreneur . affiliation CIPAV": (ctx) => {
return this.evaluate("dirigeant . auto-entrepreneur . Cipav", ctx)
},
"dirigeant . auto-entrepreneur . DROM . taux vente restauration hébergement": (ctx) => {
return (((this.evaluate("dirigeant . auto-entrepreneur . DROM . première période", ctx) === null) || (this.evaluate("dirigeant . auto-entrepreneur . DROM . première période", ctx) === false)) ? (((this.evaluate("dirigeant . auto-entrepreneur . DROM . seconde période", ctx) === null) || (this.evaluate("dirigeant . auto-entrepreneur . DROM . seconde période", ctx) === false)) ? 8.200000 : 6.200000) : 2.100000)
},
"établissement . commune . département . outre-mer": (ctx) => {
return ctx["établissement . commune . département . outre-mer"]
},
"impôt": (ctx) => {
return ctx["impôt"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire . taux de répartition": (ctx) => {
return 16.500000
},
"dirigeant . auto-entrepreneur . chiffre d'affaires": (ctx) => {
return this.evaluate("entreprise . chiffre d'affaires", ctx)
},
"dirigeant . auto-entrepreneur . DROM . taux service BIC": (ctx) => {
return (((this.evaluate("dirigeant . auto-entrepreneur . DROM . première période", ctx) === null) || (this.evaluate("dirigeant . auto-entrepreneur . DROM . première période", ctx) === false)) ? (((this.evaluate("dirigeant . auto-entrepreneur . DROM . seconde période", ctx) === null) || (this.evaluate("dirigeant . auto-entrepreneur . DROM . seconde période", ctx) === false)) ? 14.200000 : 10.600000) : 3.600000)
},
"entreprise . durée d'activité . trimestres civils": (ctx) => {
return ctx["entreprise . durée d'activité . trimestres civils"]
},
"entreprise . activité . nature . libérale . réglementée": (ctx) => {
return ctx["entreprise . activité . nature . libérale . réglementée"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions . taux de répartition", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire . taux de répartition": (ctx) => {
return ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 20.750000 : 25.600000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base . taux de répartition", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès . taux de répartition": (ctx) => {
return 3.100000
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition": (ctx) => {
return ctx["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions . taux de répartition", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . Acre . taux vente restauration hébergement": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . Acre . taux Acre", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux", ctx)) * 0.010000)
},
"entreprise . activité . nature . libérale": (ctx) => {
return ctx["entreprise . activité . nature . libérale"]
},
"entreprise . chiffre d'affaires . service BIC": (ctx) => {
return ctx["entreprise . chiffre d'affaires . service BIC"]
},
"entreprise . activité . nature": (ctx) => {
return ctx["entreprise . activité . nature"]
},
"dirigeant . auto-entrepreneur . Cipav . adhérent": (ctx) => {
return ((ctx["dirigeant . auto-entrepreneur . Cipav . adhérent"] === undefined) ? false : ctx["dirigeant . auto-entrepreneur . Cipav . adhérent"])
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire . taux de répartition": (ctx) => {
return ((((this.evaluate("date", ctx) >= new Date('2026-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2026-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2025-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2025-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 0.000000 : 7.850000) : 13.000000) : 17.700000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions . taux de répartition": (ctx) => {
return ((((this.evaluate("date", ctx) >= new Date('2026-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2026-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2025-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2025-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 36.500000 : 34.100000) : 32.500000) : 31.200000)
},
"dirigeant . auto-entrepreneur . impôt . versement libératoire": (ctx) => {
return ((ctx["dirigeant . auto-entrepreneur . impôt . versement libératoire"] === undefined) ? false : ctx["dirigeant . auto-entrepreneur . impôt . versement libératoire"])
},
"établissement . commune": (ctx) => {
return ctx["établissement . commune"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire . taux de répartition": (ctx) => {
return 16.500000
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité . taux de répartition": (ctx) => {
return 8.900000
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC": (ctx) => {
return ((this.evaluate("entreprise . chiffre d'affaires . service BIC", ctx) * (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux", ctx) * 1.000000)) * 0.010000)
},
"dirigeant . auto-entrepreneur . Acre . notification calcul ACRE annuel": (ctx) => {
return this.evaluate("dirigeant . exonérations . ACRE", ctx)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition": (ctx) => {
return ctx["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition"]
},
"dirigeant . exonérations . ACRE": (ctx) => {
return ctx["dirigeant . exonérations . ACRE"]
},
"impôt . foyer fiscal . revenu fiscal de référence": (ctx) => {
return ctx["impôt . foyer fiscal . revenu fiscal de référence"]
},
"rémunération . impôt": (ctx) => {
return ctx["rémunération . impôt"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux service": (ctx) => {
return 0.480000
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux": (ctx) => {
return ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 21.200000 : 23.200000)
},
"dirigeant . auto-entrepreneur . DROM . taux service BNC": (ctx) => {
return (((this.evaluate("dirigeant . auto-entrepreneur . DROM . première période", ctx) === null) || (this.evaluate("dirigeant . auto-entrepreneur . DROM . première période", ctx) === false)) ? (((this.evaluate("dirigeant . auto-entrepreneur . DROM . seconde période", ctx) === null) || (this.evaluate("dirigeant . auto-entrepreneur . DROM . seconde période", ctx) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2026-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2026-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2025-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2025-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 14.100000 : 15.400000) : 16.400000) : 17.400000) : ((((this.evaluate("date", ctx) >= new Date('2026-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2026-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2025-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2025-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 10.600000 : 11.600000) : 12.300000) : 13.100000)) : ((((this.evaluate("date", ctx) >= new Date('2026-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2026-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2025-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2025-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 3.600000 : 3.900000) : 4.100000) : 4.400000))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès . taux de répartition": (ctx) => {
return 3.100000
},
"entreprise . durée d'activité . en début d'année": (ctx) => {
return ctx["entreprise . durée d'activité . en début d'année"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire . taux de répartition", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur": (ctx) => {
return ctx["dirigeant . auto-entrepreneur"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC": (ctx) => {
return (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . commerce", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers", ctx) + 0.000000))
},
"dirigeant . exonérations": (ctx) => {
return ctx["dirigeant . exonérations"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux service": (ctx) => {
return 0.830000
},
"établissement . commune . département": (ctx) => {
return ctx["établissement . commune . département"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux service": (ctx) => {
return 0.650000
},
"entreprise . activités . revenus mixtes": (ctx) => {
return ctx["entreprise . activités . revenus mixtes"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire . taux de répartition", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions . taux de répartition", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations": (ctx) => {
return (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", ctx) + 0.000000))))
},
"dirigeant . auto-entrepreneur . Cipav . retraite complémentaire": (ctx) => {
return this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire", ctx)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC": (ctx) => {
return ((((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", ctx) !== null) === false) || ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", ctx) !== null) === undefined)) ? ((this.evaluate("entreprise . chiffre d'affaires . service BNC", ctx) * (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux", ctx) * 1.000000)) * 0.010000) : null)
},
"entreprise . durée d'activité": (ctx) => {
return ctx["entreprise . durée d'activité"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions . taux de répartition": (ctx) => {
return 29.700000
},
"dirigeant . auto-entrepreneur . revenu net . après impôt": (ctx) => {
return (this.evaluate("dirigeant . auto-entrepreneur . revenu net", ctx) - this.evaluate("rémunération . impôt", ctx))
},
"dirigeant . auto-entrepreneur . Acre . taux service BNC": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . Acre . taux Acre", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité . taux de répartition": (ctx) => {
return ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 9.050000 : 10.200000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . autres contributions": (ctx) => {
return (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions", ctx) + 0.000000))))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès": (ctx) => {
return (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès . taux de répartition", ctx))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers": (ctx) => {
return ((((this.evaluate("entreprise . activité . nature", ctx) === 'artisanale') === false) || ((this.evaluate("entreprise . activité . nature", ctx) === 'artisanale') === undefined)) ? null : (((this.evaluate("entreprise . chiffre d'affaires . service BIC", ctx) * (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux service", ctx) * 1.000000)) * 0.010000) + (((this.evaluate("entreprise . chiffre d'affaires . vente restauration hébergement", ctx) * (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux vente", ctx) * 1.000000)) * 0.010000) + 0.000000)))
},
"entreprise . chiffre d'affaires": (ctx) => {
return (this.evaluate("entreprise . chiffre d'affaires . BIC", ctx) + (this.evaluate("entreprise . chiffre d'affaires . service BIC", ctx) + (this.evaluate("entreprise . chiffre d'affaires . service BNC", ctx) + (this.evaluate("entreprise . chiffre d'affaires . vente restauration hébergement", ctx) + 0.000000))))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux": (ctx) => {
return ((((this.evaluate("date", ctx) >= new Date('2022-10')) === null) || ((this.evaluate("date", ctx) >= new Date('2022-10')) === false)) ? 12.800000 : 12.300000)
},
"entreprise . date de création": (ctx) => {
return ctx["entreprise . date de création"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base . taux de répartition": (ctx) => {
return ((((this.evaluate("date", ctx) >= new Date('2026-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2026-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2025-01')) === null) || ((this.evaluate("date", ctx) >= new Date('2025-01')) === false)) ? ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 55.500000 : 50.750000) : 47.600000) : 44.850000)
},
"dirigeant . auto-entrepreneur . Cipav": (ctx) => {
return (this.evaluate("entreprise . activité . nature . libérale . réglementée", ctx) || (((this.evaluate("entreprise . activité . nature", ctx) === 'libérale') && ((this.evaluate("entreprise . date de création", ctx) < new Date('2018-01')) && ((this.evaluate("dirigeant . auto-entrepreneur . Cipav . adhérent", ctx) === true) && true))) || false))
},
"dirigeant . auto-entrepreneur . impôt": (ctx) => {
return true
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle": (ctx) => {
return (((this.evaluate("établissement . commune . département", ctx) === 'Moselle') === undefined) ? false : (this.evaluate("établissement . commune . département", ctx) === 'Moselle'))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire . taux de répartition", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition": (ctx) => {
return ctx["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux": (ctx) => {
return ((((this.evaluate("date", ctx) >= new Date('2022-10')) === null) || ((this.evaluate("date", ctx) >= new Date('2022-10')) === false)) ? 22.000000 : 21.200000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité . taux de répartition", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite de base": (ctx) => {
return (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base", ctx) + 0.000000))))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite complémentaire": (ctx) => {
return (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire", ctx) + 0.000000))))
},
"dirigeant . auto-entrepreneur . Acre . taux CIPAV": (ctx) => {
return (((this.evaluate("dirigeant . auto-entrepreneur . Cipav", ctx) === false) || (this.evaluate("dirigeant . auto-entrepreneur . Cipav", ctx) === undefined)) ? null : ((((this.evaluate("entreprise . date de création", ctx) >= new Date('2020-04-01')) === null) || ((this.evaluate("entreprise . date de création", ctx) >= new Date('2020-04-01')) === false)) ? ((this.evaluate("dirigeant . auto-entrepreneur . Acre . taux Acre", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux", ctx)) * 0.010000) : ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 12.100000 : 13.900000)))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base . taux de répartition", ctx)) * 0.010000)
},
"impôt . foyer fiscal": (ctx) => {
return ctx["impôt . foyer fiscal"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav": (ctx) => {
return (((this.evaluate("dirigeant . auto-entrepreneur . Cipav", ctx) === false) || (this.evaluate("dirigeant . auto-entrepreneur . Cipav", ctx) === undefined)) ? null : ((this.evaluate("entreprise . chiffre d'affaires . service BNC", ctx) * (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux", ctx) * 1.000000)) * 0.010000))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux vente": (ctx) => {
return 0.290000
},
"dirigeant . auto-entrepreneur . Acre": (ctx) => {
return (((this.evaluate("dirigeant . exonérations . ACRE", ctx) === false) || (this.evaluate("dirigeant . exonérations . ACRE", ctx) === undefined)) ? null : ctx["dirigeant . auto-entrepreneur . Acre"])
},
"dirigeant": (ctx) => {
return ctx["dirigeant"]
},
"dirigeant . auto-entrepreneur . impôt . versement libératoire . seuil dépassé": (ctx) => {
return (this.evaluate("impôt . foyer fiscal . revenu fiscal de référence", ctx) > 27519.000000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès . taux de répartition": (ctx) => {
return ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 2.600000 : 1.400000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base . taux de répartition": (ctx) => {
return ((((this.evaluate("date", ctx) >= new Date('2024-07')) === null) || ((this.evaluate("date", ctx) >= new Date('2024-07')) === false)) ? 31.300000 : 28.800000)
},
"dirigeant . auto-entrepreneur . éligible à l'ACRE": (ctx) => {
return ((((this.evaluate("entreprise . durée d'activité . en début d'année", ctx) < 1.000000) === false) || ((this.evaluate("entreprise . durée d'activité . en début d'année", ctx) < 1.000000) === undefined)) ? null : ((ctx["dirigeant . auto-entrepreneur . éligible à l'ACRE"] === undefined) ? false : ctx["dirigeant . auto-entrepreneur . éligible à l'ACRE"]))
},
"entreprise . chiffre d'affaires . service BNC": (ctx) => {
return ctx["entreprise . chiffre d'affaires . service BNC"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . commerce": (ctx) => {
return ((((this.evaluate("entreprise . activité . nature", ctx) === 'commerciale') === false) || ((this.evaluate("entreprise . activité . nature", ctx) === 'commerciale') === undefined)) ? null : (((this.evaluate("entreprise . chiffre d'affaires . service BIC", ctx) * (0.044000 * 1.000000)) * 0.010000) + (((this.evaluate("entreprise . chiffre d'affaires . vente restauration hébergement", ctx) * (0.015000 * 1.000000)) * 0.010000) + 0.000000)))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base . taux de répartition", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité . taux de répartition", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions": (ctx) => {
return (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . TFC", ctx) + (this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . CFP", ctx) + 0.000000)))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité . taux de répartition", ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base . taux de répartition": (ctx) => {
return 41.800000
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace": (ctx) => {
return ((((this.evaluate("établissement . commune . département", ctx) === 'Bas-Rhin') || ((this.evaluate("établissement . commune . département", ctx) === 'Haut-Rhin') || false)) === undefined) ? false : ((this.evaluate("établissement . commune . département", ctx) === 'Bas-Rhin') || ((this.evaluate("établissement . commune . département", ctx) === 'Haut-Rhin') || false)))
},
"entreprise . activités": (ctx) => {
return ctx["entreprise . activités"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition": (ctx) => {
return ctx["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire": (ctx) => {
return ((this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC", ctx) * this.evaluate("dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire . taux de répartition", ctx)) * 0.010000)
}
	}
}
