/**
 @package publicodes
 
 New publicodes API proposal.
 
 Aim : 
 - simplify integration with forms in JS
 - fully-typed in/out 

 @example

 ```js

    import Engine, { p } from 'publicodes'
    import modele from 'my-modele'

    const engine = new Engine(modele)
    engine.setSituation({ 'salaire brut': 3000 })
    const salaireBrut = engine.rule('salaire net').value()

    // Other possibility
    engine.resetSituation()

    engine.rule('salaire net').set(p`20000 €/an`)

    const salaireBrutAnnuel = engine.expression(p({
        valeur: 'salaire net'
        unité: '€/an'
    }));
    console.log(`Le salaire brut annuel est de ${salaireBrutAnnuel.formatValue()}`)
```
 */

export default class Engine {
	constructor(modele: CompiledModele)
	setSituation(situation: Record<RuleName, JSValue | CompiledExpression>): void
	rule(rule: RuleName): Rule
	expression(expression: CompiledExpression): Expression
}

export interface Expression {
	type: 'number' | 'string' | 'boolean' | 'date' | 'enum'
	isNullable: boolean

	unit(): Unit | null // computed statically ?

	value(): JSValue
	formatValue(options: unknown): string
	/* Can be used to serialize the value of the expression as a publicodes string (for saving) */
	serializedValue(): string

	isApplicable(): boolean | undefined

	/** List all the rules whose value is needed for the computation */
	inputs(): Array<Rule>

	/** Add a score like missingVariables (experimental) */
	scoredInputs(): Record<RuleName, number>
	/**@deprecated */
	missingVariables(): Record<RuleName, number>

	warnings(): Array<Warning> // inversion fail, experimental or deprecated rule used, ...
}

export interface Rule<Type> extends Expression<Type> {
	dottedName: string
	title: string
	description?: string
	icons?: string
	question?: string
	references?: Record<string, string>

	experimental: boolean
	deprecated?: string

	isDefaultValue(): boolean

	meta: Record<string, MetaShape>

	children(): Array<Rule>

	// replacedRule: Rule<Type> TODO

	set(value: JSValue | CompiledExpression): void
	reset(): void
}

type JSValue = number | string | boolean | null | undefined | Date

export function parse(
	expression: string | PublicodesExpression,
): CompiledExpression
export function p(expression: string | PublicodesExpression): CompiledExpression
