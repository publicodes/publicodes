import { Link } from 'react-router-dom'
import { sitemap } from '../sitemap'

export function RulesIndex() {
	return (
		<div>
			<h1>Index des règles</h1>
			<ul>
				{Object.entries(sitemap).map(([path, name]) => (
					<li key={path}>
						<Link to={path}>{name}</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
