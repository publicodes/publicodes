import {
  ExecException,
  execSync,
  ExecSyncOptionsWithBufferEncoding,
} from 'child_process'
import path, { join } from 'path'
import fs, { mkdtempSync } from 'fs'
import os from 'os'

export type ExecError = ExecException & { stderr: string; stdout: string }

export type ExecOptions = ExecSyncOptionsWithBufferEncoding & {
  silent?: boolean
}

export type ExecResult = {
  code: number
  stdout?: string
  stderr?: string
  error?: ExecError
}

const TEST_DATA_DIR = path.join(process.cwd(), 'test', 'commands-data')

/**
 * Utility test class to execute the CLI command
 */
export class CLIExecutor {
  private binPath: string

  constructor() {
    const curentDir = process.cwd()
    this.binPath =
      process.platform === 'win32'
        ? path.join(curentDir, 'bin', 'dev.cmd')
        : path.join(curentDir, 'bin', 'dev.js')
  }

  public execCommand(cmd: string, options?: ExecOptions): Promise<ExecResult> {
    const silent = options?.silent ?? true
    const command = `${this.binPath} ${cmd}`
    const cwd = process.cwd()

    return new Promise((resolve) => {
      if (silent) {
        try {
          const r = execSync(command, { ...options, stdio: 'pipe', cwd })
          const stdout = r.toString()

          resolve({ code: 0, stdout })
        } catch (error) {
          const err = error as ExecError
          console.log(error)

          resolve({
            code: 1,
            error: err,
            stdout: err.stdout?.toString() ?? '',
            stderr: err.stderr?.toString() ?? '',
          })
        }
      } else {
        execSync(command, { ...options, stdio: 'inherit', cwd })
        resolve({ code: 0 })
      }
    })
  }
}

// On macOS, os.tmpdir() is not a real path:
// https://github.com/nodejs/node/issues/11422
const TMP_DIR = fs.realpathSync(os.tmpdir())

export async function runInDir(
  dir: 'tmp' | string,
  fn: (cwd: string) => Promise<void>,
): Promise<void> {
  const baseCwd = process.cwd()
  const ctd =
    dir === 'tmp'
      ? mkdtempSync(path.join(TMP_DIR, 'publicodes-cli-test-'))
      : path.join(TEST_DATA_DIR, dir)

  if (!fs.existsSync(ctd)) {
    fs.mkdirSync(ctd, { recursive: true })
  }

  process.chdir(ctd)

  try {
    await fn(ctd)
  } finally {
    process.chdir(baseCwd)
    if (dir === 'tmp' && fs.existsSync(ctd)) {
      fs.rmSync(ctd, { recursive: true })
    }
  }
}
