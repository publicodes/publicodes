const colors = {
	'applicable si': '#7B1FA2',
	'non applicable si': '#7B1FA2',
	'est applicable': '#00796B',
	'est non applicable': '#00796B',
	'est défini': '#00796B',
	'est non défini': '#00796B',
	somme: '#18457B',
	plafond: '#EF6C00',
	plancher: '#EF6C00',
	abattement: '#B73731',
	produit: '#2ecc71',
	'une de ces conditions': '#3498db',
	'toutes ces conditions': '#3498db',
	'le maximum de': '#795548',
	'le minimum de': '#795548',
	variations: '#FF9800',
	'par défaut': '#00695C',
	'taux progressif': '#795548',
	barème: '#9B296F',
	grille: '#AD1457',
	'une possibilité': '#00796B',
	avec: '#2653ce',
} as const

export default (name: string) => {
	if (name in colors) {
		return colors[name as keyof typeof colors]
	}
	return 'palevioletred'
}
