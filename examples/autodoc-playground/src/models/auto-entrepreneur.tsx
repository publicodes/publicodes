import { createPathNavigation } from '@publicodes/autodoc-core'
import { Autodoc, createPathLink } from '@publicodes/autodoc-react'
import * as model from '../../../../models/auto-entrepreneur/model.publicodes.js'
import ast from '../../../../models/auto-entrepreneur/model.publicodes.json'
import { asAst } from './ast'
import { DocumentationPage } from '../DocumentationPage'
import { toUrl } from '../hash-route'

const contexte = {
	"entreprise . chiffre d'affaires . BIC": 10000,
	"entreprise . chiffre d'affaires . service BIC": 5000,
	"entreprise . chiffre d'affaires . service BNC": 200,
	"entreprise . chiffre d'affaires . vente restauration hébergement": 1000,
	'entreprise . activité . nature': 'artisanale',
	date: new Date('2024-06-01'),
	'dirigeant . auto-entrepreneur . Cipav . adhérent': false,
}

export const basePath = '/auto-entrepreneur'

/** Les adresses du modèle : quel chemin nomme quelle règle, et réciproquement. */
const pages = createPathNavigation({
	outputs: model.outputs,
	parameters: model.parameters,
	basePath,
	toUrl,
})

export function AutoEntrepreneurDoc() {
	return (
		<Autodoc Link={createPathLink(pages)}>
			<DocumentationPage
				module={model}
				ast={asAst(ast)}
				pages={pages}
				title="auto-entrepreneur"
				start="dirigeant . auto-entrepreneur . revenu net"
				context={contexte}
			/>
		</Autodoc>
	)
}
