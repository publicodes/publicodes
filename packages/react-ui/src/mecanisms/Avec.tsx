import Explanation from '../Explanation'
import { Mecanism } from './common'

export default function MecanismAvec(node) {
	return (
		<>
			<Explanation node={node.explanation.valeur} />
			<div style={{ paddingTop: '0.5rem' }}>
				<Mecanism name="avec" value={node.nodeValue} unit={node.unit}>
					<ul>
						{Object.entries(node.explanation.avec).map(([name, value]) => (
							<li>
								{name}&nbsp;= <Explanation node={value} />
							</li>
						))}
					</ul>
				</Mecanism>
			</div>
		</>
	)
}
