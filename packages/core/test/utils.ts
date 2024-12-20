import dedent from 'dedent-js'
import { parse } from 'yaml'
import Engine, { EngineOptions } from '../src/index'
import { RawRule } from '../src/parsePublicodes'

export const parseYaml = (yamlString: string): Record<string, RawRule> => {
	return parse(dedent(yamlString))
}

export const engineFromYaml = (yaml: string, options?: EngineOptions) =>
	new Engine(parse(yaml), options)
