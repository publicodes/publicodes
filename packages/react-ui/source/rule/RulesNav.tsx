import { useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { EngineContext } from '../contexts'
import { ArrowUp, ArrowDown } from '../icons'
import { RuleLinkWithContext } from '../RuleLink'

interface Props {
	dottedName: string
}

export const RulesNav = ({ dottedName }: Props) => {
	const baseEngine = useContext(EngineContext)
	const [navOpen, setNavOpen] = useState(false)

	if (!baseEngine) {
		throw new Error('Engine expected')
	}

	const parsedRules = baseEngine.getParsedRules()
	const [level, setLevel] = useState(
		Object.fromEntries(
			dottedName
				.split(' . ')
				.map((x, i, arr) =>
					i < arr.length - 1 ? [arr.slice(0, i + 1).join(' . '), true] : []
				)
		)
	)

	const activeLi = useRef<HTMLLIElement>(null)
	useEffect(() => {
		activeLi.current?.scrollIntoView({
			behavior: 'auto',
			block: 'center',
			inline: 'start',
		})
	}, [])

	return (
		<>
			<Background
				$open={navOpen}
				onClick={() => {
					console.log('click nav')

					setNavOpen((open) => !open)
				}}
			/>

			<OpenNavButton onClick={() => setNavOpen(true)}>
				Voir l'arborescence des règles
			</OpenNavButton>

			<Nav $open={navOpen}>
				<ul>
					{Object.entries(parsedRules)
						.sort(([a], [b]) => a.localeCompare(b))
						.map(([ruleDottedName, rest]) => {
							const parentDottedName = ruleDottedName
								.split(' . ')
								.slice(0, -1)
								.join(' . ')

							if (
								rest.explanation.parents.length > 0 &&
								!level[parentDottedName]
							) {
								return null
							}

							return (
								<li
									key={ruleDottedName}
									style={{
										marginLeft: (ruleDottedName.split(' . ').length - 1) * 16,
									}}
									className={
										(Object.keys(parsedRules).reduce((acc, dot) => {
											return dot.startsWith(ruleDottedName + ' . ') &&
												ruleDottedName.split(' . ').length + 1 ===
													dot.split(' . ').length
												? acc + 1
												: acc
										}, 0) > 0
											? 'dropdown'
											: '') +
										' ' +
										(dottedName === ruleDottedName ? 'active' : '')
									}
									ref={dottedName === ruleDottedName ? activeLi : undefined}
								>
									{Object.keys(parsedRules).reduce((acc, dot) => {
										return dot.startsWith(ruleDottedName + ' . ') &&
											ruleDottedName.split(' . ').length + 1 ===
												dot.split(' . ').length
											? acc + 1
											: acc
									}, 0) > 0 && (
										<DropdownButton
											onClick={() => {
												setLevel((obj) =>
													!obj[ruleDottedName]
														? {
																...obj,
																[ruleDottedName]: !obj[ruleDottedName],
														  }
														: Object.fromEntries(
																Object.entries(obj).map(([dot, val]) =>
																	dot.startsWith(ruleDottedName)
																		? [dot, false]
																		: [dot, val]
																)
														  )
												)
											}}
										>
											{ruleDottedName in level && level[ruleDottedName] ? (
												<StyledArrowUp />
											) : (
												<StyledArrowDown />
											)}
										</DropdownButton>
									)}
									<RuleLinkWithContext dottedName={ruleDottedName} />
								</li>
							)
						})}
				</ul>
			</Nav>
		</>
	)
}

export const breakpointsWidth = {
	sm: '576px',
	md: '768px',
	lg: '992px',
	xl: '1200px',
}

const Background = styled.div<{ $open: boolean }>`
	background: rgb(0 0 0 / 25%);
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	z-index: 1;
	transition: visibility, opacity, ease-in-out 0.25s;
	visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
	opacity: ${({ $open }) => ($open ? '1' : '0')};

	@media (min-width: ${breakpointsWidth.md}) {
		display: none;
	}
`

const OpenNavButton = styled.button`
	@media (min-width: ${breakpointsWidth.md}) {
		display: none;
	}
`

const Nav = styled.nav<{ $open: boolean }>`
	flex-basis: 30%;
	overflow: scroll;
	white-space: nowrap;
	max-height: 80vh;
	position: sticky;
	top: 0;

	@media (max-width: ${breakpointsWidth.md}) {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		right: 20%;
		z-index: 1;
		max-height: initial;
		background: white;

		transition: all ease-in-out 0.25s;
		${({ $open }) => ($open ? '' : 'left: -100%; right: 100%;')}
	}

	ul {
		margin: 0.5rem;
		display: inline-flex;
		flex-direction: column;
		flex-wrap: nowrap;
		align-items: flex-start;

		@media (max-width: ${breakpointsWidth.md}) {
			margin: 0;
			padding: 0.5rem;
		}

		li {
			margin-bottom: 3px;
			padding: 3px 0.5rem 3px 3px;
			display: flex;
			align-items: center;
			flex-direction: row;
			flex-wrap: nowrap;

			&.active {
				background-color: #e6e6e6;
				border-radius: 3px;
			}

			&:not(.dropdown):before {
				content: ' ';
				display: inline-block;
				background-color: #b3b3b3;
				width: 0.5rem;
				height: 0.5rem;
				border-radius: 0.5rem;
				margin-left: 0.5rem;
				margin-right: 1.25rem;
				pointer-events: none;
			}
		}
	}
`

const DropdownButton = styled.button`
	margin-right: 0.75rem;
	background: none;
	border: 1px solid #b3b3b3;
	border-radius: 2rem;
	width: 1.5rem;
	height: 1.5rem;
	color: #999;
	padding: 0px;
	display: inline-block;
`

const StyledArrowUp = styled(ArrowUp)`
	width: 100%;
	height: 100%;
`

const StyledArrowDown = styled(ArrowDown)`
	width: 100%;
	height: 100%;
`
