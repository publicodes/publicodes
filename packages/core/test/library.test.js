import { expect } from 'chai'
import Engine from '../source/index'

describe('library', function () {
	it('should let the user define its own rule', function () {
		let rules = `
yo:
  formule: 200
ya:
  formule:  yo + 1
yi:
  formule:  yo + 2
`
		let engine = new Engine(rules)

		expect(engine.evaluate('ya').nodeValue).to.equal(201)
		expect(engine.evaluate('yi').nodeValue).to.equal(202)
	})

	it('should let the user define a simplified revenue tax system', function () {
		let rules = `
revenu imposable:
  question: Quel est votre revenu imposable ?
  unité: €

revenu abattu:
  formule:
		valeur: revenu imposable
		abattement: 10%

impôt sur le revenu:
  formule:
    barème:
      assiette: revenu abattu
      tranches:
        - taux: 0%
          plafond: 9807 €
        - taux: 14%
          plafond: 27086 €
        - taux: 30%
          plafond: 72617 €
        - taux: 41%
          plafond: 153783 €
        - taux: 45%

impôt sur le revenu à payer:
  formule:
		valeur: impôt sur le revenu
		abattement:
			valeur: 1177 - (75% * impôt sur le revenu)
			plancher: 0
`

		let engine = new Engine(rules)
		engine.setSituation({
			'revenu imposable': '48000',
		})
		let value = engine.evaluate('impôt sur le revenu à payer')
		expect(value.nodeValue).to.equal(7253.26)
	})

	it('should let the user define a rule base on a completely different subject', function () {
		let engine = new Engine(co2Rules)
		engine.setSituation({
			'douche . nombre': 30,
			'chauffage . type': "'gaz'",
			'douche . durée de la douche': 10,
		})
		let value = engine.evaluate('douche . impact')
		expect(value.nodeValue).to.be.within(40, 41)
	})
})

const co2Rules = `
douche:
  icônes: 🚿

douche . impact:
  icônes: 🍃
  unité: kgCO2eq
  formule: impact par douche * douche . nombre

douche . nombre:
  question: Combien prenez-vous de douches ?
  par défaut: 30 douches
  suggestions:
    Une par jour: 30

douche . impact par douche:
  formule: impact par litre * litres d'eau par douche
douche . impact par litre:
  formule: eau . impact par litre froid + chauffage . impact par litre
douche . litres d'eau par douche:
  icônes: 🇱
  formule: durée de la douche * litres par minute / 1 douche

douche . litres par minute:
  unité: l/min
  formule:
    variations:
      - si: pomme de douche économe
        alors: 9
      - sinon: 18
  références:
    économise l'eau: https://www.jeconomiseleau.org/index.php/particuliers/economies-par-usage/la-douche-et-le-bain

douche . pomme de douche économe:
  question: Utilisez-vous une pomme de douche économe ?
  par défaut: non

eau:
  icônes: 💧

eau . impact par litre froid:
  unité: kgCO2eq/l
  formule: 0.000132

chauffage:
  icônes: 🔥

chauffage . type:
  question: Comment est chauffée votre eau ?
  formule:
    une possibilité:
      choix obligatoire: oui
      possibilités:
        - gaz
        - fioul
        - électricité
  par défaut: "'gaz'"

chauffage . type . gaz:
  icônes: 🔵
chauffage . type . fioul:
  icônes: 🛢️
chauffage . type . électricité:
  icônes: ⚡

# définir ces éléments un par un

chauffage . impact par kWh:
  unité: kgCO2eq/kWh PCI
  formule:
    variations:
      - si: type = 'gaz'
        alors: 0.227
      - si: type = 'fioul'
        alors: 0.324
      - si: type = 'électricité'
        alors: 0.059

  notes: |
    La base carbone de l'ADEME ne permet malheureusement pas de faire des liens profonds vers les chiffres utilisés.
    Pour l'électricité, nous retenons le chiffre de l'ADEME "Electricité - 2016 - usage : Eau Chaude Sanitaire - consommation".
  références:
    base carbone ADEME: http://www.bilans-ges.ademe.fr/fr/accueil
    électricité: https://www.electricitymap.org/?page=country&solar=false&remote=true&wind=false&countryCode=FR
    électricité sur Décrypter l'Energie: https://decrypterlenergie.org/decryptage-quel-est-le-contenu-en-co2-du-kwh-electrique

chauffage . énergie consommée par litre:
  formule: 0.0325
  unité: kWh
  références:
    analyse du prix d'une douche: https://www.econologie.com/forums/plomberie-et-sanitaire/prix-reel-d-un-bain-ou-d-une-douche-pour-l-eau-et-chauffage-t12727.html

chauffage . impact par litre:
  formule: impact par kWh * énergie consommée par litre
# Meilleure syntaxe : nouveau mécanisme correspondance
# mais où désigne-t-on ce sur quoi la correspondance se fait ? Est-ce implicite ? Ici le chauffage.
# formule:
#    correspondance:
#      gaz: 30
#      fioul: 50
#      électricité: 2

douche . durée de la douche:
  question: Combien de temps dure votre douche en général ?
  par défaut: 5 min
  suggestions:
    expresse: 5
    moyenne: 10
    lente: 20
`
