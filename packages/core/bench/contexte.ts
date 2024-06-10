import { bench, group, run } from 'mitata'
import modeleSocial from 'modele-social'
import Publicodes from '../src/index'

const engine = new Publicodes(modeleSocial, {
	logger: { warn: () => {}, error: () => {}, log: () => {} },
})

const NUMBER_RULES = 15

group('Contexte vs situation', () => {
	const makeEval1 = () => ({
		valeur: 'salarié . coût total employeur',
	})
	bench('Using the same situation', () => {
		engine.setSituation({
			'salarié . rémunération . net': 45000,
		})
		for (let i = 0; i < NUMBER_RULES; i++) {
			engine.evaluate(makeEval1())
		}
	})

	const makeEval2 = () => ({
		valeur: 'salarié . coût total employeur',
		contexte: {
			'salarié . rémunération . net': 45000,
		},
	})
	bench('Using the same contexte', () => {
		engine.setSituation({})
		for (let i = 0; i < NUMBER_RULES; i++) {
			engine.evaluate(makeEval2())
		}
	})
})

run()
