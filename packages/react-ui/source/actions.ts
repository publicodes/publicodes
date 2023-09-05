import {
	ActionData,
	GenerateActions,
	GetAction,
	addBase,
	isWorkerEngine,
} from '@publicodes/worker'
import { WorkerEngine } from '@publicodes/worker-react'
import Engine from 'publicodes'
import { getExplanationData } from './Explanation'
import { getRuleLinkData } from './RuleLink'
import { getDocumentationSiteMap } from './index'
import {
	getIsDimmedValue,
	getSortByApplicability,
} from './mecanisms/DefaultInlineMecanism'
import { getReferenceData } from './mecanisms/Reference'
import { evaluateWithSubEngine } from './mecanisms/Situation'
import {
	getEffects,
	getIsExperimental,
	getRuleNamesWithMissing,
} from './rule/DeveloperAccordion'
import { getRuleHeaderData } from './rule/Header'
import { getRuleData } from './rule/RulePage'
import { getRuleSource } from './rule/RuleSource'
import { getParsedRulesKeysData } from './rule/RulesNav'

const ACTION_BASE = 'publicodes-react'

/**
 * ...
 */
export const publicodesReactActions = () => addBase(ACTION_BASE, actions())

export type PublicodesReactActions = GenerateActions<
	ReturnType<typeof publicodesReactActions>
>

const actions = () => ({
	getRuleData,
	getRuleLinkData,
	getDocumentationSiteMap,
	getExplanationData,
	getIsDimmedValue,
	getSortByApplicability,
	getReferenceData,
	getRuleHeaderData,
	getParsedRulesKeysData,
	evaluateWithSubEngine,
	getIsExperimental,
	getRuleNamesWithMissing,
	getEffects,
	getRuleSource,
})
type LocalActionsDictionary = ReturnType<typeof actions>

export type LocalActions = GenerateActions<LocalActionsDictionary>

/**
 * ...
 */
export const executeAction = async <ActionName extends LocalActions['action']>(
	engine: Engine | WorkerEngine,
	action: ActionName,
	...params: GetAction<LocalActions, ActionName>['params']
) =>
	(isWorkerEngine(engine)
		? engine.postMessage(
				(ACTION_BASE + '.' + action) as PublicodesReactActions['action'],
				...params
		  )
		: actions()[action](
				{ engine, engineId: -1, id: -1 } as ActionData,
				// @ts-ignore Typescript does not support rest parameters of union of tuple
				...params
		  )) as Promise<GetAction<LocalActions, ActionName>['result']>

/**
 * Return the engine or the sub-engine if subEngineId is defined
 */
export const getSubEngineOrEngine = (engine: Engine, subEngineId?: number) =>
	typeof subEngineId === 'number' && engine.subEngines.length >= subEngineId
		? engine.subEngines[subEngineId]
		: engine
