import { describe, expect, it } from 'vitest'
import yaml from 'yaml'
import Engine from '../src/index'
import { assert } from 'chai'

describe('Missing variables', () => {
	it('should identify missing variables in applicability', () => {
		const rawRules = {
			startHere: {
				formule: 2,
				'non applicable si': 'ko',
			},
			ko: {},
		}
		const result = new Engine(rawRules).evaluate('startHere').missingVariables

		expect(Object.keys(result)).toEqual(['ko'])
	})

	it('should identify missing variables in formulas', () => {
		const rawRules = {
			startHere: {
				formule: '2 + ko',
			},
			ko: {},
		}
		const result = new Engine(rawRules).evaluate('startHere').missingVariables

		expect(Object.keys(result)).toEqual(['ko'])
	})

	it('should identify missing variables along the namespace tree', () => {
		const rawRules = {
			startHere: {
				formule: 2,
				'non applicable si': 'evt . ko',
			},
			evt: {
				'une possibilité': ['ko', { ki: {} }],
				titre: 'Truc',
				question: '?',
			},
			'evt . ko': {
				valeur: "evt = 'ko'",
			},
		}
		const result = new Engine(rawRules).evaluate('startHere').missingVariables

		expect(Object.keys(result)).toEqual(['evt'])
	})

	it('should not identify missing variables from static rules', () => {
		const rawRules = {
			startHere: {
				formule: 2,
				'non applicable si': 'evt . welldefined . ko',
			},
			evt: {},
			'evt . welldefined': {
				formule: '1 + 1',
				titre: 'Truc',
				question: '?',
			},
			'evt . welldefined . ko': {},
		}
		const result = new Engine(rawRules).evaluate('startHere').missingVariables

		expect(Object.keys(result)).toEqual(['evt . welldefined . ko'])
	})

	it('should identify missing variables mentioned in expressions', () => {
		const rawRules = {
			sum: 'oui',
			'sum . evt': 'oui',
			'sum . startHere': {
				formule: 2,
				'non applicable si': 'evt . nyet > evt . nope',
			},
			'sum . evt . nope': {},
			'sum . evt . nyet': {},
		}
		const result = new Engine(rawRules).evaluate(
			'sum . startHere',
		).missingVariables

		expect(Object.keys(result)).toContain('sum . evt . nyet')
		expect(Object.keys(result)).toContain('sum . evt . nope')
	})

	it('should ignore missing variables in the formula if not applicable', () => {
		const rawRules = {
			sum: 'oui',
			'sum . startHere': {
				formule: 'trois',
				'non applicable si': '3 > 2',
			},
			'sum . trois': {},
		}
		const result = new Engine(rawRules).evaluate(
			'sum . startHere',
		).missingVariables

		expect(Object.keys(result)).toHaveLength(0)
	})

	it('should ignore missing variables from the parent', () => {
		const rawRules = {
			a: {
				somme: ['b', 'c'],
				avec: {
					b: {},
					c: {},
				},
			},
		}
		const missingVariables = new Engine(rawRules).evaluate(
			'a . b',
		).missingVariables

		expect(Object.keys(missingVariables)).toEqual(['a . b'])
	})

	it('should ignore missing variables from the non nullable parent', () => {
		const rawRules = {
			a: {
				'applicable si': 'oui',
				somme: ['b', 'c'],
				avec: {
					b: {},
					c: {},
				},
			},
		}
		const missingVariables = new Engine(rawRules).evaluate(
			'a . b',
		).missingVariables

		expect(Object.keys(missingVariables)).toEqual(['a . b'])
	})

	it('should not report missing variables when "one of these" short-circuits', () => {
		const rawRules = {
			sum: 'oui',
			'sum . startHere': {
				formule: 'trois',
				'non applicable si': {
					'une de ces conditions': ['3 > 2', 'trois'],
				},
			},
			'sum . trois': {},
		}
		const result = new Engine(rawRules).evaluate(
			'sum . startHere',
		).missingVariables

		expect(Object.keys(result)).toHaveLength(0)
	})

	it('should report "une possibilité" as a missing variable even though it has a formula', () => {
		const rawRules = {
			top: 'oui',
			ko: 'oui',
			'top . startHere': { formule: 'trois' },
			'top . trois': {
				'une possibilité': ['ko', { ki: {} }],
			},
		}
		const result = new Engine(rawRules).evaluate(
			'top . startHere',
		).missingVariables

		expect(Object.keys(result)).toContain('top . trois')
	})

	it('should not report missing variables when "une possibilité" is inapplicable', () => {
		const rawRules = {
			top: 'oui',
			ko: 'oui',
			'top . startHere': { formule: 'trois' },
			'top . trois': {
				'une possibilité': ['ko', { ki: {} }],
				'non applicable si': 'oui',
			},
		}
		const result = new Engine(rawRules).evaluate(
			'top . startHere',
		).missingVariables

		expect(Object.keys(result)).toHaveLength(0)
	})

	it('should not report missing variables when "une possibilité" was answered', () => {
		const rawRules = {
			top: 'oui',
			ko: 'oui',
			'top . startHere': { formule: 'trois' },
			'top . trois': {
				'une possibilité': ['ko', 'ki'],
			},
			'top . trois . ko': {},
			'top . trois . ki': {},
		}
		const result = new Engine(rawRules)
			.setSituation({ 'top . trois': "'ko'" })
			.evaluate('top . startHere').missingVariables

		expect(Object.keys(result)).toHaveLength(0)
	})

	it('should report missing variables in simple variations', () => {
		const rawRules = yaml.parse(`

somme: a + b
a: 10
b:
  formule:
    variations:
      - si: a > 100
        alors: c
      - sinon: 0
c:
  question: Alors ?`)
		const result = new Engine(rawRules).evaluate('somme').missingVariables

		expect(Object.keys(result)).toHaveLength(0)
	})

	// TODO : réparer ce test
	it('should report missing variables in variations', () => {
		const rawRules = yaml.parse(`
startHere:
  formule:
    somme:
      - variations
variations:
  formule:
    variations:
      - si: dix
        alors:
          barème:
            assiette: 2008
            multiplicateur: deux
            tranches:
              - plafond: 1
                taux: 0.1
              - plafond: 2
                taux: trois
              - taux: 10
      - si: 3 > 4
        alors:
          barème:
            assiette: 2008
            multiplicateur: quatre
            tranches:
              - plafond: 1
                taux: 0.1
              - plafond: 2
                taux: 1.8
              - au-dessus de: 2
                taux: 10

dix: {}
deux: {}
trois: {}
quatre: {}

      `)
		const result = new Engine(rawRules).evaluate('startHere').missingVariables

		expect(Object.keys(result)).toContain('dix')
		expect(Object.keys(result)).toContain('deux')
		expect(Object.keys(result)).toContain('trois')
		expect(Object.keys(result)).not.toContain('quatre')
	})
})

