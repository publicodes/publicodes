import { dirname } from 'path'
import { fileURLToPath } from 'url'
export { koaMiddleware } from './middleware/index.js'

// @ts-ignore
import type { default as openapiType } from './openapi.json'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const openapiPath = `${__dirname}/openapi.json`

export const openapi = async () =>
	(await import(openapiPath)).default as typeof openapiType
