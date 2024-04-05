/*
	Les mécanismes sont testés dans mécanismes/ comme le sont les variables
	directement dans la base Publicodes. On construit dans chaque fichier une base
	Publicodes autonome, dans laquelle intervient le mécanisme à tester, puis on
	teste idéalement tous ses comportements sans en faire intervenir d'autres.
*/

import { expect } from 'chai'
import { describe, it } from 'mocha'
import { parse } from 'yaml'
import Engine from '../src/index'
import { Rule } from '../src/rule'
import { parseUnit } from '../src/units'
import testSuites from './mécanismes/index'

testSuites.forEach(([suiteName, suite]) => {
	// if (suiteName !== 'durée') return
	describe(`Mécanisme ${suiteName}`, () => {
		const engine = new Engine(parse(suite))
		Object.entries(engine.getParsedRules())
			.filter(([, rule]) => !!rule.rawNode.exemples)
			.forEach(([name, test]) => {
				const { exemples, 'unité attendue': defaultUnit } =
					test.rawNode as Rule & {
						'unité attendue': string
					}
				const exemplesArray = Array.isArray(exemples) ? exemples : [exemples]
				exemplesArray.forEach(
					(
						{
							nom: testName,
							situation,
							'valeur attendue': valeur,
							'unité attendue': unit = defaultUnit,
							exception: exception,
							type: type,
							'variables manquantes': expectedMissing,
						},
						i,
					) => {
						it(
							name +
								(testName ? ` [${testName}]`
								: exemples.length > 1 ? ` (${i + 1})`
								: ''),
							() => {
								const runExample = () =>
									engine.setSituation(situation ?? {}).evaluate(name)

								if (exception) {
									expect(runExample).to.throw(new RegExp(exception, 'i'))
									return
								}
								const result = runExample()
								if (typeof valeur === 'number') {
									expect(result.nodeValue).to.be.closeTo(valeur, 0.001)
								} else if (valeur !== undefined) {
									expect(result.nodeValue).to.be.deep.eq(
										valeur === 'undefined' ? undefined : valeur,
									)
								}
								if (expectedMissing) {
									expect(Object.keys(result.missingVariables)).to.eql(
										expectedMissing,
									)
								}
								if (type) {
									expect(
										engine.context.nodesTypes.get(engine.getRule(name))!.type,
									).to.be.equal(type)
								}
								if (unit) {
									expect(result.unit).not.to.be.equal(undefined)
									expect(result.unit).to.deep.equal(parseUnit(unit))
								}
							},
						)
					},
				)
			})
	})
})
