import { useState } from 'react'
import { ExprMechanismPage } from './pages/ExprMechanismPage'
import { ValueMechanismPage } from './pages/ValueMechanismPage'
import { IsApplicableMechanismPage } from './pages/IsApplicableMechanismPage'
import { SumMechanismPage } from './pages/SumMechanismPage'
import { ProductMechanismPage } from './pages/ProductMechanismPage'
import { AllOfMechanismPage } from './pages/AllOfMechanismPage'
import { OneOfMechanismPage } from './pages/OneOfMechanismPage'
import { MinOfMechanismPage } from './pages/MinOfMechanismPage'
import { MaxOfMechanismPage } from './pages/MaxOfMechanismPage'
import { VariationsMechanismPage } from './pages/VariationsMechanismPage'
import { ApplicableIfMechanismPage } from './pages/ApplicableIfMechanismPage'
import { NotApplicableIfMechanismPage } from './pages/NotApplicableIfMechanismPage'
import { ContextMechanismPage } from './pages/ContextMechanismPage'
import { DefaultMechanismPage } from './pages/DefaultMechanismPage'
import { CeilingMechanismPage } from './pages/CeilingMechanismPage'
import { FloorMechanismPage } from './pages/FloorMechanismPage'
import { RoundUpMechanismPage } from './pages/RoundUpMechanismPage'
import { RoundDownMechanismPage } from './pages/RoundDownMechanismPage'
import { RoundNearestMechanismPage } from './pages/RoundNearestMechanismPage'
import { AutoEntrepeneurExamplePage } from './pages/AutoEntrepreneurExamplePage'
import { SimpleTJMExamplePage } from './pages/SimpleTJMExamplePage'

const PAGES = {
	home: { label: 'Accueil', component: HomePage },
	expr: { label: 'ExprMechanism', component: ExprMechanismPage },
	value: { label: 'ValueMechanism', component: ValueMechanismPage },
	is_applicable: {
		label: 'IsApplicableMechanism',
		component: IsApplicableMechanismPage,
	},
	sum: { label: 'SumMechanism', component: SumMechanismPage },
	product: { label: 'ProductMechanism', component: ProductMechanismPage },
	all_of: { label: 'AllOfMechanism', component: AllOfMechanismPage },
	one_of: { label: 'OneOfMechanism', component: OneOfMechanismPage },
	min_of: { label: 'MinOfMechanism', component: MinOfMechanismPage },
	max_of: { label: 'MaxOfMechanism', component: MaxOfMechanismPage },
	variations: {
		label: 'VariationsMechanism',
		component: VariationsMechanismPage,
	},
	applicable_if: {
		label: 'ApplicableIfMechanism',
		component: ApplicableIfMechanismPage,
	},
	not_applicable_if: {
		label: 'NotApplicableIfMechanism',
		component: NotApplicableIfMechanismPage,
	},
	context: { label: 'ContextMechanism', component: ContextMechanismPage },
	default: { label: 'DefaultMechanism', component: DefaultMechanismPage },
	ceiling: { label: 'CeilingMechanism', component: CeilingMechanismPage },
	floor: { label: 'FloorMechanism', component: FloorMechanismPage },
	round_up: { label: 'RoundUpMechanism', component: RoundUpMechanismPage },
	round_down: {
		label: 'RoundDownMechanism',
		component: RoundDownMechanismPage,
	},
	round_nearest: {
		label: 'RoundNearestMechanism',
		component: RoundNearestMechanismPage,
	},
	tjm_example: {
		label: 'Exemple : simple TJM',
		component: SimpleTJMExamplePage,
	},
	autoentrepreneur_example: {
		label: 'Exemple : auto-entrepreneur',
		component: AutoEntrepeneurExamplePage,
	},
} as const

type PageKey = keyof typeof PAGES

function HomePage() {
	return (
		<>
			<h1>Autodoc Playground</h1>
			<p>Composants de documentation auto-générée pour Publicodes.</p>
		</>
	)
}

export function App() {
	const [page, setPage] = useState<PageKey>('home')

	const PageComponent = PAGES[page].component

	return (
		<main>
			<nav>
				<ul>
					{Object.entries(PAGES).map(([key, { label }]) => (
						<li key={key}>
							<a
								href="#"
								onClick={(e) => {
									e.preventDefault()
									setPage(key as PageKey)
								}}
							>
								{label}
							</a>
						</li>
					))}
				</ul>
			</nav>
			<hr />
			<PageComponent />
		</main>
	)
}
