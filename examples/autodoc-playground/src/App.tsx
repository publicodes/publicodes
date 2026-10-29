import { useHashRoute } from './hash-route'
import {
	AutoEntrepreneurDoc,
	basePath as autoBasePath,
} from './models/auto-entrepreneur'
import { basePath as ekofestBasePath, EkofestDoc } from './models/ekofest'
import { basePath as tjmBasePath, SimpleTjmDoc } from './models/simple-TJM'

const MODELS = [
	{
		name: 'auto-entrepreneur',
		basePath: autoBasePath,
		Doc: AutoEntrepreneurDoc,
	},
	{ name: 'simple-TJM', basePath: tjmBasePath, Doc: SimpleTjmDoc },
	{ name: 'ekofest', basePath: ekofestBasePath, Doc: EkofestDoc },
]

/** Which model the address bar names, so a link to a page is a link to its model too. */
const modelOf = (path: string) =>
	MODELS.find((model) => path.startsWith(model.basePath)) ?? MODELS[0]

export function App() {
	const { path } = useHashRoute()
	const model = modelOf(path)
	const Current = model.Doc

	return (
		<main>
			<nav className="doc-models" aria-label="Modèles">
				{MODELS.map(({ name, basePath }) => (
					<a
						key={name}
						href={`#${basePath}`}
						aria-current={name === model.name ? 'page' : undefined}
					>
						{name}
					</a>
				))}
			</nav>
			<Current />
		</main>
	)
}
