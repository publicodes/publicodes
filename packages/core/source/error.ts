import { Logger } from '.'

export class EngineError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'EngineError'
	}
}

export class SyntaxError extends EngineError {
	rule: string

	constructor(rule: string, message: string) {
		super(message)
		this.name = 'SyntaxError'
		this.rule = rule
	}
}

export class EvaluationError extends EngineError {
	rule: string

	constructor(rule: string, message: string) {
		super(message)
		this.name = 'EvaluationError'
		this.rule = rule
	}
}

export class InternalError<T> extends EngineError {
	payload: T

	constructor(payload: T) {
		super(
			`
Erreur interne du moteur.

Cette erreur est le signe d'un bug dans publicodes. Pour nous aider à le résoudre, vous pouvez copier ce texte dans un nouveau ticket : https://github.com/betagouv/mon-entreprise/issues/new.

payload:
${JSON.stringify(payload, null, 2)}
`
		)
		this.name = 'InternalError'
		this.payload = payload
	}
}

/**
 * Use this error in default case of a switch to check exhaustivity statically
 * inspired by https://github.com/ts-essentials/ts-essentials#exhaustive-switch-cases
 */
export class UnreachableCaseError extends InternalError<never> {
	constructor(value: never) {
		super(value)
	}
}

const messageError = (
	type: string,
	rule: string,
	message: string,
	originalError?: Error
) => `\n[ ${type} ]
➡️  Dans la règle "${rule}"
✖️  ${message}
${originalError ? originalError.message : ''}
`

/**
 * Throw a SyntaxError
 * @param rule
 * @param message
 * @param originalError
 */
export function syntaxError(
	rule: string,
	message: string,
	originalError?: Error
) {
	throw new SyntaxError(
		rule,
		messageError('Erreur syntaxique', rule, message, originalError)
	)
}

/**
 * Throw an EvaluationError
 * @param rule
 * @param message
 * @param originalError
 */
export function evaluationError(
	rule: string,
	message: string,
	originalError?: Error
) {
	throw new EvaluationError(
		rule,
		messageError("Erreur d'évaluation", rule, message, originalError)
	)
}

export function warning(
	logger: Logger,
	rule: string,
	message: string,
	originalError?: Error
) {
	logger.warn(
		`\n[ Avertissement ]
➡️  Dans la règle "${rule}"
⚠️  ${message}
${originalError ? `ℹ️  ${originalError.message}` : ''}
`
	)
}
