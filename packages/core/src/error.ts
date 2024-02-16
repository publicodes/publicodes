import { Logger } from '.'

/**
 * Each error name with corresponding type in info value
 */
interface PublicodesErrorTypes {
	InternalError: {
		dottedName?: string
	}
	EngineError: Record<string, never>
	SyntaxError: {
		dottedName: string
	}
	EvaluationError: {
		dottedName: string
	}
	UnknownRule: {
		dottedName: string
	}
	PrivateRule: {
		dottedName: string
	}
}

/**
 * Return true if `error` is a PublicodesError,
 * use `name` parameter to check and narow error type
 * @example
 * try {
 * 	new Engine().evaluate()
 * } catch (error) {
 * 	if (isPublicodesError(error, 'EngineError')) {
 * 		console.log(error.info)
 * 	}
 * }
 */
export const isPublicodesError = <Name extends keyof PublicodesErrorTypes>(
	error: unknown,
	name?: Name,
): error is PublicodesError<
	typeof name extends undefined ? keyof PublicodesErrorTypes : Name
> =>
	error instanceof PublicodesError &&
	(name === undefined ? true : error.name === name)

/**
 * Generic error for Publicodes
 */
export class PublicodesError<
	Name extends keyof PublicodesErrorTypes,
> extends Error {
	name: Name
	info: PublicodesErrorTypes[Name]

	constructor(
		name: Name,
		message: string,
		info: PublicodesErrorTypes[Name],
		originalError?: Error,
	) {
		super(buildMessage(name, message, info, originalError))
		this.name = name
		this.info = info
	}
}

const buildMessage = (
	name: string,
	message: string,
	info?: PublicodesErrorTypes[keyof PublicodesErrorTypes],
	originalError?: Error,
) => {
	const types: Partial<Record<keyof PublicodesErrorTypes, string>> = {
		SyntaxError: 'Erreur syntaxique',
		EvaluationError: "Erreur d'évaluation",
		UnknownRule: 'Règle inconnue',
		PrivateRule: 'Règle privée',
	}
	const isError = /error/i.test(name)

	return (
		`\n[ ${types[name] ?? name} ]` +
		(info && 'dottedName' in info && info.dottedName?.length ?
			`\n➡️  Dans la règle "${info.dottedName}"`
		:	'') +
		`\n${isError ? '✖️' : '⚠️'}  ${message}` +
		(originalError ?
			'\n' + (isError ? '    ' : 'ℹ️  ') + originalError.message
		:	'')
	)
}

/**
 * @deprecated Throw an internal server error, replace this by `throw new PublicodesError('InternalError', ...)`
 */
export class PublicodesInternalError extends PublicodesError<'InternalError'> {
	constructor(payload: Record<string, unknown>) {
		super(
			'InternalError',
			`
Erreur interne du moteur.

Cette erreur est le signe d'un bug dans publicodes. Pour nous aider à le résoudre, vous pouvez copier ce texte dans un nouveau ticket : https://github.com/betagouv/mon-entreprise/issues/new.

payload:
${JSON.stringify(payload, null, 2)}
`,
			payload,
		)
	}
}

/**
 * Use this error in default case of a switch to check exhaustivity statically
 * inspired by https://github.com/ts-essentials/ts-essentials#exhaustive-switch-cases
 */
export class UnreachableCaseError extends PublicodesInternalError {
	constructor(value: never) {
		super(value)
	}
}

export function warning(
	logger: Logger,
	message: string,
	information: { dottedName: string },
	originalError?: Error,
) {
	logger.warn(
		buildMessage('Avertissement', message, information, originalError),
	)
}

export function experimentalRuleWarning(logger: Logger, dottedName: string) {
	logger.warn(
		buildMessage(
			'Avertissement',
			"Cette règle est tagguée comme experimentale. \n\nCela veut dire qu'elle peut être modifiée, renommée, ou supprimée sans qu'il n'y ait de changement de version majeure dans l'API.\n",
			{ dottedName },
		),
	)
}
