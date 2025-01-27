import { Situation } from 'publicodes'
import { RuleName } from '../../src'
import {
  migrateSituation,
  Migration,
} from '../../src/migration/migrateSituation'

const instructions: Migration = {
  keysToMigrate: { age: 'âge', 'année de naissance': '' },
  valuesToMigrate: { prénom: { jean: 'Jean avec un J', michel: '' } },
}

const migrateSituationWithInstructions = (situation: Situation<RuleName>) =>
  migrateSituation(situation, instructions)

describe('migrateSituation', () => {
  it('should migrate key', () => {
    expect(migrateSituationWithInstructions({ age: 27 })).toEqual({ âge: 27 })
  })

  it('should migrate value', () => {
    expect(migrateSituationWithInstructions({ prénom: 'jean' })).toEqual({
      prénom: "'Jean avec un J'",
    })
  })

  it('should delete key', () => {
    expect(
      migrateSituationWithInstructions({ 'année de naissance': 1997 }),
    ).toEqual({})
  })

  it('should delete value', () => {
    expect(
      migrateSituationWithInstructions({
        prénom: 'michel',
      }),
    ).toEqual({})
  })

  it('should support old situations (1)', () => {
    expect(
      migrateSituationWithInstructions({
        âge: { valeur: 27, unité: 'an' },
      }),
    ).toEqual({
      âge: 27,
    })
  })

  it('should support old situations (2)', () => {
    expect(
      migrateSituationWithInstructions({
        âge: {
          type: 'number',
          fullPrecision: true,
          isNullable: false,
          nodeValue: 27,
          nodeKind: 'constant',
          rawNode: 27,
        },
      }),
    ).toEqual({
      âge: 27,
    })
  })

  it('should migrate the API example', () => {
    const oldSituation = {
      age: 25,
      job: 'developer',
      city: 'Paris',
    }

    const instructions = {
      keysToMigrate: {
        age: 'âge',
        city: '',
      },
      valuesToMigrate: {
        job: {
          developer: 'développeur',
        },
      },
    }
    expect(migrateSituation(oldSituation, instructions)).toEqual({
      âge: 25,
      job: "'développeur'",
    })
  })

  it('should not modify the original situation', () => {
    const situation = {
      job: 'developer',
      âge: {
        type: 'number',
        fullPrecision: true,
        isNullable: false,
        nodeValue: 27,
        nodeKind: 'constant',
        rawNode: 27,
      },
    }

    migrateSituation(situation, instructions)
    expect(situation).toEqual({
      âge: {
        type: 'number',
        fullPrecision: true,
        isNullable: false,
        nodeValue: 27,
        nodeKind: 'constant',
        rawNode: 27,
      },
      job: 'developer',
    })
  })
})
