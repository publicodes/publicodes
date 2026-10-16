import type { ParameterState } from './types'

/**
 * Everything a reader reads that is not the model's own words. It lives here, with
 * the mechanisms' names, so there is one place to look for the library's French and
 * one place to change it.
 */
export const PARAMETER_NOTES: Record<ParameterState, string> = {
	fournie: 'Paramètre du modèle : cette valeur n’est pas calculée ici.',
	'par défaut':
		'Paramètre du modèle : valeur par défaut, que vous pouvez remplacer.',
	'non renseignée': 'Paramètre du modèle : aucune valeur n’a été fournie.',
}

/** Ce qu'une ligne d'un contexte vaut : le nom de la colonne qui le dit. */
export const CONTEXT_VALUE = 'valeur du paramètre'

/** A rule the model does not compute where it is read. */
export const NO_COMPUTATION =
	'Cette règle n’a pas de calcul propre : sa valeur vient du contexte.'

/** A page projected without an evaluation to read values from. */
export const GENERIC_FILL =
	'Aucun contexte n’a été fourni : les valeurs ne sont pas calculées.'

/** What a fiche ends on when it holds nothing else. */
export const EMPTY_EQUATION = 'Aucun terme à montrer.'

/** The fold control's label, which is also its accessible name. */
export function foldLabel(count: number, expanded: boolean): string {
	if (expanded) return 'Masquer les termes sans effet'
	return `Afficher ${count} terme${count > 1 ? 's' : ''} sans effet`
}
