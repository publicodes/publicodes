import { bench, group, run } from 'mitata'
import modeleSocial from 'modele-social'
import Publicodes from '../src/index'
const engine = new Publicodes(modeleSocial)
group('Parsing initial des règles', () => {
	bench('Modele-social', () => {
		new Publicodes(modeleSocial)
	})
})
group('Evaluation', () => {
	bench('Modele-social', () => {
		engine.setSituation({
			'dirigeant . indépendant': 'oui',
			"entreprise . chiffre d'affaires": '100000 €/an',
		})
		engine.evaluate('dirigeant . rémunération . net . après impôt')
	})
})

run()
