import { describe, expect, it } from 'vitest'
import Engine from '../src/index'
import { parseYaml } from './utils'

describe('inversions', () => {
	it('should handle basic inversion', () => {
		const rules = parseYaml`
        a: b + 10
        b:
          inversion numérique:
            avec:
              - a
      `
		const result = new Engine(rules).setSituation({ a: 30 }).evaluate('b')

		expect(result.nodeValue).toBeCloseTo(30 - 10, 4)
	})

	it('should handle simple inversion', () => {
		const rules = parseYaml`
        net: brut * 77%
        brut:
          formule:
            inversion numérique:
              unité: €
              avec:
                - net
      `
		const result = new Engine(rules)
			.setSituation({ net: '2000 €' })
			.evaluate('brut')

		expect(result.nodeValue).toBeCloseTo(2000 / (77 / 100), 4)
	})

	it('should handle inversion with value at 0', () => {
		const rules = parseYaml`
        net: brut * 77%
        brut:
          formule:
            inversion numérique:
              unité: €
              avec:
                - net
      `
		const result = new Engine(rules)
			.setSituation({ net: '0 €' })
			.evaluate('brut')
		expect(result.nodeValue).toBeCloseTo(0, 4)
	})

	it('should handle inversions with missing variables', () => {
		const rules = parseYaml`
        net:
          produit:
            - assiette
            - # taux
              variations:
              - si: cadre
                alors: 80%
              - sinon: 70%

        brut:
          formule:
            inversion numérique:
              unité: €
              avec:
                - net
        cadre:
        assiette:
            somme:
              - 1200
              - brut
              - taxeOne
        taxeOne:
          non applicable si: cadre
          formule: taxe + taxe
        taxe:
          formule:
            produit:
              - 1200 €
              - variations:
                - si: cadre
                  alors: 80%
                - sinon: 70%
      `
		const result = new Engine(rules)
			.setSituation({ net: '2000 €' })
			.evaluate('brut')
		expect(result.nodeValue).toBeUndefined()
		expect(Object.keys(result.missingVariables)).to.include('cadre')
	})

	it('should reset cache after a failed inversion', () => {
		const rules = parseYaml`
			net:
		      variations:
		        - si: assiette < 100
		          alors: 100
		        - sinon: 200
			assiette: brut
			brut:
			  inversion numérique:
			    avec:
			      - net
		`
		const engine = new Engine(rules)
		engine.setSituation({ net: 150 }).evaluate('brut')
		expect(engine.evaluate('assiette').nodeValue).toBeUndefined()
	})

	it("shouldn't report a missing salary if another salary was input", () => {
		const rules = parseYaml`
        net:
          produit:
            - assiette
            - variations:
              - si: cadre
                alors: 80%
              - sinon: 70%

        total: assiette * 150%

        brut:
          formule:
            inversion numérique:
              unité: €
              avec:
                - net
                - total

        cadre:

        assiette:
          formule: 67 + brut

      `
		const result = new Engine(rules)
			.setSituation({ net: '2000 €', cadre: 'oui' })
			.evaluate('total')
		expect(result.nodeValue).toBeCloseTo(3750, 1)
		expect(result.missingVariables).toEqual({})
	})

	it('should accept syntax without `avec`', () => {
		const rules = parseYaml`
			net:
		      variations:
		        - si: assiette < 100
		          alors: 100
		        - sinon: 200
			assiette: brut
			brut:
			  inversion numérique: net
		`
		const engine = new Engine(rules)
		engine.setSituation({ net: 150 }).evaluate('brut')
		expect(engine.evaluate('assiette').nodeValue).toBeUndefined()
	})

	it('should handle an inversion with min', () => {
		const rules = parseYaml`
        net: brut * 50%
        brut:
          formule:
            inversion numérique:
              unité: €
              avec:
                - net
              min: 1500
      `
		const result = new Engine(rules)
			.setSituation({ net: 1000 })
			.evaluate('brut')

		expect(result.nodeValue).toBe(2000)
	})

	it('should handle an inversion with max', () => {
		const rules = parseYaml`
        net: brut * 50%
        brut:
          formule:
            inversion numérique:
              unité: €
              avec:
                - net
              max: 2500
      `
		const result = new Engine(rules)
			.setSituation({ net: 1000 })
			.evaluate('brut')

		expect(result.nodeValue).toBe(2000)
	})

	it('should not succeed when result are lower than the min', () => {
		const rules = parseYaml`
        net: brut * 50%
        brut:
          formule:
            inversion numérique:
              unité: €
              avec:
                - net
              min: 2500
      `
		const result = new Engine(rules)
			.setSituation({ net: 1000 })
			.evaluate('brut')

		expect(result.nodeValue).toBeUndefined()
	})

	it('should not succeed when result are greater than the max', () => {
		const rules = parseYaml`
        net: brut * 50%
        brut:
          formule:
            inversion numérique:
              unité: €
              avec:
                - net
              max: 1500
      `
		const result = new Engine(rules)
			.setSituation({ net: 1000 })
			.evaluate('brut')

		expect(result.nodeValue).toBeUndefined()
	})

	it('should handle an inversion with "tolérance d\'erreur"', () => {
		const errorTolerance = 0.1
		const rules = parseYaml`
        net: brut * 50%
        brut:
          formule:
            inversion numérique:
              unité: €
              avec:
                - net
              tolérance d'erreur: ${errorTolerance}
      `
		const result = new Engine(rules, { inversionMaxIterations: 1 })
			.setSituation({ net: 1000 })
			.evaluate('brut')
		expect(result.nodeValue).toBeCloseTo(1000 * 2, errorTolerance)
	})
})
