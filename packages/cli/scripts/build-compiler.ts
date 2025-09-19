/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { getPublicodesBinName } from '../src/platform.ts'

// Enable strict error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
  process.exit(1)
})

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const COMPILER_DIR = path.join(__dirname, '../../compiler')
const BUILT_BINARY = path.join(COMPILER_DIR, '_build/default/bin/main.exe')
const DEST_BINARY = path.join(
  __dirname,
  '../bin/compiler',
  getPublicodesBinName(),
)

// 1. Run dune build in the compiler package
console.log('Building compiler with dune...')
execSync('cd ' + COMPILER_DIR + ' && dune build', { stdio: 'inherit' })
console.log('Done.')

// 2. Ensure destination directory exists and has the correct permissions
if (!fs.existsSync(path.dirname(DEST_BINARY))) {
  fs.mkdirSync(path.dirname(DEST_BINARY), { recursive: true, mode: 0o755 })
}

// 3. Copy the generated binary
console.log('Copying compiler binary...')

fs.copyFile(BUILT_BINARY, DEST_BINARY, (err) => {
  if (err) {
    console.error('Error copying file:', err)
    process.exit(1)
  }

  // 4. Make the binary executable
  fs.chmodSync(
    DEST_BINARY,
    fs.constants.S_IRWXU |
      fs.constants.S_IRGRP |
      fs.constants.S_IXGRP |
      fs.constants.S_IROTH |
      fs.constants.S_IXOTH,
  )

  console.log('Done.')
})
