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
    describe('and a 500ms interval', () => {
      it('should attempt to save the same thing 2 times in one second', async () => {
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
        new Saver(getState, saveFile, backupFile, 500)
        await new Promise((resolve) => {
          setTimeout(resolve, 1050)
        })
        expect(saveCalls).toEqual([[dummyState], [dummyState]])
      })
    })
  })
  describe('given a getState function that produces a sequence of values', () => {
    describe('and a 100ms interval', () => {
      it('should attempt to save ten different items in the right order', async () => {
        let counter = 0
        const getState = () => {
          counter++
          return {
            counter,
          }
        }
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
          [
            {
              counter: 1,
            },
          ],
          [
            {
              counter: 2,
            },
          ],
          [
            {
              counter: 3,
            },
          ],
          [
            {
              counter: 4,
            },
          ],
          [
            {
              counter: 5,
            },
          ],
          [
            {
              counter: 6,
            },
          ],
          [
            {
              counter: 7,
            },
          ],
          [
            {
              counter: 8,
            },
          ],
          [
            {
              counter: 9,
            },
          ],
          [
            {
              counter: 10,
            },
          ],
        ])
      })
    })
    describe('and a 500ms interval', () => {
      it('should attempt to save values in the correct order 2 times in one second', async () => {
        let counter = 0
        const getState = () => {
          counter++
          return {
            counter,
          }
        }
        const saveCalls = []
        const saveFile = (...args) => {
          saveCalls.push(args)
          return Promise.resolve()
        }
        const backupFile = () => {
          return Promise.resolve()
        }
        new Saver(getState, saveFile, backupFile, 500)
        await new Promise((resolve) => {
          setTimeout(resolve, 1050)
        })
        expect(saveCalls).toEqual([
          [
            {
              counter: 1,
            },
          ],
          [
            {
              counter: 2,
            },
          ],
        ])
      })
    })
  })
})
