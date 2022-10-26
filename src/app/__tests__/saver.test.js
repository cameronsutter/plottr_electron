import Saver from '../saver'

describe('Saver', () => {
  describe('given a getState function that produces the same value', () => {
    describe('and a 100ms interval', () => {
      it('should attempt to save the same thing 10 times in one second', async () => {
        const dummyState = {}
        const getState = () => dummyState
        const saveCalls = []
        const saveFile = (...args) => {
          saveCalls.push(args)
          return Promise.resolve()
        }
        const backupFile = () => {
          return Promise.resolve()
        }
        new Saver(getState, saveFile, backupFile, 100)
        await new Promise((resolve) => {
          setTimeout(resolve, 1050)
        })
        expect(saveCalls).toEqual([
          [dummyState],
          [dummyState],
          [dummyState],
          [dummyState],
          [dummyState],
          [dummyState],
          [dummyState],
          [dummyState],
          [dummyState],
          [dummyState],
        ])
      })
    })
  })
})
