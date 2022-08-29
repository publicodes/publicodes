import { utils } from 'publicodes'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { useEngine } from '../hooks'
import { ArrowDown, ArrowUp } from '../icons'
import { RuleLinkWithContext } from '../RuleLink'

interface Props {
	dottedName: string
}

export const RulesNav = ({ dottedName }: Props) => {
	const baseEngine = useEngine()
	const [navOpen, setNavOpen] = useState(false)

	const initLevel = (dn: string) =>
		Object.fromEntries([
			[dn, true],
			...utils.ruleParents(dn).map((parent) => [parent, true]),
		] as [string, boolean][])

	const [level, setLevel] = useState(initLevel(dottedName))

	useEffect(() => {
		setLevel((prev) => ({ ...prev, ...initLevel(dottedName) }))
		setNavOpen(false)
	}, [dottedName])

	const maxLevelOpen = Object.entries(level).reduce(
		(max, [dot, open]) => (open ? Math.max(max, dot.split(' . ').length) : max),
		0
	)

	const parsedRules = baseEngine.getParsedRules()

	const toggleDropdown = useCallback((ruleDottedName: string) => {
		setLevel((prevLevel) =>
			!prevLevel[ruleDottedName]
				? {
						...prevLevel,
						[ruleDottedName]: !prevLevel[ruleDottedName],
				  }
				: Object.fromEntries(
						Object.entries(prevLevel).map(([dot, val]) =>
							dot.startsWith(ruleDottedName) ? [dot, false] : [dot, val]
						)
				  )
		)
	}, [])

	return (
		<>
			<Background
				$open={navOpen}
				onClick={() => {
					setNavOpen((open) => !open)
				}}
			/>

			{/* Portal in Header */}
			{document.getElementById('rules-nav-open-nav-button') &&
				ReactDOM.createPortal(
					<OpenNavButton onClick={() => setNavOpen(true)}>
						Toutes les règles
					</OpenNavButton>,
					document.getElementById('rules-nav-open-nav-button')
				)}

			<Nav $open={navOpen}>
				<ul style={{ width: maxLevelOpen * 16 + 350 }}>
					{Object.entries(parsedRules)
						.sort(([a], [b]) => a.localeCompare(b))
						.map(([ruleDottedName, rest]) => {
							const parentDottedName = utils.ruleParent(ruleDottedName)

							if (
								ruleDottedName.split(' . ').length > 1 &&
								!level[parentDottedName]
							) {
								return null
							}

							const open = ruleDottedName in level && level[ruleDottedName]

							return (
								<MemoNavLi
									key={ruleDottedName}
									ruleDottedName={ruleDottedName}
									open={open}
									active={dottedName === ruleDottedName}
									onClickDropdown={toggleDropdown}
								/>
							)
						})}
				</ul>
			</Nav>
		</>
	)
}

const NavLi = ({ ruleDottedName, open, active, onClickDropdown }) => {
	const baseEngine = useEngine()

	const parsedRules = baseEngine.getParsedRules()
	const childrenCount = Object.keys(parsedRules).reduce(
		(acc, ruleDot) =>
			ruleDot.startsWith(ruleDottedName + ' . ') &&
			ruleDot.split(' . ').length === ruleDottedName.split(' . ').length + 1
				? acc + 1
				: acc,
		0
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
		<li
			key={ruleDottedName}
			ref={active ? activeLi : undefined}
			style={{
				marginLeft: (ruleDottedName.split(' . ').length - 1) * 16,
			}}
			className={
				(childrenCount > 0 ? 'dropdown ' : '') + (active ? 'active ' : '')
			}
		>
			{childrenCount > 0 && (
				<DropdownButton onClick={() => onClickDropdown(ruleDottedName)}>
					{open ? <StyledArrowUp /> : <StyledArrowDown />}
				</DropdownButton>
			)}
			<RuleLinkWithContext dottedName={ruleDottedName} displayIcon />
		</li>
	)
}

const MemoNavLi = memo(NavLi)

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
	z-index: 200;
	transition: ease-in-out 0.25s;
	transition-property: visibility, opacity;
	visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
	opacity: ${({ $open }) => ($open ? '1' : '0')};

	@media (min-width: ${breakpointsWidth.lg}) {
		display: none;
	}
`

const OpenNavButton = styled.button`
	margin: 0.25rem 0;
	margin-right: 0.5rem;
	background: none;
	border: 1px solid rgb(29, 66, 140);
	border-radius: 3px;
	color: rgb(29, 66, 140);
	padding: 0.5rem;
	display: inline-block;

	&:hover {
		background-color: rgb(219, 231, 255);
	}
	@media (min-width: ${breakpointsWidth.lg}) {
		display: none;
	}
`

const Nav = styled.nav<{ $open: boolean }>`
	flex-basis: 30%;
	overflow: scroll;
	max-height: 80vh;
	position: sticky;
	top: 0;

	@media (max-width: ${breakpointsWidth.lg}) {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		z-index: 200;
		max-height: initial;
		background: white;
		max-width: 75vw;

		transition: all ease-in-out 0.25s;
		${({ $open }) => ($open ? '' : 'left: -100%; right: 100%;')}
	}

	ul {
		margin: 0.5rem;
		display: inline-flex;
		flex-direction: column;
		flex-wrap: nowrap;
		align-items: flex-start;
		padding: 0;

		li {
			margin-bottom: 3px;
			padding: 3px 0.5rem 3px 3px;
			display: flex;
			align-items: center;
			flex-direction: row;
			flex-wrap: nowrap;
			max-width: 350px;

			&.active {
				background-color: #e6e6e6;
				border-radius: 3px;
			}

			&:not(.dropdown):before {
				content: ' ';
				display: inline-block;
				background-color: #b3b3b3;
				min-width: 0.5rem;
				min-height: 0.5rem;
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
	min-width: 1.5rem;
	max-width: 1.5rem;
	height: 1.5rem;
	min-height: 1.5rem;
	max-height: 1.5rem;
	color: #999;
	padding: 0;
	display: inline-block;
	line-height: 0;
`

const StyledArrowUp = styled(ArrowUp)`
	width: 100%;
	height: 100%;
`

const StyledArrowDown = styled(ArrowDown)`
	width: 100%;
	height: 100%;
`
