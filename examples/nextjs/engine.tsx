import Engine from 'publicodes'
import yaml from 'yaml'

export default new Engine(
	yaml.parse(`

prix:
  avec:
    carottes: 2€/kg
    champignons: 5€/kg
    avocat: 2€/avocat

dépenses primeur:
  somme:
    - prix . carottes * 1.5 kg
    - prix . champignons * 500g
    - prix . avocat * 3 avocat
`),
)
