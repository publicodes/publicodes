import { Link } from 'react-router-dom'
import { situations } from '../situations'

export default function Header({
	setSituation,
	activeSituation,
}: {
	setSituation: (situation: string) => void
	activeSituation: string
}) {
	return (
		<header className=" container mx-auto p-4">
			<div className="flex items-center justify-between  flex-col md:flex-row">
				<h1>
					<Link to="/" className="text-xl font-bold">
						⚡ Quick-doc
					</Link>
				</h1>

				<nav className="w-full md:w-auto ">
					<div className="flex flex-col gap-2">
						<label
							htmlFor="situation-select"
							className="text-sm font-medium text-gray-700"
						>
							Selectionner une situation
						</label>
						<select
							id="situation-select"
							value={activeSituation}
							onChange={(e) => setSituation(e.target.value)}
							className="block w-full md:w-64 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="">—</option>
							{Object.keys(situations).map((situationName) => (
								<option key={situationName} value={situationName}>
									{situationName}
								</option>
							))}
						</select>
					</div>
				</nav>
			</div>
		</header>
	)
}
