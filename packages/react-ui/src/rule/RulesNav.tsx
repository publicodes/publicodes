import { utils } from 'publicodes'
import {
	lazy,
	memo,
	ReactNode,
	RefObject,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import ReactDOM from 'react-dom'
import { styled } from 'styled-components'
import { RuleLinkWithContext } from '../RuleLink'
import { Arrow } from '../component/icons/Arrow'
import { Close } from '../component/icons/Close'
import { useEngine } from '../hooks'

const RulesSearch = lazy(() => import('./RulesSearch'))

interface Props {
	dottedName: string
	searchBar: boolean
	mobileMenuPortalId?: string
	openNavButtonPortalId?: string
	displayIcon?: boolean
}

export const RulesNav = ({
	dottedName,
	searchBar,
	mobileMenuPortalId,
	openNavButtonPortalId,
	displayIcon,
}: Props) => {
	const baseEngine = useEngine()
	const parsedRules = baseEngine.getParsedRules()
	const parsedRulesNames = useMemo(
		() => Object.keys(parsedRules).sort((a, b) => a.localeCompare(b)),
		[parsedRules],
	)

	const [navOpen, setNavOpen] = useState(false)

	const initLevel = (dn: string) =>
		Object.fromEntries([
			[dn, true],
			...utils.ruleParents(dn).map((parent) => [parent, true]),
		] as [string, boolean][])

	const [level, setLevel] = useState(initLevel(dottedName))

	useEffect(() => {
		setLevel((prev) => ({ ...prev, ...initLevel(dottedName) }))
	}, [dottedName])

	const toggleDropdown = useCallback((ruleDottedName: string) => {
		setLevel((prevLevel) =>
			!prevLevel[ruleDottedName] ?
				{
					...prevLevel,
					[ruleDottedName]: !prevLevel[ruleDottedName],
				}
			:	Object.fromEntries(
					Object.entries(prevLevel).map(([dot, val]) =>
						dot.startsWith(ruleDottedName) ? [dot, false] : [dot, val],
					),
				),
		)
	}, [])

	const openNavButtonPortalElement =
		typeof window === 'undefined' ? null : (
			(openNavButtonPortalId &&
				window.document.getElementById(openNavButtonPortalId)) ||
			window.document.getElementById('rules-nav-open-nav-button')
		)

	const openNavButtonRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		if (openNavButtonRef.current && !navOpen) {
			openNavButtonRef.current.focus()
		}
	}, [openNavButtonRef, navOpen])

	const navRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (!navRef.current || !navOpen) {
			return
		}

		const focusableElements = navRef.current.querySelectorAll(
			'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
		)

		const firstElement = focusableElements[0] as HTMLElement
		const lastElement = focusableElements[
			focusableElements.length - 1
		] as HTMLElement

		const handleKeyDown = (event: KeyboardEvent) => {
			if (openNavButtonPortalElement && navOpen) {
				if (event.key === 'Escape') {
					event.preventDefault()
					setNavOpen(false)
				} else if (event.key === 'Tab' && navRef.current) {
					if (event.shiftKey) {
						if (document.activeElement === firstElement) {
							event.preventDefault()
							lastElement.focus()
						}
					} else {
						if (document.activeElement === lastElement) {
							event.preventDefault()
							firstElement.focus()
						}
					}
				}
			}
		}

		navRef.current.addEventListener('keydown', handleKeyDown)

		return () => {
			if (navRef.current) {
				navRef.current.removeEventListener('keydown', handleKeyDown)
			}
		}
	}, [navRef, navOpen])

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
					<OpenNavButton
						ref={openNavButtonRef}
						onClick={() => {
							setNavOpen(true)
							if (navRef.current) {
								navRef.current.focus()
							}
						}}
					>
						Toutes les règles
					</OpenNavButton>,
					openNavButtonPortalElement,
				)}
			<NavContainer
				role={navOpen ? 'dialog' : undefined}
				aria-modal={navOpen ? 'true' : undefined}
				aria-label={navOpen ? 'Menu de navigation' : undefined}
				$open={navOpen}
				ref={navRef}
				tabIndex={-1}
			>
				<nav
					role="navigation"
					aria-label="Menu de navigation sur les règles de la documentation"
				>
					{searchBar ?
						<Suspense fallback={<p>Chargement...</p>}>
							<RulesSearch />
						</Suspense>
					:	null}
					<NavUl
						onClick={() => {
							setNavOpen(false)
						}}
						rules={parsedRulesNames}
						level={level}
						navRef={navRef}
						toggleDropdown={toggleDropdown}
						dottedName={dottedName}
						displayIcon={displayIcon}
						parentName=""
					/>
				</nav>
				{navOpen && (
					<CloseButton
						aria-label="Fermer le menu de navigation"
						onClick={() => setNavOpen(false)}
					>
						<Close />
					</CloseButton>
				)}
			</NavContainer>
		</Container>
	)

	const isMobileMenu =
		typeof window !== 'undefined' &&
		window.matchMedia(`(max-width: ${breakpointsWidth.lg})`).matches

	const mobileMenuPortalElement =
		typeof window !== 'undefined' && mobileMenuPortalId ?
			window.document.getElementById(mobileMenuPortalId)
		:	null

	return isMobileMenu && mobileMenuPortalElement ?
			ReactDOM.createPortal(menu, mobileMenuPortalElement)
		:	menu
}

