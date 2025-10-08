const colors = {
	'applicable si': '#7B1FA2',
	'non applicable si': '#7B1FA2',
	'est applicable': '#00796B',
	'est non applicable': '#00796B',
	'est défini': '#00796B',
	'est non défini': '#00796B',
	somme: '#18457B',
	plafond: '#BF360C',
	plancher: '#BF360C',
	abattement: '#B73731',
	produit: '#1E8449',
	'une de ces conditions': '#1B4F72',
	'toutes ces conditions': '#1B4F72',
	'le maximum de': '#795548',
	'le minimum de': '#795548',
	variations: '#BF360C',
	'par défaut': '#00695C',
	'taux progressif': '#795548',
	barème: '#9B296F',
	grille: '#AD1457',
	'une possibilité': '#00796B',
	avec: '#1A237E',
} as const

export default (name: string) => {
	if (name in colors) {
		return colors[name as keyof typeof colors]
	}
	return 'palevioletred'
}
