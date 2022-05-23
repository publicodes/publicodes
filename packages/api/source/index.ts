import path from 'path'
import type { default as openapiType } from './openapi.json'

export { koaMiddleware } from './middleware/index.js'

export const openapiPath = path.resolve(__dirname, `openapi.json`)

export const openapi = { ...require('./openapi.json') } as typeof openapiType