describe('nextSteps', () => {
	it('should generate questions for simple situations', () => {
		const rawRules = {
			top: 'oui',
			'top . sum': { formule: 'deux' },
			'top . deux': {
				'non applicable si': 'top . sum . evt',
				formule: 2,
			},
			'top . sum . evt': {
				titre: 'Truc',
				question: '?',
			},
		}
		const result = new Engine(rawRules).evaluate('top . sum').missingVariables

		expect(Object.keys(result)).toHaveLength(1)
		expect(Object.keys(result)[0]).toBe('top . sum . evt')
	})

	it('should generate questions', () => {
		const rawRules = {
			top: 'oui',
			'top . sum': { formule: 'deux' },
			'top . deux': {
				formule: 'sum . evt',
			},
			'top . sum . evt': {
				question: '?',
			},
		}

		const result = new Engine(rawRules).evaluate('top . sum').missingVariables
		expect(Object.keys(result)).toHaveLength(1)
		expect(Object.keys(result)[0]).toBe('top . sum . evt')
	})

	it('should generate questions with more intricate situation', () => {
		const rawRules = {
			top: 'oui',
			'top . sum': { formule: { somme: [2, 'deux'] } },
			'top . deux': {
				formule: 2,
				'non applicable si': "top . sum . evt = 'ko'",
			},
			'top . sum . evt': {
				'une possibilité': ['ko', 'ki'],
				titre: 'Truc',
				question: '?',
			},
			'top . sum . evt . ko': {},
			'top . sum . evt . ki': {},
		}
		const result = new Engine(rawRules).evaluate('top . sum').missingVariables

		expect(Object.keys(result)).toEqual(['top . sum . evt'])
	})

	it("Parent's other descendants in sums should not be included as missing variables", () => {
		// See https://github.com/publicodes/publicodes/issues/33
		const rawRules = yaml.parse(`
transport:
  somme:
    - voiture
    - avion

transport . voiture:
  formule: empreinte * km

transport . voiture . empreinte: 0.12
transport . voiture . km:
  question: COMBIENKM
  par défaut: 1000

transport . avion:
  applicable si: usager
  formule: empreinte * km

transport . avion . km:
  question: COMBIENKM
  par défaut: 10000

transport . avion . empreinte: 0.300

transport . avion . usager:
  question: Prenez-vous l'avion ?
  par défaut: oui
`)
		const result = new Engine(rawRules).evaluate(
			'transport . avion',
		).missingVariables

		expect(Object.keys(result)).toEqual([
			'transport . avion . usager',
			'transport . avion . km',
		])
	})

	it("Parent's other descendants in sums should not be included as missing variables, even when parent evluation is triggered by a comparison", () => {
		// See https://github.com/publicodes/publicodes/issues/33
		const rawRules = yaml.parse(`
transport:
  somme:
    - voiture
    - avion

transport . voiture:
  formule: empreinte * km

transport . voiture . gabarit:
  question: Quel gabarit ?
  par défaut: 2
transport . voiture . empreinte:
  formule:
    variations:
      - si: gabarit > 3
        alors: 800
      - sinon: 500
transport . voiture . km:
  question: COMBIENKM
  par défaut: 1000

transport . avion:
  applicable si: usager
  formule: empreinte * km

transport . avion . km:
  question: COMBIENKM
  par défaut: 10000

transport . avion . empreinte: 0.300

transport . avion . usager:
  question: Prenez-vous l'avion ?
  par défaut: oui
`)
		const result = new Engine(rawRules).evaluate(
			'transport . voiture',
		).missingVariables

		expect(Object.keys(result)).toEqual([
			'transport . voiture . gabarit',
			'transport . voiture . km',
		])
	})

	it("Parent's other descendants in sums should not be included as missing variables - 2", () => {
		// See https://github.com/publicodes/publicodes/issues/33
		const rawRules = yaml.parse(`
avion:
  question: prenez-vous l'avion ?
  par défaut: oui

avion . impact:
  formule:
    somme:
      - au sol
      - en vol

avion . impact . en vol:
  question: Combien de temps passé en vol ?
  par défaut: 10

avion . impact . au sol: 5
`)
		const result = new Engine(rawRules).evaluate(
			'avion . impact . au sol',
		).missingVariables

		expect(Object.keys(result)).toEqual(['avion'])
	})

	it("Parent's other descendants in sums in applicability should be included as missing variables", () => {
		// See https://github.com/publicodes/publicodes/issues/33
		const rawRules = yaml.parse(`
a:
  applicable si: d > 3
  valeur: oui

d:
 formule:
   somme:
     - e
     - 8

e:
  question: Vous venez à combien à la soirée ?
  par défaut: 3

a . b: 20 + 9
`)
		const result = new Engine(rawRules).evaluate('a . b').missingVariables

		expect(Object.keys(result)).toEqual(['e'])
		expect(Object.keys(result)).toHaveLength(1)
	})

	it('Should report missing variable from une possibilité', () => {
		const rawRules = yaml.parse(`
contrat:
  une possibilité:
    - stage
    - CDI
    - CDD
  avec:
    stage:
      valeur: contrat = 'stage'
      rend non applicable: temps partiel
    CDI:
      valeur: contrat = 'CDI'
    CDD:
      valeur: contrat = 'CDD'

contrat . temps partiel:
  par défaut: oui
	
`)
		const result = new Engine(rawRules).evaluate(
			'contrat . temps partiel',
		).missingVariables

		assert.hasAllKeys(result, ['contrat', 'contrat . temps partiel'])
		expect(result['contrat']).toBeGreaterThan(result['contrat . temps partiel'])
	})

	it('Should report missing variable from parent applicability first', () => {
		const rawRules = yaml.parse(`

a:
  
b: 
  valeur: oui # TODO : this test doesn't pass when we remove this...
  applicable si: a

b . c: 
b . d: c + c + c + c
	
`)
		const result = new Engine(rawRules).evaluate('b . d').missingVariables

		assert.hasAllKeys(result, ['a', 'b . c'])
		expect(result['a']).toBeGreaterThan(result['b . c'])
	})

	it('Should report missing variable from par défaut with a lesser score', () => {
		const rawRules = yaml.parse(`

a:
    par défaut: b
a . b: 
    par défaut: 5
`)
		const result = new Engine(rawRules).evaluate('a').missingVariables

		assert.hasAllKeys(result, ['a', 'a . b'])
		expect(result['a']).toBeGreaterThan(result['a . b'])
	})

	it('Should report missing variable even if default value is 0', () => {
		const rawRules = yaml.parse(`


a: b
a . b:
  par défaut: 0
`)
		const result = new Engine(rawRules).evaluate('a').missingVariables

		assert.hasAllKeys(result, ['a . b'])
	})
})
