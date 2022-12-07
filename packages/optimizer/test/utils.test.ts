import { disabledLogger, ParsedRules, RawRules } from '../src/commons'
import Engine from 'publicodes'

export function callWithEngine<R>(
	fn: (engine: Engine) => R,
	rawRules: RawRules
): R {
	const engine = new Engine(rawRules, { logger: disabledLogger })
	return fn(engine)
}

export function callWithParsedRules<R>(
	fn: (rules: ParsedRules) => R,
	rawRules: RawRules
): R {
	const engine = new Engine(rawRules)
	return fn(engine.getParsedRules())
}
