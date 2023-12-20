import { bench, group, run } from 'mitata'
import modeleSocial from 'modele-social'
import Publicodes from '../src/index'

group('Parsing initial des règles', () => {
	bench('Modele-social', () => {
		new Publicodes(modeleSocial)
	})
})

run()

// benchmark                       time (avg)             (min … max)       p75       p99      p995
// ------------------------------------------------------------------ -----------------------------
// • Modele-social
// ------------------------------------------------------------------ -----------------------------
// Parsing initial des règles  480.09 ms/iter (471.03 ms … 497.89 ms)  481.2 ms 497.89 ms 497.89 ms
// Evaluation avec inversion    64.47 ms/iter    (61.8 ms … 66.88 ms)  65.29 ms  66.88 ms  66.88 ms
