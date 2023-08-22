import { GetAction, Test, addBase, isWorkerEngine } from '@publicodes/worker'
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
import { getParsedRulesData } from './rule/RulesNav'

const ACTION_BASE = 'publicodes-react'

/**
 * ...
 */
export const publicodesReactActions = () => addBase(ACTION_BASE, actions())

export type Actions = Test<ReturnType<typeof publicodesReactActions>>

const actions = () => ({
	getRuleData,
	getRuleLinkData,
	getDocumentationSiteMap,
	getExplanationData,
	getIsDimmedValue,
	getSortByApplicability,
	getReferenceData,
	getRuleHeaderData,
	getParsedRulesData,
	evaluateWithSubEngine,
	getIsExperimental,
	getRuleNamesWithMissing,
	getEffects,
	getRuleSource,
})

export type LocalActions = Test<ReturnType<typeof actions>>

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
				(ACTION_BASE + '.' + action) as Actions['action'],
				...params
		  )
		: actions()[action](
				engine,
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