type NavUlProps = {
	rules: string[]
	level: Record<string, boolean>
	navRef: RefObject<HTMLDivElement>
	onClick: () => void
	toggleDropdown: (name: string) => void
	dottedName: string
	parentName: string
	displayIcon?: boolean
}
const NavUl = ({
	rules,
	level,
	navRef,
	onClick,
	toggleDropdown,
	dottedName,
	parentName,
	displayIcon,
}: NavUlProps) => {
	return (
		<ul>
			{rules.map((ruleDottedName) => {
				const parentDottedName = utils.ruleParent(ruleDottedName)
				if (parentDottedName !== parentName) {
					return null
				}

				const open = ruleDottedName in level && level[ruleDottedName]
				return (
					<MemoNavLi
						onClick={onClick}
						key={ruleDottedName}
						ruleDottedName={ruleDottedName}
						open={open}
						active={dottedName === ruleDottedName}
						onClickDropdown={toggleDropdown}
						navRef={navRef}
						displayIcon={displayIcon}
					>
						{level[ruleDottedName] && (
							<NavUl
								onClick={onClick}
								rules={rules}
								level={level}
								navRef={navRef}
								toggleDropdown={toggleDropdown}
								dottedName={dottedName}
								parentName={ruleDottedName}
								displayIcon={displayIcon}
							/>
						)}
					</MemoNavLi>
				)
			})}
		</ul>
	)
}

type NavLiProps = {
	ruleDottedName: string
	open: boolean
	active: boolean
	onClick: () => void
	onClickDropdown: (ruleDottedName: string) => void
	navRef: RefObject<HTMLDivElement>
	displayIcon?: boolean
	children?: ReactNode
}
const NavLi = ({
	ruleDottedName,
	open,
	active,
	onClick,
	onClickDropdown,
	navRef,
	displayIcon,
	children,
}: NavLiProps) => {
	const baseEngine = useEngine()

	const parsedRules = baseEngine.getParsedRules()
	const childrenCount = Object.keys(parsedRules).reduce(
		(acc, ruleDot) =>
			(
				ruleDot.startsWith(ruleDottedName + ' . ') &&
				ruleDot.split(' . ').length === ruleDottedName.split(' . ').length + 1
			) ?
				acc + 1
			:	acc,
		0,
	)
	const initialRender = useRef(true)
	const activeLi = useRef<HTMLLIElement>(null)
	useEffect(() => {
		if (initialRender.current) {
			initialRender.current = false
			return
		}
		if (navRef.current && activeLi.current?.offsetTop) {
			navRef.current.scrollTop = activeLi.current?.offsetTop
		}
	}, [active])
	return (
		<li
			key={ruleDottedName}
			ref={active ? activeLi : undefined}
			style={{
				paddingLeft: (ruleDottedName.split(' . ').length - 1) * 16,
			}}
			className={childrenCount > 0 ? 'dropdown ' : ''}
		>
			<span className={`content ${active ? 'active ' : ''}`}>
				<RuleLinkWithContext
					dottedName={ruleDottedName}
					displayIcon={displayIcon}
					onClick={onClick}
				/>
				{childrenCount > 0 && (
					<DropdownButton
						aria-label={open ? 'Replier le sous-menu' : 'Déplier le sous-menu'}
						aria-expanded={open}
						onClick={() => onClickDropdown(ruleDottedName)}
					>
						<StyledArrow $open={open} />
					</DropdownButton>
				)}
			</span>
			{children}
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

const NavContainer = styled.div<{ $open: boolean }>`
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
		padding-right: 2rem;
		bottom: 0;
		z-index: 200;
		max-height: initial;
		background: white;
		max-width: 80vw;
		height: 100%;

		transition: all ease-in-out 0.25s;
		${({ $open }) => ($open ? '' : 'transform: translateX(-100%);')}
	}

	&:focus {
		outline: none;
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
				flex-direction: row-reverse;
				flex-wrap: nowrap;
			}

			span {
				&.active {
					background-color: #e6e6e6;
				}
			}

			&:not(.active) a {
				font-weight: normal;
			}
			&:not(.dropdown) .content:after {
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

const CloseButton = styled.button`
	cursor: pointer;
	position: absolute;
	border-radius: 0.25rem;
	top: 0.25rem;
	padding: 0.25rem;
	right: 0.25rem;
	height: 1.5rem;
	background-color: transparent;
	border: none;

	&:hover {
		background-color: #e6e6e6;
	}
`
