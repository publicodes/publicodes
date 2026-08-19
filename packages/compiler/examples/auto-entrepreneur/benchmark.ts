import { run, bench, summary, do_not_optimize, group } from 'mitata'

import LegacyEngine from 'publicodes'

// Test data imports
import autoEntrepreneurLegacyRules from './publicodes-build/index.js'
import rules from './model.publicodes.js'

const situation = {
	"entreprise . chiffre d'affaires . BIC": 0,
	"entreprise . chiffre d'affaires . service BIC": 10000,
	"entreprise . chiffre d'affaires . service BNC": 0,
	"entreprise . chiffre d'affaires . vente restauration hébergement": 0,
	'entreprise . activité . nature': "'libérale'",
	'entreprise . activité . nature . libérale . réglementée': 'non',
	date: '20/05/2025',
	'dirigeant . auto-entrepreneur . Cipav . adhérent': 'non',
}

const contexte = {
	"entreprise . chiffre d'affaires . BIC": 0,
	"entreprise . chiffre d'affaires . service BIC": 10000,
	"entreprise . chiffre d'affaires . service BNC": 0,
	"entreprise . chiffre d'affaires . vente restauration hébergement": 0,
	'entreprise . activité . nature': 'libérale',
	'entreprise . activité . nature . libérale . réglementée': false,
	date: new Date('2025-05-20'),
	'dirigeant . auto-entrepreneur . Cipav . adhérent': false,
}

const testRules: Array<keyof typeof rules> = [
	'dirigeant . auto-entrepreneur . revenu net',
	'entreprise . activité . nature',
	'dirigeant . auto-entrepreneur . cotisations et contributions',
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations',
	'dirigeant . auto-entrepreneur . cotisations et contributions . TFC',
	"entreprise . chiffre d'affaires",
]

const changes = {
	"entreprise . chiffre d'affaires . service BNC": 10000,
	"entreprise . chiffre d'affaires . service BIC": 10000,
}

summary(() => {
	group('Evaluation without cache', () => {
		const legacyEngineAE = new LegacyEngine(autoEntrepreneurLegacyRules)

		bench('Publicodes 1', () => {
			legacyEngineAE.resetCache()
			do_not_optimize(
				legacyEngineAE.evaluate('dirigeant . auto-entrepreneur . revenu net')
					.nodeValue,
			)
		})

		bench('Publicodes 2', () => {
			do_not_optimize(
				rules['dirigeant . auto-entrepreneur . revenu net'].evaluate(contexte),
			)
		})
	})

	group('Multiple rules evaluated first eval', () => {
		const legacyEngineAE = new LegacyEngine(autoEntrepreneurLegacyRules)

		bench('Publicodes 1', () => {
			legacyEngineAE.setSituation(situation)
			testRules.forEach((rule) => {
				do_not_optimize(legacyEngineAE.evaluate(rule).nodeValue)
			})
		})

		bench('Publicodes 2 (with cache)', () => {
			const newContexte = Object.assign({}, contexte)
			testRules.forEach((rule) =>
				do_not_optimize(rules[rule].evaluate(newContexte, { cache: true })),
			)
		})

		bench('Publicodes 2 (without cache)', () => {
			const newContexte = Object.assign({}, contexte)
			testRules.forEach((rule) =>
				do_not_optimize(rules[rule].evaluate(newContexte)),
			)
		})
	})

	group('Multiple engine comparison', () => {
		const legacyEngineAE = new LegacyEngine(autoEntrepreneurLegacyRules)

		bench('Publicodes 1', () => {
			;[situation, Object.assign({}, situation, changes)].forEach((s) => {
				const engine = legacyEngineAE.shallowCopy()
				engine.setSituation(s)
				testRules.forEach((rule) => {
					do_not_optimize(engine.evaluate(rule).nodeValue)
				})
			})
		})

		bench('Publicodes 2 (with cache)', () => {
			const c1 = Object.assign({}, contexte)
			const c2 = Object.assign({}, contexte, changes)
			;[c1, c2].forEach((c) =>
				testRules.forEach((rule) =>
					do_not_optimize(rules[rule].evaluate(c, { cache: true })),
				),
			)
		})

		bench('Publicodes 2 (without cache)', () => {
			const c1 = Object.assign({}, contexte)
			const c2 = Object.assign({}, contexte, changes)
			;[c1, c2].forEach((c) =>
				testRules.forEach((rule) => do_not_optimize(rules[rule].evaluate(c))),
			)
		})
	})
})

await run({
	format: 'mitata',
	throw: true,
})
