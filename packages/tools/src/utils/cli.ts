import * as p from '@clack/prompts'
import chalk from 'chalk'
import { spawn } from 'child_process'
import { setTimeout } from 'timers/promises'

export type Spinner = {
  start: (msg?: string) => void
  stop: (msg?: string, code?: number) => void
  message: (msg?: string) => void
}

export function exitWithError({
  ctx,
  msg,
  code = 1,
  spinner,
}: {
  ctx: string
  msg: string
  code?: number
  spinner?: Spinner
}): never {
  if (spinner) {
    spinner.stop(ctx, code)
  } else {
    p.log.error(ctx)
  }
  p.log.message(chalk.dim(msg.trim()))
  p.outro('Exiting due to an error.')
  process.exit(code)
}

/**
 * Run an synchronous function in a promise with a spinner from
 * `@clack/prompts`
 */
export function runWithSpinner<T>(
  startMsg: string,
  stopMsg: string,
  fn: (spinner: Spinner) => T,
): Promise<T> {
  return runAsyncWithSpinner(startMsg, stopMsg, (s) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = fn(s)
        await setTimeout(1)
        resolve(res)
      } catch (error) {
        reject(error)
      }
    })
  })
}

/**
 * Run an asynchronous function in a promise with a spinner from
 * `@clack/prompts`
 */
export async function runAsyncWithSpinner<T>(
  startMsg: string,
  stopMsg: string,
  fn: (spinner: Spinner) => Promise<T>,
): Promise<T> {
  const s = p.spinner()
  s.start(startMsg)
  const res = await fn(s)
  s.stop(stopMsg)
  return res
}

export function spawnAsync(command, ...args): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'ignore' })

    child.on('error', reject)

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(`Command "${command}" failed with code ${code}`)
      }
    })
  })
}
