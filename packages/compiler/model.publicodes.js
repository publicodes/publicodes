
class Engine {
	cache = {}

	constructor(rules) {
		this.rules = rules
	}

	evaluate(ruleName, ctx) {
		if (this.cache[ruleName]) {
			return this.cache[ruleName]
		}

		if (!this.rules[ruleName]) {
			throw new Error(`Rule ${ruleName} not found`)
		}

		const result = this.rules[ruleName](ctx)
		this.cache[ruleName] = result
		return result
	}

  rules = {
		
	};
