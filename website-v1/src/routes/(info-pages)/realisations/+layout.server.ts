import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	return {
		title: 'Réalisations',
		description: 'Découvrez les produits qui utilisent Publicodes au quotidien.'
	};
};
