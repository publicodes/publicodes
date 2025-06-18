const rules = {
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base . taux de répartition"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base . taux de répartition": (ctx) => {
return 41.800000
},
"entreprise . activité": (ctx) => {
return ctx["entreprise . activité"]
},
"dirigeant . auto-entrepreneur . DROM": (ctx) => {
return (((rules["établissement . commune . département . outre-mer"](ctx) == false) || (undefined !== rules["établissement . commune . département . outre-mer"](ctx))) ? null : true)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . invalidité-décès": (ctx) => {
return (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès"](ctx) + 0.000000))))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . CFP": (ctx) => {
return (((rules["entreprise . chiffre d'affaires . BIC"](ctx) * (((((rules["entreprise . activité . nature"](ctx) == 'artisanale') == null) || ((rules["entreprise . activité . nature"](ctx) == 'artisanale') == false)) ? 0.100000 : 0.300000) * 1.000000)) * 0.010000) + (((rules["entreprise . chiffre d'affaires . service BNC"](ctx) * ((((((rules["date"](ctx) < new Date('2022-01')) && ((rules["dirigeant . auto-entrepreneur . Cipav"](ctx) == false) && true)) == null) || (((rules["date"](ctx) < new Date('2022-01')) && ((rules["dirigeant . auto-entrepreneur . Cipav"](ctx) == false) && true)) == false)) ? 0.200000 : 0.100000) * 1.000000)) * 0.010000) + 0.000000))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès": (ctx) => {
return (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès . taux de répartition"](ctx))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès": (ctx) => {
return (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès . taux de répartition"](ctx))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions . taux de répartition": (ctx) => {
return 29.700000
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions . taux de répartition": (ctx) => {
return ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 36.300000 : 34.000000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions . taux de répartition"](ctx)) * 0.010000)
},
"établissement": (ctx) => {
return ctx["établissement"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . invalidité-décès . taux de répartition": (ctx) => {
return ((((rules["date"](ctx) >= new Date('2026-01')) == null) || ((rules["date"](ctx) >= new Date('2026-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2025-01')) == null) || ((rules["date"](ctx) >= new Date('2025-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 4.100000 : 3.700000) : 3.500000) : 3.250000)
},
"rémunération": (ctx) => {
return ctx["rémunération"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement": (ctx) => {
return ((rules["entreprise . chiffre d'affaires . vente restauration hébergement"](ctx) * (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux"](ctx) * 1.000000)) * 0.010000)
},
"entreprise": (ctx) => {
return ctx["entreprise"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès": (ctx) => {
return (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès . taux de répartition"](ctx))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite": (ctx) => {
return (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite de base"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite complémentaire"](ctx) + 0.000000))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . maladie-maternité": (ctx) => {
return (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité"](ctx) + 0.000000))))
},
"revenu imposable": (ctx) => {
return ctx["revenu imposable"]
},
"dirigeant . auto-entrepreneur . impôt . versement libératoire . montant": (ctx) => {
return (((rules["entreprise . chiffre d'affaires . vente restauration hébergement"](ctx) * (1.000000 * 1.000000)) * 0.010000) + (((rules["entreprise . chiffre d'affaires . service BIC"](ctx) * (1.700000 * 1.000000)) * 0.010000) + (((rules["entreprise . chiffre d'affaires . service BNC"](ctx) * (2.200000 * 1.000000)) * 0.010000) + 0.000000)))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle . taux vente": (ctx) => {
return 0.370000
},
"dirigeant . auto-entrepreneur . DROM . seconde période": (ctx) => {
return (rules["entreprise . durée d'activité . années civiles"](ctx) <= 3.000000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité . taux de répartition": (ctx) => {
return 8.900000
},
"dirigeant . auto-entrepreneur . Acre . taux service BIC": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . Acre . taux Acre"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité . taux de répartition": (ctx) => {
return ((((rules["date"](ctx) >= new Date('2026-01')) == null) || ((rules["date"](ctx) >= new Date('2026-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2025-01')) == null) || ((rules["date"](ctx) >= new Date('2025-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 3.900000 : 3.600000) : 3.400000) : 3.000000)
},
"dirigeant . auto-entrepreneur . revenu net": (ctx) => {
return (rules["entreprise . chiffre d'affaires"](ctx) - rules["dirigeant . auto-entrepreneur . cotisations et contributions"](ctx))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . maladie-maternité . taux de répartition"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . formation professionnelle": (ctx) => {
return rules["dirigeant . auto-entrepreneur . cotisations et contributions . CFP"](ctx)
},
"dirigeant . auto-entrepreneur . DROM . taux CIPAV": (ctx) => {
return (((rules["dirigeant . auto-entrepreneur . DROM . première période"](ctx) == null) || (rules["dirigeant . auto-entrepreneur . DROM . première période"](ctx) == false)) ? (((rules["dirigeant . auto-entrepreneur . DROM . seconde période"](ctx) == null) || (rules["dirigeant . auto-entrepreneur . DROM . seconde période"](ctx) == false)) ? 14.200000 : 10.600000) : 7.100000)
},
"entreprise . chiffre d'affaires . vente restauration hébergement": (ctx) => {
return ctx["entreprise . chiffre d'affaires . vente restauration hébergement"]
},
"date": (ctx) => {
return ctx["date"]
},
"dirigeant . auto-entrepreneur . Acre . taux Acre": (ctx) => {
return ((((rules["entreprise . date de création"](ctx) < new Date('2019-04-01')) == null) || ((rules["entreprise . date de création"](ctx) < new Date('2019-04-01')) == false)) ? ((((rules["entreprise . date de création"](ctx) < new Date('2020-04-01')) == null) || ((rules["entreprise . date de création"](ctx) < new Date('2020-04-01')) == false)) ? ((((rules["entreprise . durée d'activité"](ctx) < 1.000000) == null) || ((rules["entreprise . durée d'activité"](ctx) < 1.000000) == false)) ? null : 50.000000) : 75.000000) : 50.000000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux vente": (ctx) => {
return 0.220000
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition": (ctx) => {
return ctx["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition"]
},
"dirigeant . auto-entrepreneur . DROM . première période": (ctx) => {
return (rules["entreprise . durée d'activité . trimestres civils"](ctx) <= 8.000000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux": (ctx) => {
return ((((rules["date"](ctx) >= new Date('2026-01')) == null) || ((rules["date"](ctx) >= new Date('2026-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2025-01')) == null) || ((rules["date"](ctx) >= new Date('2025-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? ((((rules["date"](ctx) >= new Date('2022-10')) == null) || ((rules["date"](ctx) >= new Date('2022-10')) == false)) ? 22.000000 : 21.100000) : 23.100000) : 24.600000) : 26.100000)
},
"entreprise . durée d'activité . années civiles": (ctx) => {
return ctx["entreprise . durée d'activité . années civiles"]
},
"entreprise . chiffre d'affaires . BIC": (ctx) => {
return ctx["entreprise . chiffre d'affaires . BIC"]
},
"dirigeant . auto-entrepreneur . affiliation CIPAV": (ctx) => {
return rules["dirigeant . auto-entrepreneur . Cipav"](ctx)
},
"dirigeant . auto-entrepreneur . DROM . taux vente restauration hébergement": (ctx) => {
return (((rules["dirigeant . auto-entrepreneur . DROM . première période"](ctx) == null) || (rules["dirigeant . auto-entrepreneur . DROM . première période"](ctx) == false)) ? (((rules["dirigeant . auto-entrepreneur . DROM . seconde période"](ctx) == null) || (rules["dirigeant . auto-entrepreneur . DROM . seconde période"](ctx) == false)) ? 8.200000 : 6.200000) : 2.100000)
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
return rules["entreprise . chiffre d'affaires"](ctx)
},
"dirigeant . auto-entrepreneur . DROM . taux service BIC": (ctx) => {
return (((rules["dirigeant . auto-entrepreneur . DROM . première période"](ctx) == null) || (rules["dirigeant . auto-entrepreneur . DROM . première période"](ctx) == false)) ? (((rules["dirigeant . auto-entrepreneur . DROM . seconde période"](ctx) == null) || (rules["dirigeant . auto-entrepreneur . DROM . seconde période"](ctx) == false)) ? 14.200000 : 10.600000) : 3.600000)
},
"entreprise . durée d'activité . trimestres civils": (ctx) => {
return ctx["entreprise . durée d'activité . trimestres civils"]
},
"entreprise . activité . nature . libérale . réglementée": (ctx) => {
return ctx["entreprise . activité . nature . libérale . réglementée"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions . taux de répartition"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire . taux de répartition": (ctx) => {
return ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 20.750000 : 25.600000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base . taux de répartition"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . invalidité-décès . taux de répartition": (ctx) => {
return 3.100000
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition": (ctx) => {
return ctx["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions . taux de répartition"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . Acre . taux vente restauration hébergement": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . Acre . taux Acre"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux"](ctx)) * 0.010000)
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
return ((undefined !== ctx["dirigeant . auto-entrepreneur . Cipav . adhérent"]) ? false : ctx["dirigeant . auto-entrepreneur . Cipav . adhérent"])
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire . taux de répartition": (ctx) => {
return ((((rules["date"](ctx) >= new Date('2026-01')) == null) || ((rules["date"](ctx) >= new Date('2026-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2025-01')) == null) || ((rules["date"](ctx) >= new Date('2025-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 0.000000 : 7.850000) : 13.000000) : 17.700000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions . taux de répartition": (ctx) => {
return ((((rules["date"](ctx) >= new Date('2026-01')) == null) || ((rules["date"](ctx) >= new Date('2026-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2025-01')) == null) || ((rules["date"](ctx) >= new Date('2025-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 36.500000 : 34.100000) : 32.500000) : 31.200000)
},
"dirigeant . auto-entrepreneur . impôt . versement libératoire": (ctx) => {
return ((undefined !== ctx["dirigeant . auto-entrepreneur . impôt . versement libératoire"]) ? false : ctx["dirigeant . auto-entrepreneur . impôt . versement libératoire"])
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
return ((rules["entreprise . chiffre d'affaires . service BIC"](ctx) * (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux"](ctx) * 1.000000)) * 0.010000)
},
"dirigeant . auto-entrepreneur . Acre . notification calcul ACRE annuel": (ctx) => {
return rules["dirigeant . exonérations . ACRE"](ctx)
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
return ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 21.200000 : 23.200000)
},
"dirigeant . auto-entrepreneur . DROM . taux service BNC": (ctx) => {
return (((rules["dirigeant . auto-entrepreneur . DROM . première période"](ctx) == null) || (rules["dirigeant . auto-entrepreneur . DROM . première période"](ctx) == false)) ? (((rules["dirigeant . auto-entrepreneur . DROM . seconde période"](ctx) == null) || (rules["dirigeant . auto-entrepreneur . DROM . seconde période"](ctx) == false)) ? ((((rules["date"](ctx) >= new Date('2026-01')) == null) || ((rules["date"](ctx) >= new Date('2026-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2025-01')) == null) || ((rules["date"](ctx) >= new Date('2025-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 14.100000 : 15.400000) : 16.400000) : 17.400000) : ((((rules["date"](ctx) >= new Date('2026-01')) == null) || ((rules["date"](ctx) >= new Date('2026-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2025-01')) == null) || ((rules["date"](ctx) >= new Date('2025-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 10.600000 : 11.600000) : 12.300000) : 13.100000)) : ((((rules["date"](ctx) >= new Date('2026-01')) == null) || ((rules["date"](ctx) >= new Date('2026-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2025-01')) == null) || ((rules["date"](ctx) >= new Date('2025-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 3.600000 : 3.900000) : 4.100000) : 4.400000))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . invalidité-décès . taux de répartition": (ctx) => {
return 3.100000
},
"entreprise . durée d'activité . en début d'année": (ctx) => {
return ctx["entreprise . durée d'activité . en début d'année"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire . taux de répartition"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur": (ctx) => {
return ctx["dirigeant . auto-entrepreneur"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC": (ctx) => {
return (rules["dirigeant . auto-entrepreneur . cotisations et contributions . TFC . commerce"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers"](ctx) + 0.000000))
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
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire . taux de répartition"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions . taux de répartition"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations": (ctx) => {
return (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav"](ctx) + 0.000000))))
},
"dirigeant . auto-entrepreneur . Cipav . retraite complémentaire": (ctx) => {
return rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire"](ctx)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC": (ctx) => {
return ((((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav"](ctx) !== null) == false) || (undefined !== (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav"](ctx) !== null))) ? ((rules["entreprise . chiffre d'affaires . service BNC"](ctx) * (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux"](ctx) * 1.000000)) * 0.010000) : null)
},
"entreprise . durée d'activité": (ctx) => {
return ctx["entreprise . durée d'activité"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions . taux de répartition": (ctx) => {
return 29.700000
},
"dirigeant . auto-entrepreneur . revenu net . après impôt": (ctx) => {
return (rules["dirigeant . auto-entrepreneur . revenu net"](ctx) - rules["rémunération . impôt"](ctx))
},
"dirigeant . auto-entrepreneur . Acre . taux service BNC": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . Acre . taux Acre"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . taux"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité . taux de répartition": (ctx) => {
return ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 9.050000 : 10.200000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . autres contributions": (ctx) => {
return (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . autres contributions"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . autres contributions"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . autres contributions"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . autres contributions"](ctx) + 0.000000))))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès": (ctx) => {
return (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès . taux de répartition"](ctx))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers": (ctx) => {
return ((((rules["entreprise . activité . nature"](ctx) == 'artisanale') == false) || (undefined !== (rules["entreprise . activité . nature"](ctx) == 'artisanale'))) ? null : (((rules["entreprise . chiffre d'affaires . service BIC"](ctx) * (rules["dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux service"](ctx) * 1.000000)) * 0.010000) + (((rules["entreprise . chiffre d'affaires . vente restauration hébergement"](ctx) * (rules["dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux vente"](ctx) * 1.000000)) * 0.010000) + 0.000000)))
},
"entreprise . chiffre d'affaires": (ctx) => {
return (rules["entreprise . chiffre d'affaires . BIC"](ctx) + (rules["entreprise . chiffre d'affaires . service BIC"](ctx) + (rules["entreprise . chiffre d'affaires . service BNC"](ctx) + (rules["entreprise . chiffre d'affaires . vente restauration hébergement"](ctx) + 0.000000))))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . taux": (ctx) => {
return ((((rules["date"](ctx) >= new Date('2022-10')) == null) || ((rules["date"](ctx) >= new Date('2022-10')) == false)) ? 12.800000 : 12.300000)
},
"entreprise . date de création": (ctx) => {
return ctx["entreprise . date de création"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base . taux de répartition": (ctx) => {
return ((((rules["date"](ctx) >= new Date('2026-01')) == null) || ((rules["date"](ctx) >= new Date('2026-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2025-01')) == null) || ((rules["date"](ctx) >= new Date('2025-01')) == false)) ? ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 55.500000 : 50.750000) : 47.600000) : 44.850000)
},
"dirigeant . auto-entrepreneur . Cipav": (ctx) => {
return (rules["entreprise . activité . nature . libérale . réglementée"](ctx) || (((rules["entreprise . activité . nature"](ctx) == 'lib\195\169rale') && ((rules["entreprise . date de création"](ctx) < new Date('2018-01')) && ((rules["dirigeant . auto-entrepreneur . Cipav . adhérent"](ctx) == true) && true))) || false))
},
"dirigeant . auto-entrepreneur . impôt": (ctx) => {
return true
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Moselle": (ctx) => {
return ((undefined !== (rules["établissement . commune . département"](ctx) == 'Moselle')) ? false : (rules["établissement . commune . département"](ctx) == 'Moselle'))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire . taux de répartition"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition": (ctx) => {
return ctx["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . taux": (ctx) => {
return ((((rules["date"](ctx) >= new Date('2022-10')) == null) || ((rules["date"](ctx) >= new Date('2022-10')) == false)) ? 22.000000 : 21.200000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . maladie-maternité . taux de répartition"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite de base": (ctx) => {
return (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite de base"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base"](ctx) + 0.000000))))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . répartition . retraite complémentaire": (ctx) => {
return (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite complémentaire"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite complémentaire"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite complémentaire"](ctx) + 0.000000))))
},
"dirigeant . auto-entrepreneur . Acre . taux CIPAV": (ctx) => {
return (((rules["dirigeant . auto-entrepreneur . Cipav"](ctx) == false) || (undefined !== rules["dirigeant . auto-entrepreneur . Cipav"](ctx))) ? null : ((((rules["entreprise . date de création"](ctx) >= new Date('2020-04-01')) == null) || ((rules["entreprise . date de création"](ctx) >= new Date('2020-04-01')) == false)) ? ((rules["dirigeant . auto-entrepreneur . Acre . taux Acre"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux"](ctx)) * 0.010000) : ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 12.100000 : 13.900000)))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base . taux de répartition"](ctx)) * 0.010000)
},
"impôt . foyer fiscal": (ctx) => {
return ctx["impôt . foyer fiscal"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav": (ctx) => {
return (((rules["dirigeant . auto-entrepreneur . Cipav"](ctx) == false) || (undefined !== rules["dirigeant . auto-entrepreneur . Cipav"](ctx))) ? null : ((rules["entreprise . chiffre d'affaires . service BNC"](ctx) * (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . taux"](ctx) * 1.000000)) * 0.010000))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace . taux vente": (ctx) => {
return 0.290000
},
"dirigeant . auto-entrepreneur . Acre": (ctx) => {
return (((rules["dirigeant . exonérations . ACRE"](ctx) == false) || (undefined !== rules["dirigeant . exonérations . ACRE"](ctx))) ? null : ctx["dirigeant . auto-entrepreneur . Acre"])
},
"dirigeant": (ctx) => {
return ctx["dirigeant"]
},
"dirigeant . auto-entrepreneur . impôt . versement libératoire . seuil dépassé": (ctx) => {
return (rules["impôt . foyer fiscal . revenu fiscal de référence"](ctx) > 27519.000000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . invalidité-décès . taux de répartition": (ctx) => {
return ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 2.600000 : 1.400000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC Cipav . répartition . retraite de base . taux de répartition": (ctx) => {
return ((((rules["date"](ctx) >= new Date('2024-07')) == null) || ((rules["date"](ctx) >= new Date('2024-07')) == false)) ? 31.300000 : 28.800000)
},
"dirigeant . auto-entrepreneur . éligible à l'ACRE": (ctx) => {
return ((((rules["entreprise . durée d'activité . en début d'année"](ctx) < 1.000000) == false) || (undefined !== (rules["entreprise . durée d'activité . en début d'année"](ctx) < 1.000000))) ? null : ((undefined !== ctx["dirigeant . auto-entrepreneur . éligible à l'ACRE"]) ? false : ctx["dirigeant . auto-entrepreneur . éligible à l'ACRE"]))
},
"entreprise . chiffre d'affaires . service BNC": (ctx) => {
return ctx["entreprise . chiffre d'affaires . service BNC"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . commerce": (ctx) => {
return ((((rules["entreprise . activité . nature"](ctx) == 'commerciale') == false) || (undefined !== (rules["entreprise . activité . nature"](ctx) == 'commerciale'))) ? null : (((rules["entreprise . chiffre d'affaires . service BIC"](ctx) * (0.044000 * 1.000000)) * 0.010000) + (((rules["entreprise . chiffre d'affaires . vente restauration hébergement"](ctx) * (0.015000 * 1.000000)) * 0.010000) + 0.000000)))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BIC . répartition . retraite de base . taux de répartition"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . maladie-maternité . taux de répartition"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions": (ctx) => {
return (rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . TFC"](ctx) + (rules["dirigeant . auto-entrepreneur . cotisations et contributions . CFP"](ctx) + 0.000000)))
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . maladie-maternité . taux de répartition"](ctx)) * 0.010000)
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition . retraite de base . taux de répartition": (ctx) => {
return 41.800000
},
"dirigeant . auto-entrepreneur . cotisations et contributions . TFC . métiers . taux Alsace": (ctx) => {
return ((undefined !== ((rules["établissement . commune . département"](ctx) == 'Bas-Rhin') || ((rules["établissement . commune . département"](ctx) == 'Haut-Rhin') || false))) ? false : ((rules["établissement . commune . département"](ctx) == 'Bas-Rhin') || ((rules["établissement . commune . département"](ctx) == 'Haut-Rhin') || false)))
},
"entreprise . activités": (ctx) => {
return ctx["entreprise . activités"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition": (ctx) => {
return ctx["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . vente restauration hébergement . répartition"]
},
"dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire": (ctx) => {
return ((rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC"](ctx) * rules["dirigeant . auto-entrepreneur . cotisations et contributions . cotisations . service BNC . répartition . retraite complémentaire . taux de répartition"](ctx)) * 0.010000)
}
};
