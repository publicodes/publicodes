import dedent from 'dedent-js'
import { parse } from 'yaml'
import Engine from '../src/index'

export const parseYaml = (yamlString: string) => {
	return parse(dedent(yamlString))
}

export const engineFromYaml = (yaml: string) => new Engine(parse(yaml))
