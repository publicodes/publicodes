import { Publicodes } from '../../src/types'

const publicodes = {
  evaluationTree: {
    c: ['a', '>', [20.0]],
    d: { d: '2024-06-15' },
    e: [],
    b: [],
    a: [[10.0], '+', ['b', '*', 'e']],
  },

  outputs: ['b', 'c', 'd', 'e'],
  types: {
    b: 'number',
    c: 'boolean',
    d: 'date',
    e: 'number',
  },
  parameters: {
    b: ['b'],
    c: ['b', 'e'],
    d: [],
    e: ['e'],
  },
} as const

export type Output = (typeof publicodes.outputs)[number]
export type Parameter = typeof publicodes.parameters
export type Types = typeof publicodes.types

export default publicodes as unknown as Publicodes<Output, Types, Parameter>
