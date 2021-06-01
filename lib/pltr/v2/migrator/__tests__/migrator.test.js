import Migrator from '../migrator'

import { state_2021_2_8, state_2021_6_9 } from '../migrations/__tests__/fixtures'

describe('migrator', () => {
  describe('given a v2021.2.8 file', () => {
    describe('without an `initialVersion` or `appliedMigrations`', () => {
      it('should add `initialVersion` of 2021.2.8', async () => {
        const migrator = new Migrator(state_2021_2_8, 'test', '2021.2.8', '2021.6.9')
        const data = await new Promise((resolve) =>
          migrator.migrate((err, result) => {
            resolve(result)
          })
        )
        expect(data.file.initialVersion).toEqual('2021.2.8')
      })
      it('should add `appliedMigrations` of [m2021_4_13, m2021_6_9]', async () => {
        const migrator = new Migrator(state_2021_2_8, 'test', '2021.2.8', '2021.6.9')
        const data = await new Promise((resolve) =>
          migrator.migrate((err, result) => {
            resolve(result)
          })
        )
        expect(data.file.appliedMigrations).toEqual(['m2021_4_13', 'm2021_6_9'])
      })
    })
    describe('with an `initialVersion` of 2021.6.9', () => {
      it('should not apply any more migrations', async () => {
        const migrator = new Migrator(
          {
            ...state_2021_2_8,
            file: {
              ...state_2021_2_8.file,
              initialVersion: '2021.6.9',
              appliedMigrations: [],
            },
          },
          'test',
          '2021.2.8',
          '2021.6.9'
        )
        const data = await new Promise((resolve) =>
          migrator.migrate((err, result) => {
            resolve(result)
          })
        )
        expect(data.file.appliedMigrations).toEqual([])
      })
    })
    describe('with an `initialVersion` of 2021.4.13', () => {
      it('should apply 2021.6.9', async () => {
        const migrator = new Migrator(
          {
            ...state_2021_2_8,
            file: {
              ...state_2021_2_8.file,
              initialVersion: '2021.4.13',
              appliedMigrations: [],
            },
          },
          'test',
          '2021.2.8',
          '2021.6.9'
        )
        const data = await new Promise((resolve) =>
          migrator.migrate((err, result) => {
            resolve(result)
          })
        )
        expect(data.file.appliedMigrations).toEqual(['m2021_6_9'])
      })
    })
    describe('with an `initialVersion` of 2021.2.8', () => {
      describe('and the 2021.6.9 migration applied, but not the 2021.4.13', () => {
        it('should throw an error', async () => {
          const migrator = new Migrator(
            {
              ...state_2021_2_8,
              file: {
                ...state_2021_2_8.file,
                initialVersion: '2021.2.8',
                appliedMigrations: ['m2021_6_9'],
              },
            },
            'test',
            '2021.2.8',
            '2021.6.9'
          )
          let success = false
          try {
            await new Promise((resolve) =>
              migrator.migrate((err, result) => {
                resolve(result)
              })
            )
          } catch (e) {
            success = true
          }
          expect(success).toEqual(true)
        })
      })
    })
  })
})
