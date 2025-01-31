import React from 'react'

export function Error({ error }: { error: string[] }) {
	if (error.length === 0) return null
	return (
		<>
			<div
				className="fixed z-[1000] 
       inset-0  bg-slate-400/50 backdrop-blur-[2px] animate-fade-in "
			/>
			<div
				className="fixed z-[1000]  left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl animate-slide-up"
				role="alert"
			>
				<div className="p-6 bg-white  rounded-lg shadow-lg m-4">
					<div className="space-y-2 max-h-[70vh] overflow-auto">
						{error.map((err, index) => {
							const { type, message, ruleName } = parseError(err)
							return (
								<React.Fragment key={index}>
									<div className="flex items-center gap-3 ">
										<svg
											className="w-6 h-6 text-red-500 flex-shrink-0"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
											/>
										</svg>
										<h2 className="text-lg m-0 py-4 font-semibold text-red-500">
											{type}
										</h2>
									</div>
									<p className="text-xl font-semibold flex items-baseline flex-wrap">
										Dans la règle
										<code className="px-1 ml-2 text-slate-800 bg-gray-100 rounded-md">
											{ruleName}
										</code>
									</p>

									<p key={index} className="text-gray-600 ">
										{message}
									</p>
								</React.Fragment>
							)
						})}
					</div>
				</div>
			</div>
		</>
	)
}

/**
 *
 * @example
 * ```js
 * parseError(`[ Erreur syntaxique ] ➡️ Dans la règle "salaire net" ✖️ La référence "salaire brut" est introuvable. Vérifiez que l'orthographe et l'espace de nom sont corrects`)
 * ```
 */
function parseError(error: string): {
	type: string
	message: string
	ruleName: string
} {
	const type = error.match(/\[ (.+?) \]/)?.[1] ?? ''
	const ruleName = error.match(/"(.+?)"/)?.[1] ?? ''
	const message = error.split('✖️')[1].trim()
	return { type, message, ruleName }
}
