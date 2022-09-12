import { Logger } from '.'

export class PublicodesEngineError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'PublicodesEngineError'
	}
}

interface ErrorInformation {
	dottedName?: string
}

export class PublicodesSyntaxError extends PublicodesEngineError {
	dottedName?: string

	constructor(message: string, { dottedName }: ErrorInformation) {
		super(message)
		this.name = 'PublicodesSyntaxError'
		this.dottedName = dottedName
	}
}

export class PublicodesEvaluationError extends PublicodesEngineError {
	dottedName?: string

	constructor(message: string, { dottedName }: ErrorInformation) {
		super(message)
		this.name = 'PublicodesEvaluationError'
		this.dottedName = dottedName
	}
}

export class PublicodesInternalError<T> extends PublicodesEngineError {
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
		this.name = 'PublicodesInternalError'
		this.payload = payload
	}
}

/**
 * Use this error in default case of a switch to check exhaustivity statically
 * inspired by https://github.com/ts-essentials/ts-essentials#exhaustive-switch-cases
 */
export class UnreachableCaseError extends PublicodesInternalError<never> {
	constructor(value: never) {
		super(value)
	}
}

const buildMessage = (
	type: string,
	message: string,
	{ dottedName }: ErrorInformation,
	originalError?: Error
) => {
	const isError = /erreur/i.test(type)

	return (
		`\n[ ${type} ]` +
		(dottedName?.length ? `\n➡️  Dans la règle "${dottedName}"` : '') +
		`\n${isError ? '✖️' : '⚠️'}  ${message}` +
		(originalError
			? '\n' + (isError ? '    ' : 'ℹ️  ') + originalError.message
			: '')
	)
}
/**
 * Throw a PublicodesSyntaxError
 * @param message
 * @param information
 * @param originalError
 */
export function syntaxError(
	message: string,
	information: ErrorInformation,
	originalError?: Error
): never {
	throw new PublicodesSyntaxError(
		buildMessage('Erreur syntaxique', message, information, originalError),
		information
	)
}

/**
 * Throw an PublicodesEvaluationError
 * @param message
 * @param information
 * @param originalError
 */
export function evaluationError(
	message: string,
	information: ErrorInformation,
	originalError?: Error
): never {
	throw new PublicodesEvaluationError(
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
