import Engine, { formatValue } from 'publicodes'
import { useParams } from 'react-router-dom'
import {
	currentPage,
	goToNextPage,
	goToPreviousPage,
	handleInputChange,
	initFormState,
} from '@publicodes/forms'
import { useCallback, useState } from 'react'
export default function RuleForm({
	engine,
	targetRule,
}: {
	engine: Engine
	targetRule: string
}) {
	const [formState, setState] = useState(initFormState({ engine }, targetRule))
	const pageElements = currentPage(formState, { engine })

	// Handle user input
	function onInputChange(id: string, value: string) {
		setState(
			handleInputChange(formState, id, value, {
				engine,
			}),
		)
	}

	// Navigate pages
	const handleClickOnNext = useCallback(
		() => setState(goToNextPage(formState)),
		[formState],
	)
	const handleClickOnPrev = useCallback(
		() => setState(goToPreviousPage(formState)),
		[formState],
	)

	return (
		<>
			<section>
				<h3>
					{engine.getRule(targetRule).title} :{' '}
					<code>{formatValue(engine.evaluate(targetRule))}</code>
				</h3>
			</section>
			<form>
				{pageElements.map((element) => (
					<div key={element.id}>
						{element.element === 'input' ?
							<label>
								{element.label}
								<input
									{...element}
									onChange={(e) => onInputChange(element.id, e.target.value)}
								/>
							</label>
						: element.element === 'select' ?
							<label>
								{element.label}
								<select
									{...element}
									onChange={(e) => onInputChange(element.id, e.target.value)}
								>
									{element.options.map((option) => (
										<option key={option.label} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</label>
						: element.element === 'textarea' ?
							<label>
								{element.label}
								<textarea
									{...element}
									onChange={(e) => onInputChange(element.id, e.target.value)}
								/>
							</label>
						: element.element === 'RadioGroup' ?
							<fieldset>
								<legend>{element.label}</legend>
								{element.options.map((option) => (
									<label key={option.label}>
										<input
											type="radio"
											name={element.id}
											value={element.value}
											checked={element.value === option.value}
											onChange={(e) =>
												onInputChange(element.id, e.target.value)
											}
										/>
										{option.label}
									</label>
								))}
							</fieldset>
						:	<p>Not implemented</p>}
					</div>
				))}
				<button onClick={handleClickOnNext}>Précédent</button>
				<button onClick={handleClickOnPrev}>Suivant</button>
			</form>
		</>
	)
}
