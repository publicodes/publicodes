import { dirname } from 'path'
import { fileURLToPath } from 'url'
export { koaMiddleware } from './middleware/index.js'

// @ts-ignore
export { default as openapi } from './openapi.json'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const openapiPath = `${__dirname}/openapi.json`
