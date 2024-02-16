import { EvaluatedNode, formatValue, serializeUnit } from 'publicodes'
import Explanation from '../Explanation'
import { InfixMecanism } from './common/InfixMecanism'

export default function MecanismUnité({
	nodeValue,
	explanation,
	unit,
}: EvaluatedNode<'unité'>) {
	if (explanation.nodeKind === 'constant') {
		return formatValue({ nodeValue, unit })
	} else if (explanation.nodeKind === 'reference') {
		return (
			<>
				<Explanation node={explanation} />
				&nbsp;{serializeUnit(unit)}
			</>
		)
	} else {
		return (
			<InfixMecanism value={explanation as EvaluatedNode}>
				<p>
					<strong>Unité : </strong>
					{serializeUnit(unit)}
				</p>
			</InfixMecanism>
		)
	}
}
