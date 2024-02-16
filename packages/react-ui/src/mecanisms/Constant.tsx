import { EvaluatedNode, formatValue } from 'publicodes'

export default function Constant({
	nodeValue,
	type,
	fullPrecision,
	unit,
}: EvaluatedNode<'constant'>) {
	if (nodeValue === undefined) {
		return null
	}
	if (nodeValue === null) {
		return <span className="value">{formatValue({ nodeValue })}</span>
	} else if (fullPrecision) {
		return (
			<span className={type}>
				{formatValue(
					{ nodeValue, unit },
					{
						precision: 5,
					},
				)}
			</span>
		)
	} else {
		return <span className="value">{formatValue({ nodeValue, unit })}</span>
	}
}
