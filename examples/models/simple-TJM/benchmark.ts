import { run, bench, summary, do_not_optimize, group } from 'mitata'
import LegacyEngine from 'publicodes'
import assert from 'assert'

// Test data imports
import localRules from './model.publicodes.js'
import legacyRules from './publicodes-build/index.js'

const legacyEngineSimple = new LegacyEngine(legacyRules)

// Test situations
const simpleSituation = {
	"chiffre d'affaires . TJM": 10000,
	charges: 100,
}

const simpleSituationResults = {
	'revenu net': 125900,
	'projections . quatre cinquième': 100700,
	cotisations: 84000,
}

summary(() => {
	// sans situation, les deux moteurs s'arrêtent sur une absence : ce groupe mesure la
	// traversée d'une règle à l'autre, pas un chiffre
	group('Evaluation without cache', () => {
		bench('Publicodes 1', () => {
			legacyEngineSimple.resetCache()
			do_not_optimize(
				legacyEngineSimple.evaluate('projections . quatre cinquième').nodeValue,
			)
		})

		bench('Publicodes 2', () => {
			do_not_optimize(
				localRules['projections . quatre cinquième'].evaluate().value,
			)
		})
	})

	group('Multiple rules evaluation with cache', () => {
		bench('Publicodes 1', () => {
			legacyEngineSimple.setSituation(simpleSituation)

			let revenuNet
			do_not_optimize(
				(revenuNet = legacyEngineSimple.evaluate('revenu net').nodeValue),
			)
			assert(
				revenuNet === simpleSituationResults['revenu net'],
				`Expected ${simpleSituationResults['revenu net']}, got ${revenuNet}`,
			)

			let projection
			do_not_optimize(
				(projection = legacyEngineSimple.evaluate(
					'projections . quatre cinquième',
				).nodeValue),
			)
			assert(
				projection === simpleSituationResults['projections . quatre cinquième'],
				`Expected ${simpleSituationResults['projections . quatre cinquième']}, got ${projection}`,
			)

			let cotisations
			do_not_optimize(
				(cotisations = legacyEngineSimple.evaluate('cotisations').nodeValue),
			)
			assert(
				cotisations === simpleSituationResults['cotisations'],
				`Expected ${simpleSituationResults['cotisations']}, got ${cotisations}`,
			)
		})

		bench('Publicodes 2', () => {
			let revenuNet
			do_not_optimize(
				(revenuNet = localRules['revenu net'].evaluate(simpleSituation, {
					cache: true,
				}).value),
			)
			assert(
				revenuNet === simpleSituationResults['revenu net'],
				`Expected ${simpleSituationResults['revenu net']}, got ${revenuNet}`,
			)

			let projection
			do_not_optimize(
				(projection = localRules['projections . quatre cinquième'].evaluate(
					simpleSituation,
					{ cache: true },
				).value),
			)
			assert(
				projection === simpleSituationResults['projections . quatre cinquième'],
				`Expected ${simpleSituationResults['projections . quatre cinquième']}, got ${projection}`,
			)

			let cotisations
			do_not_optimize(
				(cotisations = localRules['cotisations'].evaluate(simpleSituation, {
					cache: true,
				}).value),
			)
			assert(
				cotisations === simpleSituationResults['cotisations'],
				`Expected ${simpleSituationResults['cotisations']}, got ${cotisations}`,
			)
		})
	})
})

await run({
	format: 'mitata',
	throw: true,
})
