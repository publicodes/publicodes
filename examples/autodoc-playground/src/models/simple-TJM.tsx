import { createPathNavigation } from '@publicodes/autodoc-core'
import { Autodoc, createPathLink } from '@publicodes/autodoc-react'
import * as model from '../../../models/simple-TJM/model.publicodes.js'
import ast from '../../../models/simple-TJM/model.publicodes.json'
import { asAst } from './ast'
import { DocumentationPage } from '../DocumentationPage'
import { toUrl } from '../hash-route'

export const basePath = '/simple-TJM'

/** Les adresses du modèle : quel chemin nomme quelle règle, et réciproquement. */
const pages = createPathNavigation({
	outputs: model.outputs,
	parameters: model.parameters,
	basePath,
	toUrl,
})

const context = {
	"chiffre d'affaires . TJM": 800,
}

/** Le calcul sous un contexte fourni : le TJM du lecteur, et ses 21 jours par défaut. */
export function SimpleTjmDoc() {
	return (
		<Autodoc Link={createPathLink(pages)}>
			<DocumentationPage
				module={model}
				ast={asAst(ast)}
				pages={pages}
				title="simple TJM"
				start="revenu net"
				context={context}
			/>
		</Autodoc>
	)
}
