import Publicodes from '../source/index'
import { bench, group, run } from 'mitata'
import modeleSocial from 'modele-social'

group('Parsing initial des règles', () => {
	bench('Modele-social', () => {
		new Publicodes(modeleSocial)
	})
})

run()
