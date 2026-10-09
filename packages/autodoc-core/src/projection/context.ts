import type * as Ast from '../ast'
import type { ContextEntryView, Ctx, ValueView } from './types'
import { displayName } from './names'
import { ABSENT, formatSupplied, lookupValue, unitOf } from './value'

const isDefault = (mechanism: Ast.ChainedMechanism): mechanism is Ast.DefaultMechanism =>
	mechanism.kind === 'default'

const ORDER: Record<ContextEntryView['state'], number> = {
	'non renseignée': 0,
	'par défaut': 1,
	fournie: 2,
}

/**
 * The context of the computation: the parameters the evaluation reached, each
 * with the state its value is in. A parameter the rule could reach but this
 * evaluation never needed is not listed — there is nothing to say about it.
 * Missing entries come first because they are the ones a reader can act on.
 *
 * `reached` is the evaluation's own `needed` list. With none supplied — no
 * evaluation, so no context — the rule's declared parameters stand in.
 */
export function projectContext(
	rule: Ast.RuleDefinition,
	ctx: Ctx,
	usedParameters?: readonly string[],
	missing?: readonly string[],
): ContextEntryView[] {
	const addresses =
		usedParameters !== undefined ? [...usedParameters] : (rule.parameters ?? [])
	// The engine says which of them it found no value for. Without its word, the
	// context we were handed is all we know.
	const unanswered = missing !== undefined ? new Set(missing) : null

	const entries: ContextEntryView[] = addresses.map((address) => {
		const target = ctx.ast[address]
		const supplied = ctx.context?.[address]
		const defaultMechanism = target.chained_mechanisms.find(isDefault)
		const type = target.value_mechanism.type
		const unit = unitOf(target.value_mechanism)
		const isMissing =
			unanswered !== null ?
				unanswered.has(address)
			:	supplied === undefined && defaultMechanism === undefined
		const state: ContextEntryView['state'] =
			isMissing ? 'non renseignée'
			: supplied !== undefined ? 'fournie'
			: defaultMechanism !== undefined ? 'par défaut'
			:	'fournie'
		const value: ValueView = (() => {
			if (isMissing) return ABSENT
			if (supplied !== undefined)
				return {
					state: 'value',
					value: supplied,
					text: formatSupplied(supplied, type, unit),
				}
			if (defaultMechanism === undefined) return ABSENT
			return lookupValue(
				ctx,
				defaultMechanism.parameters.value_mechanism.id,
				type,
				unit,
			)
		})()
		return { name: displayName(ctx.ast, address), address, state, value }
	})

	return entries.sort((a, b) => ORDER[a.state] - ORDER[b.state])
}
