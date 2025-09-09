#!/usr/bin/env node
/* eslint-disable no-console */

import { spawn } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { getPublicodesBinName } from '../platform'

const __dirname = dirname(fileURLToPath(import.meta.url))

const binPath = join(__dirname, 'compiler', getPublicodesBinName())



// Check if the binary exists before trying to spawn it
if (!existsSync(binPath)) {
  console.error(`Error: Could not find the publicodes binary at ${binPath}`)
  if (process.env.NODE_ENV === 'development') {
    console.error(
    'Please make sure the compiler is built with "yarn run build:compiler" first',
  )
  process.exit(1)
}

// Forward all arguments except "node" and this script itself
const args = process.argv.slice(2)

const child = spawn(binPath, args, {
  stdio: 'inherit',
})

child.on('error', (err) => {
  console.error(`Failed to start publicodes: ${err.message}`)
  process.exit(1)
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
