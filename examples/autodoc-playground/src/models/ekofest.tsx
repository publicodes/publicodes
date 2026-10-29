import { createPathNavigation } from '@publicodes/autodoc-core'
import { Autodoc, createPathLink } from '@publicodes/autodoc-react'
import * as model from '../../models/ekofest/model.publicodes.js'
import ast from '../../models/ekofest/model.publicodes.json'
import { asAst } from './ast'
import { DocumentationPage } from '../DocumentationPage'
import { toUrl } from '../hash-route'

export const basePath = '/ekofest'

/** Un « petit festival en centre-ville » : la situation que le modèle d'origine propose. */
const contexte = {
	'informations . nombre de festivaliers': 3000,
	'informations . nombre de jours': 3,
	'transport . public . accessible en transports en commun': true,
	'infrastructures . scénographie . nombre petites scènes': 1,
	'infrastructures . scénographie . nombre grandes scènes': 0,
}

/** Les adresses du modèle : quel chemin nomme quelle règle, et réciproquement. */
const pages = createPathNavigation({
	outputs: model.outputs,
	parameters: model.parameters,
	basePath,
	toUrl,
})

/** Le calcul, sur un vrai modèle : 306 règles, un import, huit résultats publics. */
export function EkofestDoc() {
	return (
		<Autodoc Link={createPathLink(pages)}>
			<DocumentationPage
				module={model}
				ast={asAst(ast)}
				pages={pages}
				title="ekofest"
				start="resultats . bilan total"
				context={contexte}
			/>
		</Autodoc>
	)
}
