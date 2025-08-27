import { EvaluatedNode, formatValue } from 'publicodes'
import { useHideValue } from '../hooks'
import { rulesToHideWording } from '../constants/rulesToHide'

export default function Constant({
	dottedName,
	nodeValue,
	type,
	fullPrecision,
	unit,
}: EvaluatedNode<'constant'>) {
	const hideValue = useHideValue(dottedName)
	if (nodeValue === undefined) {
		return null
	}

	if (nodeValue === null) {
		return <span className="value">{formatValue({ nodeValue })}</span>
	} else if (hideValue) {
		return <span>{rulesToHideWording}</span>
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
