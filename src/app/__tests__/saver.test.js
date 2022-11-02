import Saver, { DUMMY_ROLLBAR } from '../saver'

const CONSOLE_LOGGER = {
  info: (...args) => console.log(args),
  warn: (...args) => console.warn(args),
  error: (...args) => console.error(args),
}

const NOP_LOGGER = {
  info: (...args) => {},
  warn: (...args) => {},
  error: (...args) => {},
}

describe('Saver', () => {
  describe('save', () => {
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
          new Saver(getState, saveFile, backupFile, NOP_LOGGER, 100)
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
        describe('given  a saveFile function that succeeds, fails and then succeeds', () => {
          it('should show an error box once and then show a message box to indicate failure and subsequent success', async () => {
            const dummyState = {}
            const getState = () => dummyState
            const saveCalls = []
            const saveFile = (...args) => {
              saveCalls.push(args)
              if (saveCalls.length === 1) {
                return Promise.resolve()
              } else if (saveCalls.length === 2) {
                return Promise.reject(new Error('boom!'))
              } else {
                return Promise.resolve()
              }
            }
            const backupFile = () => {
              return Promise.resolve()
            }
            let calledShowErrorBox = false
            const showErrorBox = () => {
              calledShowErrorBox = true
            }
            let calledShowMessageBox = false
            const showMessageBox = () => {
              calledShowMessageBox = true
            }
            new Saver(
              getState,
              saveFile,
              backupFile,
              NOP_LOGGER,
              100,
              10000,
              DUMMY_ROLLBAR,
              showMessageBox,
              showErrorBox
            )
            expect(calledShowErrorBox).toBeFalsy()
            expect(calledShowMessageBox).toBeFalsy()
            await new Promise((resolve) => {
              setTimeout(resolve, 110)
            })
            expect(calledShowErrorBox).toBeFalsy()
            expect(calledShowMessageBox).toBeFalsy()
            await new Promise((resolve) => {
              setTimeout(resolve, 110)
            })
            expect(calledShowErrorBox).toBeTruthy()
            expect(calledShowMessageBox).toBeFalsy()
            await new Promise((resolve) => {
              setTimeout(resolve, 110)
            })
            expect(calledShowErrorBox).toBeTruthy()
            expect(calledShowMessageBox).toBeTruthy()
            expect(saveCalls).toEqual([[dummyState], [dummyState], [dummyState]])
          })
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
          new Saver(getState, saveFile, backupFile, NOP_LOGGER, 500)
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
          new Saver(getState, saveFile, backupFile, NOP_LOGGER, 100)
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
              const saver = new Saver(getState, saveFile, backupFile, NOP_LOGGER, 100)
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
              const saver = new Saver(getState, saveFile, backupFile, NOP_LOGGER, 100)
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
          new Saver(getState, saveFile, backupFile, NOP_LOGGER, 500)
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
  describe('backup', () => {
    describe('given a getState function that produces the same value', () => {
      describe('and a 100ms interval', () => {
        it('should attempt to backup the same thing 10 times in one second', async () => {
          const dummyState = {}
          const getState = () => dummyState
          const backupCalls = []
          const saveFile = () => {
            return Promise.resolve()
          }
          const backupFile = (...args) => {
            backupCalls.push(args)
            return Promise.resolve()
          }
          new Saver(getState, saveFile, backupFile, NOP_LOGGER, 100000, 100)
          await new Promise((resolve) => {
            setTimeout(resolve, 1100)
          })
          expect(backupCalls).toEqual([
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
        it('should attempt to backup the same thing 2 times in one second', async () => {
          const dummyState = {}
          const getState = () => dummyState
          const backupCalls = []
          const saveFile = () => {
            return Promise.resolve()
          }
          const backupFile = (...args) => {
            backupCalls.push(args)
            return Promise.resolve()
          }
          new Saver(getState, saveFile, backupFile, NOP_LOGGER, 10000, 500)
          await new Promise((resolve) => {
            setTimeout(resolve, 1100)
          })
          expect(backupCalls).toEqual([[dummyState], [dummyState]])
        })
      })
    })
    describe('given a getState function that produces a sequence of values', () => {
      describe('and a 100ms interval', () => {
        it('should attempt to backup ten different items in the right order', async () => {
          let counter = 0
          const getState = () => {
            counter++
            return {
              counter,
            }
          }
          const backupCalls = []
          const saveFile = () => {
            return Promise.resolve()
          }
          const backupFile = (...args) => {
            backupCalls.push(args)
            return Promise.resolve()
          }
          new Saver(getState, saveFile, backupFile, NOP_LOGGER, 10000, 100)
          await new Promise((resolve) => {
            setTimeout(resolve, 1100)
          })
          expect(backupCalls).toEqual([
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
        describe('and a backup function that takes 200ms to complete', () => {
          describe('and we cancel saving after 1 second', () => {
            it('should only backup 5 times in 1 second (because it waits for prior instances to complete)', async () => {
              let counter = 0
              const getState = () => {
                counter++
                return {
                  counter,
                }
              }
              const backupCalls = []
              const saveFile = () => {
                return Promise.resolve()
              }
              const backupFile = (...args) => {
                backupCalls.push(args)
                return new Promise((resolve) => {
                  setTimeout(resolve, 200)
                })
              }
              const saver = new Saver(getState, saveFile, backupFile, NOP_LOGGER, 10000, 100)
              await new Promise((resolve) => {
                setTimeout(resolve, 1050)
              })
              saver.cancelAllRemainingRequests()
              expect(backupCalls).toEqual([
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
            it('should not backup after cancel is called', async () => {
              let counter = 0
              const getState = () => {
                counter++
                return {
                  counter,
                }
              }
              const backupCalls = []
              const saveFile = () => {
                return Promise.resolve()
              }
              const backupFile = (...args) => {
                backupCalls.push(args)
                return new Promise((resolve) => {
                  setTimeout(resolve, 200)
                })
              }
              const saver = new Saver(getState, saveFile, backupFile, NOP_LOGGER, 10000, 100)
              await new Promise((resolve) => {
                setTimeout(resolve, 1050)
              })
              saver.cancelAllRemainingRequests()
              await new Promise((resolve) => {
                setTimeout(resolve, 1050)
              })
              expect(backupCalls).toEqual([
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
        it('should attempt to backup values in the correct order 2 times in one second', async () => {
          let counter = 0
          const getState = () => {
            counter++
            return {
              counter,
            }
          }
          const backupCalls = []
          const saveFile = () => {
            return Promise.resolve()
          }
          const backupFile = (...args) => {
            backupCalls.push(args)
            return Promise.resolve()
          }
          new Saver(getState, saveFile, backupFile, NOP_LOGGER, 10000, 500)
          await new Promise((resolve) => {
            setTimeout(resolve, 1100)
          })
          expect(backupCalls).toEqual([
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
})
