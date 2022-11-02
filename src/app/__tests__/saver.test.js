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
          const saver = new Saver(getState, saveFile, backupFile, NOP_LOGGER, 100)
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
          saver.cancelAllRemainingRequests()
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
            let calledShowErrorBox = 0
            const showErrorBox = () => {
              calledShowErrorBox++
            }
            let calledShowMessageBox = 0
            const showMessageBox = () => {
              calledShowMessageBox++
            }
            const saver = new Saver(
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
            expect(calledShowErrorBox).toBe(0)
            expect(calledShowMessageBox).toBe(0)
            await new Promise((resolve) => {
              setTimeout(resolve, 110)
            })
            expect(calledShowErrorBox).toBe(0)
            expect(calledShowMessageBox).toBe(0)
            await new Promise((resolve) => {
              setTimeout(resolve, 110)
            })
            expect(calledShowErrorBox).toBe(1)
            expect(calledShowMessageBox).toBe(0)
            await new Promise((resolve) => {
              setTimeout(resolve, 110)
            })
            expect(calledShowErrorBox).toBe(1)
            expect(calledShowMessageBox).toBe(1)
            await new Promise((resolve) => {
              setTimeout(resolve, 110)
            })
            expect(calledShowErrorBox).toBe(1)
            expect(calledShowMessageBox).toBe(1)
            expect(saveCalls).toEqual([[dummyState], [dummyState], [dummyState], [dummyState]])
            saver.cancelAllRemainingRequests()
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
          const saver = new Saver(getState, saveFile, backupFile, NOP_LOGGER, 500)
          await new Promise((resolve) => {
            setTimeout(resolve, 1100)
          })
          expect(saveCalls).toEqual([[dummyState], [dummyState]])
          saver.cancelAllRemainingRequests()
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
          const saver = new Saver(getState, saveFile, backupFile, NOP_LOGGER, 100)
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
          saver.cancelAllRemainingRequests()
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
          const saver = new Saver(getState, saveFile, backupFile, NOP_LOGGER, 500)
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
          saver.cancelAllRemainingRequests()
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
          const saver = new Saver(getState, saveFile, backupFile, NOP_LOGGER, 100000, 100)
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
          saver.cancelAllRemainingRequests()
        })
        describe('given  a saveBackup function that succeeds, fails and then succeeds', () => {
          it('should call the appropriate error and success functions', async () => {
            const dummyState = {}
            const getState = () => dummyState
            const backupCalls = []
            const backupFile = (...args) => {
              backupCalls.push(args)
              if (backupCalls.length === 1) {
                return Promise.resolve()
              } else if (backupCalls.length === 2) {
                return Promise.reject(new Error('boom!'))
              } else {
                return Promise.resolve()
              }
            }
            const saveFile = () => {
              return Promise.resolve()
            }
            let loggedErrors = 0
            let loggedWarnings = 0
            let loggedInfos = 0
            const countingLogger = {
              info: (...args) => {
                loggedInfos++
              },
              warn: (...args) => {
                loggedWarnings++
              },
              error: (...args) => {
                loggedErrors++
              },
            }
            const saver = new Saver(getState, saveFile, backupFile, countingLogger, 10000, 100)
            expect(loggedInfos).toBeGreaterThan(0)
            expect(loggedWarnings).toBe(0)
            expect(loggedErrors).toBe(0)
            await new Promise((resolve) => {
              setTimeout(resolve, 110)
            })
            expect(loggedInfos).toBeGreaterThan(0)
            expect(loggedWarnings).toBe(0)
            expect(loggedErrors).toBe(0)
            await new Promise((resolve) => {
              setTimeout(resolve, 110)
            })
            expect(loggedInfos).toBeGreaterThan(0)
            expect(loggedWarnings).toBe(1)
            expect(loggedErrors).toBe(0)
            await new Promise((resolve) => {
              setTimeout(resolve, 110)
            })
            expect(loggedInfos).toBeGreaterThan(0)
            expect(loggedWarnings).toBe(1)
            expect(loggedErrors).toBe(0)
            await new Promise((resolve) => {
              setTimeout(resolve, 110)
            })
            expect(loggedInfos).toBeGreaterThan(0)
            expect(loggedWarnings).toBe(1)
            expect(loggedErrors).toBe(0)
            expect(backupCalls).toEqual([[dummyState], [dummyState], [dummyState], [dummyState]])
            saver.cancelAllRemainingRequests()
          })
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
          const saver = new Saver(getState, saveFile, backupFile, NOP_LOGGER, 10000, 500)
          await new Promise((resolve) => {
            setTimeout(resolve, 1100)
          })
          expect(backupCalls).toEqual([[dummyState], [dummyState]])
          saver.cancelAllRemainingRequests()
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
          const saver = new Saver(getState, saveFile, backupFile, NOP_LOGGER, 10000, 100)
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
          saver.cancelAllRemainingRequests()
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
          const saver = new Saver(getState, saveFile, backupFile, NOP_LOGGER, 10000, 500)
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
          saver.cancelAllRemainingRequests()
        })
      })
    })
  })
})
