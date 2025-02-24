import parse from '../parse'
import { Context } from '../parsePublicodes'
import { parseRules } from '../parseRule'

export default function parseAvec(v, context: Context) {
	parseRules(v.avec, context)
	const valeur = parse(v.valeur, context)
	return valeur
}

parseAvec.nom = 'avec' as const
