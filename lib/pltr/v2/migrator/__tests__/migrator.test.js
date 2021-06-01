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
  })
})
