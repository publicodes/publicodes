import type Engine from 'publicodes'
import { convertInputValueToPublicodes } from './convertInputValueToPublicodes'
import type { Situation } from 'publicodes'

/**
 * Update the engine situation with the value of a form element.
 *
 * This function will update the engine situation with the value issued from a form element. It will convert the value to a publicodes expression that can be used to update the engine situation.
 *
 * If the @param inputValue is undefined, the rule will be deleted from the situation.
 *
 * @param engine The engine to update
 * @param dottedName The name of the rule to update
 * @param inputValue The value of the form input to use
 */
export function updateSituationWithFormValue<Name extends string>(
	engine: Engine<Name>,
	dottedName: Name,
	inputValue: string | number | boolean | undefined,
): void {
	const situationValue = convertInputValueToPublicodes(
		engine,
		dottedName,
		inputValue,
	)

	if (situationValue === undefined) {
		// Delete from situation
		const previousSituation = engine.getSituation()
		if (!(dottedName in previousSituation)) {
			return
		}
		delete previousSituation[dottedName]
		engine.setSituation(previousSituation)
		return
	}

	engine.setSituation(
		{
			[dottedName]: situationValue,
		} as Situation<Name>,
		{
			keepPreviousSituation: true,
		},
	)
}
