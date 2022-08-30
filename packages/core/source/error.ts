import { Logger } from '.'

export class EngineError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'EngineError'
	}
}

type ErrorInformation = Partial<{ rule: string }>

export class SyntaxError extends EngineError {
	rule?: string

	constructor(message: string, { rule }: ErrorInformation) {
		super(message)
		this.name = 'SyntaxError'
		this.rule = rule
	}
}

export class EvaluationError extends EngineError {
	rule?: string

	constructor(message: string, { rule }: ErrorInformation) {
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

const buildMessage = (
	type: string,
	message: string,
	{ rule }: ErrorInformation,
	originalError?: Error
) => {
	const isError = /erreur/i.test(type)

	return (
		`\n[ ${type} ]` +
		(rule?.length ? `\n➡️  Dans la règle "${rule}"` : '') +
		`\n${isError ? '✖️' : '⚠️'}  ${message}` +
		(originalError
			? '\n' + (isError ? '    ' : 'ℹ️  ') + originalError.message
			: '')
	)
}
/**
 * Throw a SyntaxError
 * @param message
 * @param information
 * @param originalError
 */
export function syntaxError(
	message: string,
	information: ErrorInformation,
	originalError?: Error
): never {
	throw new SyntaxError(
		buildMessage('Erreur syntaxique', message, information, originalError),
		information
	)
}

/**
 * Throw an EvaluationError
 * @param message
 * @param information
 * @param originalError
 */
export function evaluationError(
	message: string,
	information: ErrorInformation,
	originalError?: Error
): never {
	throw new EvaluationError(
		buildMessage("Erreur d'évaluation", message, information, originalError),
		information
	)
}

export function warning(
	logger: Logger,
	message: string,
	information: ErrorInformation,
	originalError?: Error
) {
	logger.warn(
		buildMessage('Avertissement', message, information, originalError)
	)
}
