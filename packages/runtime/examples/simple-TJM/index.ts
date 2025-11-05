import rules from './model.publicodes.js'

const revenuNet = rules['revenu net'].evaluate({
	"chiffre d'affaires . TJM": 450,
	'auto-entrepreneur': true,
})

console.log('revenu net: ', revenuNet)
