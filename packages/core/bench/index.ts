import { bench, group, run } from 'mitata'
import modeleSocial from 'modele-social'
import modeleNGC from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json' assert { type: 'json' }
import EngineLocal from '../src/index'
import EngineOld from 'publicodes-old'
import pjson from '../package.json'

const oldVersion = pjson['devDependencies']['publicodes-old']

const options = {
	logger: { warn: () => {}, error: () => {}, log: () => {} },
}

group('Parsing initial des règles (Modele-social)', () => {
	bench(oldVersion, () => {
		new EngineOld(modeleSocial, options)
	})
	bench('(local)', () => {
		new EngineLocal(modeleSocial, options)
	})
})

group('Parsing initial des règles (NGC)', () => {
	bench(oldVersion, () => {
		new EngineOld(modeleNGC as any, options)
	})
	bench('(local)', () => {
		new EngineLocal(modeleNGC as any, options)
	})
})

const local = new EngineLocal(modeleSocial, options)
const old = new EngineOld(modeleSocial, options)

group('engine.evaluate | salaire brut -> net', () => {
	const situation1 = {
		'salarié . rémunération . brut': 3000,
	}

	bench('(local)', () => {
		local.setSituation(situation1)
		local.evaluate('salarié . rémunération . net')
	})

	bench(`${oldVersion}`, () => {
		old.setSituation(situation1)
		old.evaluate('salarié . rémunération . net')
	})
})

group('engine.evaluate | salaire net -> brut (inversion)', () => {
	const situation2 = {
		'salarié . rémunération . net': 2000,
	}

	bench('(local)', () => {
		local.setSituation(situation2)
		local.evaluate('salarié . rémunération . brut')
	})

	bench(`${oldVersion}`, () => {
		old.setSituation(situation2)
		old.evaluate('salarié . rémunération . brut')
	})
})

group('engine.setSituation | few rules', () => {
	const situation = {
		'salarié . rémunération . brut': 3000,
		'salarié . contrat': "'CDD'",
	}

	bench('(local)', () => {
		local.setSituation(situation)
	})

	bench(`${oldVersion}`, () => {
		old.setSituation(situation)
	})
})
group('engine.setSituation | many rules', () => {
	const bigSituation = {
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
		'salarié . rémunération . frais professionnels . titres-restaurant': 'oui',
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
	}

	bench('(local)', () => {
		local.setSituation(bigSituation)
	})

	bench(`${oldVersion}`, () => {
		old.setSituation(bigSituation)
	})
})

await run()
