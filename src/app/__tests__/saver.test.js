import Saver from '../saver'

const CONSOLE_LOGGER = {
  info: (...args) => console.log(args),
  warn: (...args) => console.warn(args),
  error: (...args) => console.error(args),
}

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
        new Saver(getState, saveFile, backupFile, CONSOLE_LOGGER, 100)
        await new Promise((resolve) => {
          setTimeout(resolve, 1100)
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
        new Saver(getState, saveFile, backupFile, CONSOLE_LOGGER, 500)
        await new Promise((resolve) => {
          setTimeout(resolve, 1100)
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
        new Saver(getState, saveFile, backupFile, CONSOLE_LOGGER, 100)
        await new Promise((resolve) => {
          setTimeout(resolve, 1100)
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
      describe('and a save function that takes 200ms to complete', () => {
        describe('and we cancel saving after 1 second', () => {
          it('should only save 5 times in 1 second (because it waits for prior instances to complete)', async () => {
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
              return new Promise((resolve) => {
                setTimeout(resolve, 200)
              })
            }
            const backupFile = () => {
              return Promise.resolve()
            }
            const saver = new Saver(getState, saveFile, backupFile, CONSOLE_LOGGER, 100)
            await new Promise((resolve) => {
              setTimeout(resolve, 1050)
            })
            saver.cancelAllRemainingRequests()
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
            ])
          })
          it('should not save after cancel is called', async () => {
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
              return new Promise((resolve) => {
                setTimeout(resolve, 200)
              })
            }
            const backupFile = () => {
              return Promise.resolve()
            }
            const saver = new Saver(getState, saveFile, backupFile, CONSOLE_LOGGER, 100)
            await new Promise((resolve) => {
              setTimeout(resolve, 1050)
            })
            saver.cancelAllRemainingRequests()
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
            ])
          })
        })
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
        new Saver(getState, saveFile, backupFile, CONSOLE_LOGGER, 500)
        await new Promise((resolve) => {
          setTimeout(resolve, 1100)
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
