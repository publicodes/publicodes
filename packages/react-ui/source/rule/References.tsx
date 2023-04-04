import { capitalise0 } from 'publicodes'

type ReferencesProps = {
	references: Record<string, string> | undefined
	rawNode: Object
}

export default function References({ references }: ReferencesProps) {
	if (!references) return null
	return (
		<section>
			<h3>Références</h3>
			<ul>
				{Object.entries(references).map(([name, link]) => (
					<li
						style={{
							display: 'flex',
							alignItems: 'center',
						}}
						key={name}
					>
						<a
							href={link}
							target="_blank"
							style={{
								marginRight: '1rem',
							}}
						>
							{capitalise0(name)}
						</a>
						<span className="ui__ label">{link}</span>
					</li>
				))}
			</ul>
		</section>
	)
}
