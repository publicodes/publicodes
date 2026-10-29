import type { ParameterState } from './types'

/** Le fait d'un paramètre : ce qu'il est, quand la page ne dit rien de ce qui est entré. */
export const PARAMETER_NOTE = 'Ce paramètre est une entrée du modèle.'

/**
 * Everything a reader reads that is not the model's own words. It lives here, with
 * the mechanisms' names, so there is one place to look for the library's French and
 * one place to change it.
 */
export const PARAMETER_NOTES: Record<ParameterState, string> = {
	fournie: PARAMETER_NOTE,
	'par défaut':
		'Cette valeur est un paramètre d’entrée du modèle : elle vient d’une valeur par défaut, que vous pouvez remplacer.',
	'non renseignée':
		'Cette valeur est un paramètre d’entrée du modèle : aucune valeur n’a été fournie.',
}

/** Ce qu'une ligne de paramètre écrit quand rien n'est entré. */
export const NOT_PROVIDED = 'non renseignée'

/** Ce qu'un `contexte` a décidé, quand ce n'est pas le lecteur qui a fourni la valeur. */
export const BOUND_NOTE =
	'Cette valeur est fixée par le contexte du calcul : elle remplace celle du paramètre.'

/** Le mot d'une ligne qui dit ce qui est entré dans un paramètre, avant sa chaîne. */
export const PARAMETER_INPUT = 'paramètre d’entrée'

/** Les deux mots qui nomment les colonnes d'un contexte, ceux du calcul. */
export const CONTEXT_NAME = 'contexte'
export const CONTEXT_VALUE = 'valeur du paramètre'

/** A rule the model does not compute where it is read. */
export const NO_COMPUTATION =
	'Cette règle n’a pas de calcul propre : sa valeur vient du contexte.'

/** The fold control's label, which is also its accessible name. */
export function foldLabel(count: number, expanded: boolean): string {
	if (expanded) return 'Masquer les termes sans effet'
	return `Afficher ${count} terme${count > 1 ? 's' : ''} sans effet`
}

/** The same control, for the parameters a computation did not take from the reader. */
export function contextFoldLabel(count: number, expanded: boolean): string {
	if (expanded) return 'Masquer les paramètres sans valeur fournie'
	return `Afficher ${count} paramètre${count > 1 ? 's' : ''} sans valeur fournie`
}
