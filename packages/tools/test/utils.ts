import type { ParsedRules, RawPublicodes } from 'publicodes'
import Engine from 'publicodes'
import { RuleName, disabledLogger } from '../src/commons'

export function callWithEngine<R>(
	fn: (engine: Engine) => R,
	rawRules: RawPublicodes<string>,
): R {
	const engine = new Engine(rawRules, {
		logger: disabledLogger,
		strict: { noOrphanRule: false },
	})
	return fn(engine)
}

export function callWithParsedRules<R>(
	fn: (rules: ParsedRules<RuleName>) => R,
	rawRules: RawPublicodes<string>,
): R {
	const engine = new Engine(rawRules)
	return fn(engine.getParsedRules())
}
