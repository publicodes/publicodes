import { EvaluatedNode } from 'publicodes'
import {
	BaremeExplanation,
	BarèmeAttributes,
	StyledComponent,
	TrancheTable,
} from './Barème'
import { Mecanism } from './common/Mecanism'

type Props = EvaluatedNode<'grille', number> & {
	explanation: BaremeExplanation
}
export default function Grille({ nodeValue, explanation, unit }: Props) {
	return (
		<StyledComponent>
			<Mecanism name="grille" value={nodeValue} unit={unit}>
				<ul className="properties">
					<BarèmeAttributes explanation={explanation} />
					<TrancheTable
						tranches={explanation.tranches}
						multiplicateur={explanation.multiplicateur}
					/>
				</ul>
			</Mecanism>
		</StyledComponent>
	)
}
