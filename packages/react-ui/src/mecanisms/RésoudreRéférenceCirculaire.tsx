import { EvaluatedNode } from 'publicodes'
import Explanation from '../Explanation'
import { Mecanism } from './common/Mecanism'

export default function MecanismRésoudreRéférenceCirculaire({
	explanation,
	nodeValue,
}: EvaluatedNode<'résoudre référence circulaire'>) {
	return (
		<Mecanism name="résoudre la référence circulaire" value={nodeValue}>
			<p>
				{' '}
				Cette valeur a été retrouvé en résolvant la référence circulaire dans la
				formule ci dessous :{' '}
			</p>

			<Explanation node={explanation.valeur} />
		</Mecanism>
	)
}
