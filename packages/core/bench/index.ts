import { bench, group, run } from 'mitata'
import modeleSocial from 'modele-social'
import Publicodes from '../src/index'

const engine = new Publicodes(modeleSocial, {
	logger: { warn: () => {}, error: () => {}, log: () => {} },
})

group('Parsing initial des règles', () => {
	bench('Modele-social', () => {
		new Publicodes(modeleSocial)
	})
})

group('Evaluation', () => {
	bench('salaire brut vers net', () => {
		engine.setSituation({
			'salarié . rémunération . brut': 3000,
		})
		engine.evaluate('salarié . rémunération . net')
	})
	bench('Indépendant : CA vers rémunération', () => {
		engine.setSituation({
			"entreprise . chiffre d'affaires": 30000,
		})
		engine.evaluate('dirigeant . rémunération . net . après impôt')
	})
})

group('setSituation', () => {
	bench('small situation - 2 rules', () => {
		engine.setSituation({
			'salarié . rémunération . brut': 3000,
			'salarié . contrat': "'CDD'",
		})
	})
	bench('big situation - 40 rules', () => {
		engine.setSituation({
			'salarié . coût total employeur . aides . emploi franc . éligible': 'non',
			'entreprise . TVA': 'oui',
			'salarié . cotisations . prévoyances . santé . taux employeur': '100%',
			'salarié . cotisations . prévoyances . santé . montant': '100 €/mois',
			'entreprise . association non lucrative': 'non',
			'salarié . contrat . statut cadre': 'non',
			'salarié . cotisations . ATMP . taux fonctions support': 'oui',
			"situation personnelle . domiciliation fiscale à l'étranger": 'non',
			'salarié . régimes spécifiques . impatriés': 'non',
			'salarié . rémunération . frais professionnels . trajets domicile travail . prime de transport . véhicule electrique hybride hydrogène':
				'non',
			'entreprise . salariés . effectif . seuil': "'moins de 50'",
			'salarié . cotisations . exonérations . JEI': 'oui',
			'salarié . contrat . CDD . motif': "'complément formation'",
			'salarié . activité partielle': 'non',
			'salarié . rémunération . frais professionnels . trajets domicile travail . prime de transport . montant': 400,
			'salarié . régimes spécifiques . DFS': 'non',
			'salarié . rémunération . frais professionnels . trajets domicile travail . forfait mobilités durables . montant': 50,
			'salarié . rémunération . frais professionnels . trajets domicile travail . transports publics . taux employeur':
				'75%',
			'salarié . rémunération . frais professionnels . trajets domicile travail . transports publics . montant':
				'84.10 €/mois',
			'salarié . rémunération . frais professionnels . titres-restaurant . montant unitaire':
				{
					valeur: 'déductible . plafond unitaire / taux employeur',
					unité: '€/titre-restaurant',
				},
			'salarié . rémunération . frais professionnels . titres-restaurant . nombre':
				'5 titres-restaurant/semaine * période . semaines par mois',
			'salarié . rémunération . frais professionnels . titres-restaurant':
				'oui',
			'salarié . contrat . temps de travail . temps partiel . heures par semaine':
				'durée légale du travail * 4 / 5',
			'salarié . temps de travail . heures complémentaires': 4,
			'salarié . contrat . CDD . reconduction en CDI': 'non',
			'salarié . contrat . CDD . durée': '6 mois',
			'salarié . contrat . CDD . congés pris':
				'50% * congés dus sur la durée du contrat',
			'salarié . contrat . temps de travail . temps partiel': 'oui',
			'salarié . contrat . CDD . indemnité de fin de contrat': 'oui',
			'salarié . contrat': "'CDD'",
			"salarié . rémunération . primes . fin d'année": 'non',
			'salarié . convention collective': "'droit commun'",
			'salarié . rémunération . primes . activité . base': 40,
			'salarié . rémunération . avantages en nature': 'non',
			'salarié . contrat . salaire brut': '2600 €/mois',
			dirigeant: 'non',
		})
	})
})

await run()

// benchmark                               time (avg)             (min … max)       p75       p99      p995
// -------------------------------------------------------------------------- -----------------------------
// • Parsing initial des règles
// -------------------------------------------------------------------------- -----------------------------
// Modele-social                       382.33 ms/iter (370.02 ms … 416.55 ms) 381.06 ms 416.55 ms 416.55 ms

// summary for Parsing initial des règles
//   Modele-social

// • Evaluation
// -------------------------------------------------------------------------- -----------------------------
// salaire brut vers net                45.98 ms/iter   (43.97 ms … 59.01 ms)  45.66 ms  59.01 ms  59.01 ms
// Indépendant : CA vers rémunération    5.28 ms/iter     (4.81 ms … 8.46 ms)   5.65 ms   6.31 ms   8.46 ms

// summary for Evaluation
//   Indépendant : CA vers rémunération
//    8.71x faster than salaire brut vers net

// • setSituation
// -------------------------------------------------------------------------- -----------------------------
// small situation - 2 rules             1.64 ms/iter     (1.51 ms … 3.55 ms)   1.61 ms   2.15 ms   2.23 ms
// big situation - 40 rules                18 ms/iter   (17.36 ms … 18.54 ms)  18.22 ms  18.54 ms  18.54 ms
