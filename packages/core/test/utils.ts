import { parse } from 'yaml'
import dedent from 'dedent-js'
import Engine from '../source/index'

export const parseYaml = (yamlString: string) => {
	return parse(dedent(yamlString))
}

export const engineFromYaml = (yaml: string) => new Engine(parse(yaml))
