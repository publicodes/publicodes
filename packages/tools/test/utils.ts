import { RuleName, disabledLogger } from '../src/commons'
import Engine from 'publicodes'
import type { ParsedRules } from 'publicodes'
import { ChildProcess, exec } from 'child_process'
import fs from 'fs'
import path from 'path'

export function callWithEngine<R>(fn: (engine: Engine) => R, rawRules: any): R {
  const engine = new Engine(rawRules, {
    logger: disabledLogger,
    strict: { noOrphanRule: false },
  })
  return fn(engine)
}

export function callWithParsedRules<R>(
  fn: (rules: ParsedRules<RuleName>) => R,
  rawRules: any,
): R {
  const engine = new Engine(rawRules)
  return fn(engine.getParsedRules())
}
