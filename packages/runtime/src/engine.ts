import evaluateNode, { Context } from './evaluate'
import { Memoizer } from './memoize'
import {
	Publicodes,
	Outputs,
	GetContext,
	Evaluation,
	RuleName,
	Computation,
	GetMeta,
} from './types'

type EngineOptions = {
	cache?: boolean
}
export class Engine<O extends Outputs> {
	private cache: Memoizer<O> | null = null

	constructor(
		private publicodes: Publicodes<O>,
		options: EngineOptions = {},
	) {
		const { cache = false } = options

		if (cache) {
			this.cache = new Memoizer(publicodes)
		}
	}

	evaluate<R extends RuleName<O>>(
		rule: R,
		context: GetContext<O, R> = emptyContext,
		debug = false,
	): Evaluation<O, R> {
		const output = this.publicodes.outputs[rule]
		if (output === undefined) {
			throw new Error(`Rule "${rule}" doesn't exist as an output of the model`)
		}
		const evaluation = this.publicodes.evaluation as readonly Computation[]
		const evaluate = (id: number) => {
			if (this.cache) {
				return this.cache.evaluateNode(id, context as Context)
			}
			return evaluateNode(evaluation, id, context as Context)
		}

		const { p, v } = evaluate(output.nodeIndex!)

		type Value = Evaluation<O, R>['value']
		let value = v as Value

		if (debug) {
			const evaluations = evaluation.map((node: Computation, i: number) => ({
				value: evaluate(i),
				formula: node,
			}))
			// eslint-disable-next-line no-console
			console.table(evaluations)
		}

		const neededParameters = Object.keys(p)
		const missingParameters = neededParameters.filter(
			(param) => !(param in context),
		)
		if (output.type && 'date' in output.type) {
			value = new Date(v as number) as Value
		}
		return {
			value,
			neededParameters,
			missingParameters,
		} as Evaluation<O, R>
	}

	public getMeta<R extends RuleName<O>>(rule: R): GetMeta<O, R> {
		return this.publicodes.outputs[rule].meta
	}

	public getType<R extends RuleName<O>>(rule: R): O[R]['type'] {
		return this.publicodes.outputs[rule].type
	}
}

const emptyContext = {}
