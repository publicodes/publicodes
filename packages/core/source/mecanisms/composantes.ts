import { ASTNode } from '../AST/types'
import parse from '../parse'

export const decompose = (k, v, context): ASTNode => {
	const { composantes, ...factoredKeys } = v
	const explanation = parse(
		{
			somme: composantes.map((composante) => {
				const { attributs, ...otherKeys } = composante
				return {
					...attributs,
					valeur: {
						[k]: {
							...factoredKeys,
							...otherKeys,
						},
					},
				}
			}),
		},
		context
	)
	return {
		...explanation,
		sourceMap: {
			args: {},
			...explanation.sourceMap,
			mecanismName: 'composantes',
		},
	}
}
