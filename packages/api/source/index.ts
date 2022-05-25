import path from 'path'
import openapiJson from './openapi.json' assert { type: 'json' }

export { koaMiddleware } from './middleware/index.js'

export const openapiPath = path.resolve(__dirname, `openapi.json`)
export const openapi = openapiJson
