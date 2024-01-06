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

run()

// After V1
// benchmark                               time (avg)             (min … max)       p75       p99      p995
// -------------------------------------------------------------------------- -----------------------------
// • Parsing initial des règles
// -------------------------------------------------------------------------- -----------------------------
// Modele-social                       378.32 ms/iter (366.09 ms … 403.11 ms) 378.85 ms 403.11 ms 403.11 ms

// summary for Parsing initial des règles
//   Modele-social

// • Evaluation
// -------------------------------------------------------------------------- -----------------------------
// salaire brut vers net                42.59 ms/iter   (40.98 ms … 44.44 ms)  43.21 ms  44.44 ms  44.44 ms
// Indépendant : CA vers rémunération    5.71 ms/iter     (5.34 ms … 6.88 ms)   5.57 ms   6.88 ms   6.88 ms

// Before V1
// benchmark                               time (avg)             (min … max)       p75       p99      p995
// -------------------------------------------------------------------------- -----------------------------
// • Parsing initial des règles
// -------------------------------------------------------------------------- -----------------------------
// Modele-social                       561.39 ms/iter (541.93 ms … 609.24 ms) 575.91 ms 609.24 ms 609.24 ms

// summary for Parsing initial des règles
//   Modele-social

// • Evaluation
// -------------------------------------------------------------------------- -----------------------------
// salaire brut vers net                41.83 ms/iter   (38.99 ms … 46.54 ms)  42.46 ms  46.54 ms  46.54 ms
// Indépendant : CA vers rémunération   11.91 ms/iter      (11 ms … 13.73 ms)  12.23 ms  13.73 ms  13.73 ms
