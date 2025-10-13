import { Evaluation, Unit } from 'publicodes'
import { css, styled } from 'styled-components'
import { NodeValueLeaf } from './NodeValueLeaf'
import mecanismColors from './mecanismColors'

// Un élément du graphe de calcul qui a une valeur interprétée (à afficher)
export type Props = {
	name: string
	value?: Evaluation
	unit?: Unit
	children: React.ReactNode
	displayName?: boolean
	docUrl?: string
}
export function Mecanism({
	name,
	value,
	children,
	unit,
	displayName = true,
	docUrl,
}: Props) {
	return (
		<StyledMecanism as="article" $mecanismName={name}>
			{displayName && (
				<div role="heading" aria-level={1}>
					<MecanismName name={name} href={docUrl}>
						{name}
					</MecanismName>
				</div>
			)}
			<div>
				{children}

				{value !== undefined && (
					<StyledMecanismValue>
						<small> =&nbsp;</small>
						<NodeValueLeaf data={value} unit={unit} />
					</StyledMecanismValue>
				)}
			</div>
		</StyledMecanism>
	)
}

const StyledMecanism = styled.div<{ $mecanismName: string }>`
	border: 1px solid;
	max-width: 100%;
	border-radius: 3px;
	padding: 0.5rem 1rem;
	position: relative;
	flex: 1;
	flex-direction: column;
	text-align: left;
	border-color: ${({ $mecanismName }) => mecanismColors($mecanismName)};
	.properties > li {
		margin: 1rem 0;
	}
`

const MecanismName = ({
	name,
	inline = false,
	children,
	href,
}: {
	name: string
	inline?: boolean
	children: React.ReactNode
	href?: string
}) => {
	return (
		<>
			<StyledMecanismName
				name={name}
				$inline={inline}
				target="_blank"
				href={href ?? `https://publi.codes/docs/mecanismes#${name}`}
			>
				{children}
			</StyledMecanismName>
		</>
	)
}

const StyledMecanismName = styled.a<{ name: string; $inline?: boolean }>`
	background-color: ${({ name }) => mecanismColors(name)} !important;
	font-size: inherit;
	display: inline-block;
	font-weight: inherit;
	width: fit-content;
	font-family: inherit;
	padding: 0.4rem 0.6rem !important;
	color: white !important;
	transition: hover 0.2s;
	:hover {
		color: white;
	}
	${(props) =>
		props.$inline ?
			css`
				border-radius: 0.3rem;
				margin-bottom: 0.5rem;
			`
		:	css`
				top: -0.5rem;
				position: relative;
				margin-left: -1rem;
				border-radius: 0 !important;
				border-bottom-right-radius: 0.3rem !important;
				::first-letter {
					text-transform: capitalize;
				}
			`}
	:hover {
		opacity: 0.8;
	}
`

const StyledMecanismValue = styled.div`
	text-align: right;
	margin-top: 1rem;
	font-weight: bold;
`
