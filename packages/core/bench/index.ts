import { bench, group, run } from 'mitata'
import modeleSocial from 'modele-social'
import Publicodes from '../src/index'

group('Parsing initial des règles', () => {
	bench('Modele-social', () => {
		new Publicodes(modeleSocial)
	})
})

run()
