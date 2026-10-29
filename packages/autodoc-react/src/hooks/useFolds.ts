import { useState } from 'react'

/** Les plis que le lecteur a touchés, par identifiant de mécanisme. */
export function useFolds(): {
	folds: Readonly<Record<string, boolean>>
	toggleFold: (id: string, open: boolean) => void
} {
	const [folds, setFolds] = useState<Readonly<Record<string, boolean>>>({})
	return {
		folds,
		toggleFold: (id, open) =>
			setFolds((previous) => ({ ...previous, [id]: open })),
	}
}
