import { PublicodesExpression } from '..'
import parse from '../parse'
import { Context } from '../parsePublicodes'

export default function parseAvec(v, context: Context) {
	Object.entries(v.avec as Record<string, PublicodesExpression>).forEach(
		([dottedName, rule]) => {
			parse(
				{
					nom: dottedName,
					...(rule == undefined
						? {}
						: typeof rule !== 'object' || 'nodeKind' in rule
						? { valeur: rule }
						: rule),
				},
				context
			)
		}
	)
	const valeur = parse(v.valeur, context)
	return valeur
}

parseAvec.nom = 'avec' as const
