// src/quick-doc/dev-server.ts
import * as p from '@clack/prompts'
import tailwindcss from '@tailwindcss/vite'
import chalk from 'chalk'
import { watch } from 'chokidar'
import { EventName } from 'chokidar/handler.js'
import { networkInterfaces } from 'os'
import Engine, { RawPublicodes } from 'publicodes'
import { createServer } from 'vite'
import type { RawRules } from '../commons'
import { getModelFromSource } from '../compilation'
import { runAsyncWithSpinner } from '../utils/cli'
import { extractSituations, TestSituation } from './extractSituations'

export type ViteDevServerOptions = {
	host?: string
	port?: number
	open?: boolean
}

export default async function createViteDevServer(
	modelFiles: string[],
	situationFiles: string[],
	quickDocPath: string,
	options: ViteDevServerOptions = {},
) {
	let currentRules: RawRules = {}
	let currentSituations: TestSituation = {}
	// Create server with spinner
	const vite = await runAsyncWithSpinner(
		'Starting Publicodes doc server...',
		'Server ready',
		async () => {
			const server = await createServer({
				plugins: [
					{
						name: 'publicodes-hot-reload',
						configureServer(server) {
							server.ws.on('connection', () => {
								p.log.info('Client connected to hot reload')
							})
						},
						transform(code, id) {
							if (id.includes('app-state')) {
								return {
									code: code
										.replace('__INJECTED_RULES__', JSON.stringify(currentRules))
										.replace(
											'__INJECTED_SITUATIONS__',
											JSON.stringify(currentSituations),
										),
									map: null,
								}
							}
						},
					},
					tailwindcss(),
				],
				root: quickDocPath,

				server: {
					host: options.host,
					port: options.port,
				},
			})
			return server
		},
	)
	let compilationCount = 0

	compileAndSendModel(true, 'all')
	void compileAndSendSituation(true, 'all')

	watch(modelFiles, {
		persistent: true,
		ignoreInitial: true,
	}).on('all', (event, path) => {
		if (event === 'add' || event === 'change') {
			void compileAndSendModel(false, event, path)
		}
	})

	watch(situationFiles, {
		persistent: true,
		ignoreInitial: true,
	}).on('all', (event, path) => {
		if (event === 'add' || event === 'change') {
			void compileAndSendSituation(false, event, path)
		}
	})

	// Start server
	await vite.listen()

	const protocol = 'http'
	let { host } = vite.config.server
	const { port } = vite.config.server
	const localUrl = `${protocol}://localhost:${port}`

	if (host === '0.0.0.0') {
		// One-liner to get the first network IP address
		const ip = Object.values(networkInterfaces()).find((list) =>
			list?.find((i) => i.family === 'IPv4' && !i.internal && i.address),
		)

		if (host === '0.0.0.0' && typeof ip === 'string') {
			host = ip
		}
	}

	const networkUrl =
		host ?
			chalk.cyan(`${protocol}://${host}:${port}`)
		:	chalk.dim('use ') + chalk.reset('--host') + chalk.dim(' to expose')
	const timestamp = new Date().toLocaleTimeString()

	p.log
		.success(`${chalk.dim(timestamp)} ${chalk.green('✓')} publicodes quick doc server running at:

  ${chalk.bold('Local:')}   ${chalk.cyan(localUrl)}
  ${(!host ? chalk.dim : <T>(x: T) => x)(chalk.bold('Network:'))} ${networkUrl}
`)

	if (options.open) {
		vite.openBrowser()
	}

	async function compileAndSendSituation(
		initialCompilation: boolean,
		event: EventName,
		path?: string,
	) {
		const timestamp = new Date().toLocaleTimeString()

		try {
			if (!initialCompilation) {
				p.log.info(
					`${chalk.dim(timestamp)} ${chalk.green('⚡')} ${chalk.blue('publicodes')} ${
						event === 'add' ? 'detected new file' : 'reloading'
					} ${chalk.dim(path)}`,
				)
			}

			const newSituations = await extractSituations(situationFiles)
			currentSituations = newSituations

			// Notify clients
			vite.ws.send({
				type: 'custom',
				event: 'situations-updated',
				data: newSituations,
			})
			p.log.success(
				`${chalk.dim(timestamp)} ${chalk.green('✓')} ${initialCompilation ? 'situations compiled' : 'situations reloaded'}`,
			)
		} catch (error) {
			p.log.error(
				`${chalk.dim(timestamp)} ${chalk.red('✗')} reload failed:\n${
					error instanceof Error ? error.message : String(error)
				}`,
			)
		}
	}

	function compileAndSendModel(
		initialCompilation: boolean,
		event: EventName,
		path?: string,
	) {
		const timestamp = new Date().toLocaleTimeString()
		compilationCount++

		try {
			if (!initialCompilation) {
				p.log.info(
					`${chalk.dim(timestamp)} ${chalk.green('⚡')} ${chalk.blue('publicodes')} ${
						event === 'add' ? 'detected new file' : 'recompiling'
					} ${chalk.dim(path)}`,
				)
			}
			const startTime = performance.now()
			const newRules = getModelFromSource(modelFiles, {
				logger: {
					log: p.log.info,
					error: p.log.error,
					warn: p.log.warn,
				},
			})
			const endTime = performance.now()

			currentRules = newRules

			// Notify clients
			vite.ws.send({
				type: 'custom',
				event: 'rules-updated',
				data: newRules,
			})

			// Try to compile the new rules
			new Engine(newRules as RawPublicodes<string>)

			p.log.success(
				`${chalk.dim(timestamp)} ${chalk.green('✓')} rules compiled in ${chalk.bold(
					`${Math.round(endTime - startTime)}ms`,
				)} ${chalk.dim(`#${compilationCount}`)}`,
			)
		} catch (error) {
			p.log.error(
				`${chalk.dim(timestamp)} ${chalk.red('✗')} compilation failed:\n${
					error instanceof Error ? error.message : String(error)
				}`,
			)
		}
	}

	return vite
}
