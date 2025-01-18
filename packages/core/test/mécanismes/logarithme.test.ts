/*
	Les mécanismes sont testés dans mécanismes/ comme le sont les variables
	directement dans la base Publicodes. On construit dans chaque fichier une base
	Publicodes autonome, dans laquelle intervient le mécanisme à tester, puis on
	teste idéalement tous ses comportements sans en faire intervenir d'autres.
*/

import fs from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { parse } from 'yaml'
import Engine from '../../src/index'

let engine
describe(``, () => {
	before(function () {
		const _dirname = dirname(fileURLToPath(import.meta.url))
		const rules = fs.readFileSync(join(_dirname, `logarithme.yaml`), 'utf8')
		engine = new Engine(parse(rules))
	})

	it('logarithme engine ready', () => {
		expect(engine).not.to.be.undefined
	})

	it('calculate log de 1 = 0', () => {
		const result = engine.evaluate(`mon résultat`).nodeValue
		expect(result).equal(0)
	})

	it('calculate log de 12 arrondi à 2 décimales', () => {
		const result = engine.evaluate(`résultat`).nodeValue
		expect(result).equal(Math.round(Math.log(12) * 100) / 100)
		expect(result).not.equal(0)
	})
})
