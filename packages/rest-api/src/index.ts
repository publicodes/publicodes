import path from 'path'
import openapiJson from './openapi.codegen.json' with { type: 'json' }

export { koaMiddleware } from './middleware/index.js'

export const openapiPath = path.resolve(__dirname, `openapi.codegen.json`)
export const openapi = openapiJson
