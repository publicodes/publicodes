const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')

yargs(hideBin(process.argv)).commandDir('commands').alias({ h: 'help' }).argv
