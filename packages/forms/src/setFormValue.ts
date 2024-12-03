import type Engine from 'publicodes'
import type { Situation } from 'publicodes'

export function setFormValue<Name extends string>(
	engine: Engine<Name>,
	dottedName: Name,
	value: string | number | boolean | undefined,
) {
	const rule = engine.getRule(dottedName)
	const typeInfo = engine.context.nodesTypes.get(rule)
	let situationValue: Situation<Name>[Name]

	if (value === '' || value === undefined) {
		const previousSituation = engine.getSituation()
		if (!(dottedName in previousSituation)) {
			return
		}
		delete previousSituation[dottedName]
		engine.setSituation(previousSituation)
		return
	}

	if (typeof value === 'boolean') {
		situationValue = value ? 'oui' : 'non'
	} else if (typeInfo?.type === 'string') {
		situationValue = `'${value.toString()}'`
	} else if (typeInfo?.type === 'date') {
		situationValue = new Date(value)
			.toISOString()
			.split('T')[0]
			.split('-')
			.reverse()
			.join('/')
	} else {
		situationValue = value
	}
	engine.setSituation(
		{
			[dottedName]: situationValue,
		} as Situation<Name>,
		{ keepPreviousSituation: true },
	)
}
