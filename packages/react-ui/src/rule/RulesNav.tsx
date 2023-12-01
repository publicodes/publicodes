import { utils } from 'publicodes'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { styled } from 'styled-components'
import { RuleLinkWithContext } from '../RuleLink'
import { Arrow } from '../component/icons'
import { useEngine } from '../hooks'
interface Props {
	dottedName: string
	mobileMenuPortalId?: string
	openNavButtonPortalId?: string
}

export const RulesNav = ({
	dottedName,
	mobileMenuPortalId,
	openNavButtonPortalId,
}: Props) => {
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

	const openNavButtonPortalElement =
		typeof window === 'undefined'
			? null
			: (openNavButtonPortalId &&
					window.document.getElementById(openNavButtonPortalId)) ||
			  window.document.getElementById('rules-nav-open-nav-button')

	const menu = (
		<Container $open={navOpen}>
			<Background
				$open={navOpen}
				onClick={() => {
					setNavOpen((open) => !open)
				}}
			/>

			{/* Portal in Header */}
			{openNavButtonPortalElement &&
				ReactDOM.createPortal(
					<OpenNavButton onClick={() => setNavOpen(true)}>
						Toutes les règles
					</OpenNavButton>,
					openNavButtonPortalElement
				)}

			<Nav $open={navOpen}>
				<ul>
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
		</Container>
	)

	const isMobileMenu =
		typeof window !== 'undefined' &&
		window.matchMedia(`(max-width: ${breakpointsWidth.lg})`).matches

	const mobileMenuPortalElement =
		typeof window !== 'undefined' && mobileMenuPortalId
			? window.document.getElementById(mobileMenuPortalId)
			: null

	return isMobileMenu && mobileMenuPortalElement
		? ReactDOM.createPortal(menu, mobileMenuPortalElement)
		: menu
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
		activeLi.current?.scrollIntoView?.({
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
				paddingLeft: (ruleDottedName.split(' . ').length - 1) * 16,
			}}
			className={
				(childrenCount > 0 ? 'dropdown ' : '') + (active ? 'active ' : '')
			}
		>
			<span className="content">
				{childrenCount > 0 && (
					<DropdownButton
						aria-label={open ? 'Replier le sous-menu' : 'Déplier le sous-menu'}
						aria-expanded={open}
						onClick={() => onClickDropdown(ruleDottedName)}
					>
						<StyledArrow $open={open} />
					</DropdownButton>
				)}
				<RuleLinkWithContext dottedName={ruleDottedName} displayIcon />
			</span>
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

const Container = styled.div<{ $open: boolean }>`
	z-index: 200;
	overflow: auto;
	position: sticky;
	top: 0;

	@media (min-width: ${breakpointsWidth.lg}) {
		max-width: 50%;
		flex-shrink: 0;
	}
`

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
	@media (min-width: ${breakpointsWidth.lg}) {
		flex-shrink: 0;
	}
	border-right: 1px solid #e6e6e6;
	overflow: auto;
	max-height: calc(100vh - 2rem);
	position: sticky;
	top: 0;
	@media (max-width: ${breakpointsWidth.lg}) {
		position: fixed;
		top: 0;
		left: 0;
		padding-top: 1rem;
		bottom: 0;
		z-index: 200;
		max-height: initial;
		background: white;
		max-width: 80vw;
		height: 100%;

		transition: all ease-in-out 0.25s;
		${({ $open }) => ($open ? '' : 'transform: translateX(-100%);')}
	}

	ul {
		flex-wrap: nowrap;
		margin: 0;

		padding: 0;
		list-style: none;
		li {
			margin-bottom: 3px;
			max-width: 350px;
			.content {
				border-radius: 3px;
				padding: 3px 1rem;
				display: flex;
				width: fit-content;
				align-items: center;
				flex-direction: row;
				flex-wrap: nowrap;
			}

			&.active .content {
				background-color: #e6e6e6;
			}
			&:not(.active) a {
				font-weight: normal;
			}
			&:not(.dropdown) .content:before {
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
	flex-shrink: 0;
	background: none;
	border: 1px solid #b3b3b3;
	border-radius: 2rem;
	width: 1.5rem;
	height: 1.5rem;
	color: #999;
	padding: 0;
	display: inline-block;
`

const StyledArrow = styled(Arrow)<{ $open: boolean }>`
	width: 100%;
	transition: transform 0.1s;
	height: 100%;
	transform: rotate(${({ $open }) => ($open ? '0deg' : '-90deg')});
`
