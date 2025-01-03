import Engine from 'publicodes';
import { parse } from 'yaml';

type EngineAndErrors = {
	engine: Engine | null;
	error: Array<string>;
	warning: Array<string>;
};

export function createEngine(yamlRules: string): EngineAndErrors {
	let engine: Engine | null = null;
	let error: Array<string> = [];
	let warning: Array<string> = [];

	try {
		const rawRules = parse(yamlRules);
		if (typeof rawRules === 'string') {
			if (rawRules.includes(':')) {
				error.push(
					formatError('[Erreur de parsing]\n Il manque un espace après les `:`')
				);
			}
			return {
				engine,
				error,
				warning
			};
		}

		engine = new Engine(rawRules, {
			logger: {
				error: (message) => {
					error.push(message);
				},
				warn: (message) => {
					warning.push(message);
				},
				log: () => {}
			}
		});
		for (const rule of Object.keys(engine.getParsedRules())) {
			engine.evaluate(rule);
		}
	} catch (e) {
		if (e instanceof Error) {
			error.push(e.message);
		}
	}
	error = error.map(formatError);
	warning = warning.map(formatError);

	return { engine, error, warning };
}

function formatError(string: string) {
	return (
		string
			.replace(/^\n/, '')
			// replace "[Erreur syntaxique]" by "Erreur syntaxique"
			.replace(/\[(.*)\]/, '$1')
	);
}
