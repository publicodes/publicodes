import surveyData from './data.csv';
const percentFormat = new Intl.NumberFormat('fr-FR', { style: 'percent' });

export function load() {
	const enProduction = percentFormat.format(
		surveyData.filter(
			(item) => item['Avez-vous déjà utilisé Publicodes en production ? '] === 'Oui'
		).length / surveyData.length
	);
	const topProjets = Object.entries(
		surveyData.reduce((acc, item) => {
			const projets = item['Pour quels produits ?']?.split(', ') ?? [];
			projets.forEach((projet) => {
				if (acc[projet]) {
					acc[projet]++;
				} else {
					acc[projet] = 1;
				}
			});
			return acc;
		}, {})
	)
		.sort((a, b) => b[1] - a[1])
		.filter(([nom]) => nom && nom !== 'Autre')
		.slice(0, 3);

	const NPS = surveyData.reduce(
		(acc, item) => {
			const note = parseInt(item['Globalement, recommanderiez-vous Publicodes ?']);
			if (!note) {
				return acc;
			}
			if (note >= 9) {
				acc.promote++;
			} else if (note >= 7) {
				acc.passive++;
			} else {
				acc.detract++;
			}
			return acc;
		},
		{ promote: 0, passive: 0, detract: 0 }
	);
	const NPSValue = new Intl.NumberFormat('fr-FR', { maximumSignificantDigits: 2 }).format(
		(100 * (NPS.promote - NPS.detract)) / surveyData.length
	);

	const topAméliorations = Object.entries(
		surveyData.reduce((acc, item) => {
			const améliorations = Object.entries(item)
				.filter(([key, value]) => key.startsWith('Quels chantiers') && value === 'true')
				.map(([key]) =>
					key
						.replace(/Quels chantiers devraient-ils être prioriser \? \((.*)\)/, '$1')
						.replace(/\(.*\)/, '')
				);
			if (!améliorations) {
				return acc;
			}
			améliorations.forEach((amélioration) => {
				if (acc[amélioration]) {
					acc[amélioration]++;
				} else {
					acc[amélioration] = 1;
				}
			});
			return acc;
		}, {})
	)
		.sort((a, b) => b[1] - a[1])
		.filter(([nom]) => nom);

	return {
		enProduction,
		topProjets,
		NPSValue,
		nombreRépondants: surveyData.length,
		topAméliorations
	};
}
