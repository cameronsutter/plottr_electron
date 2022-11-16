import { isEqual } from 'lodash'

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

function toMatchArrayLoosely(received, expected, allowedMissing = 1, allowedAdditional = 1) {
  if (!Array.isArray(expected)) {
    throw new Error(
      `toMatchArrayLoosely: expected an array as the first argument, got ${typeof expected}`
    )
  }
  if (typeof allowedMissing !== 'number' || typeof allowedAdditional !== 'number') {
    throw new Error(
      `allowedMissing and allowedAdditional must be numbers, got ${typeof allowedMissing} and ${typeof allowedAdditional}`
    )
  }

  if (!Array.isArray(received)) {
    return {
      message: () => `expected ${this.utils.printReceived(received)} to be an array`,
      pass: false,
    }
  }

  let matched = []
  for (let i = 0; i < received.length && i < expected.length; ++i) {
    if (isEqual(received[i], expected[i])) {
      matched.push(received[i])
    } else {
      break
    }
  }

  if (received.length > expected.length + allowedAdditional) {
    return {
      message: () =>
        `expected ${this.utils.printReceived(received)} to match ${this.utils.printExpected(
          expected
        )}, but it has too many additional elements ${JSON.stringify(
          received.slice(matched.length),
          null,
          2
        )}`,
      pass: false,
    }
  } else if (Math.abs(matched.length - expected.length) <= allowedMissing) {
    return {
      message: () =>
        `expected ${this.utils.printReceived(received)} to match ${this.utils.printExpected(
          expected
        )}`,
      pass: true,
    }
  } else {
    return {
      message: () =>
        `expected ${this.utils.printReceived(received)} to match ${this.utils.printExpected(
          expected
        )}, but it only had ${JSON.stringify(matched, null, 2)}`,
      pass: false,
    }
  }
}

expect.extend({
  toMatchArrayLoosely,
})

describe('Saver', () => {
  describe('save', () => {
    describe('given a dummy getState function', () => {
      describe('and a 100ms interval', () => {
        it('should attempt to save the same thing 10 times in one second', async () => {
          let stateCounter = 1
          const getState = () => {
            return {
              stateCounter: stateCounter++,
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
          expect(saveCalls).toMatchArrayLoosely(
            [
              [
                {
                  stateCounter: 1,
                },
              ],
              [
                {
                  stateCounter: 2,
                },
              ],
              [
                {
                  stateCounter: 3,
                },
              ],
              [
                {
                  stateCounter: 4,
                },
              ],
              [
                {
                  stateCounter: 5,
                },
              ],
              [
                {
                  stateCounter: 6,
                },
              ],
              [
                {
                  stateCounter: 7,
                },
              ],
              [
                {
                  stateCounter: 8,
                },
              ],
              [
                {
                  stateCounter: 9,
                },
              ],
              [
                {
                  stateCounter: 10,
                },
              ],
            ],
            1,
            1
          )
          saver.cancelAllRemainingRequests()
        })
        describe('and the get state function returns the same state as its previous call every other time', () => {
          it('should attempt to save the same thing *6* times in one second', async () => {
            let getStateCounter = 0
            let stateCounter = 1
            const getState = () => {
              getStateCounter++
              if (getStateCounter % 2 === 0) {
                return {
                  stateCounter,
                }
              }

              return {
                stateCounter: stateCounter++,
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
            expect(saveCalls).toMatchArrayLoosely(
              [
                [
                  {
                    stateCounter: 1,
                  },
                ],
                [
                  {
                    stateCounter: 2,
                  },
                ],
                [
                  {
                    stateCounter: 3,
                  },
                ],
                [
                  {
                    stateCounter: 4,
                  },
                ],
                [
                  {
                    stateCounter: 5,
                  },
                ],
                [
                  {
                    stateCounter: 6,
                  },
                ],
              ],
              1,
              1
            )
            saver.cancelAllRemainingRequests()
          })
        })
        describe('given  a saveFile function that succeeds, fails and then succeeds', () => {
          it('should show an error box once and then show a message box to indicate failure and subsequent success', async () => {
            let stateCounter = 1
            const getState = () => {
              return {
                stateCounter: stateCounter++,
              }
            }
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
            expect(saveCalls).toEqual([
              [
                {
                  stateCounter: 1,
                },
              ],
              [
                {
                  stateCounter: 2,
                },
              ],
              [
                {
                  stateCounter: 3,
                },
              ],
              [
                {
                  stateCounter: 4,
                },
              ],
            ])
            saver.cancelAllRemainingRequests()
          })
        })
      })
      describe('and a 500ms interval', () => {
        it('should attempt to save the same thing 2 times in one second', async () => {
          let stateCounter = 1
          const getState = () => {
            return {
              stateCounter: stateCounter++,
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
          expect(saveCalls).toMatchArrayLoosely(
            [
              [
                {
                  stateCounter: 1,
                },
              ],
              [
                {
                  stateCounter: 2,
                },
              ],
            ],
            1,
            1
          )
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
          expect(saveCalls).toMatchArrayLoosely(
            [
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
            ],
            1,
            1
          )
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
              expect(saveCalls).toMatchArrayLoosely(
                [
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
                ],
                1,
                1
              )
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
              expect(saveCalls).toMatchArrayLoosely(
                [
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
                ],
                1,
                1
              )
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
          expect(saveCalls).toMatchArrayLoosely(
            [
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
            ],
            1,
            1
          )
          saver.cancelAllRemainingRequests()
        })
      })
    })
  })
  describe('backup', () => {
    describe('given a dummy getState function', () => {
      describe('and a 100ms interval', () => {
        it('should attempt to backup the same thing 10 times in one second', async () => {
          let stateCounter = 1
          const getState = () => {
            return {
              stateCounter: stateCounter++,
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
          const saver = new Saver(getState, saveFile, backupFile, NOP_LOGGER, 100000, 100)
          await new Promise((resolve) => {
            setTimeout(resolve, 1100)
          })
          expect(backupCalls).toMatchArrayLoosely(
            [
              [
                {
                  stateCounter: 1,
                },
              ],
              [
                {
                  stateCounter: 2,
                },
              ],
              [
                {
                  stateCounter: 3,
                },
              ],
              [
                {
                  stateCounter: 4,
                },
              ],
              [
                {
                  stateCounter: 5,
                },
              ],
              [
                {
                  stateCounter: 6,
                },
              ],
              [
                {
                  stateCounter: 7,
                },
              ],
              [
                {
                  stateCounter: 8,
                },
              ],
              [
                {
                  stateCounter: 9,
                },
              ],
              [
                {
                  stateCounter: 10,
                },
              ],
            ],
            1,
            1
          )
          saver.cancelAllRemainingRequests()
        })
        describe('and the get state function returns the same state every other time', () => {
          it('should attempt to backup the same thing *6* times in one second', async () => {
            let getStateCounter = 0
            let stateCounter = 1
            const getState = () => {
              getStateCounter++
              if (getStateCounter % 2 === 0) {
                return {
                  stateCounter,
                }
              }

              return {
                stateCounter: stateCounter++,
              }
            }
            const backupCalls = []
            const backupFile = (...args) => {
              backupCalls.push(args)
              return Promise.resolve()
            }
            const saveFile = () => {
              return Promise.resolve()
            }
            const saver = new Saver(getState, saveFile, backupFile, NOP_LOGGER, 10000, 100)
            await new Promise((resolve) => {
              setTimeout(resolve, 1100)
            })
            expect(backupCalls).toMatchArrayLoosely(
              [
                [
                  {
                    stateCounter: 1,
                  },
                ],
                [
                  {
                    stateCounter: 2,
                  },
                ],
                [
                  {
                    stateCounter: 3,
                  },
                ],
                [
                  {
                    stateCounter: 4,
                  },
                ],
                [
                  {
                    stateCounter: 5,
                  },
                ],
                [
                  {
                    stateCounter: 6,
                  },
                ],
              ],
              1,
              1
            )
            saver.cancelAllRemainingRequests()
          })
        })
        describe('given  a saveBackup function that succeeds, fails and then succeeds', () => {
          it('should call the appropriate error and success functions', async () => {
            let stateCounter = 1
            const getState = () => {
              return {
                stateCounter: stateCounter++,
              }
            }
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
            expect(backupCalls).toMatchArrayLoosely(
              [
                [
                  {
                    stateCounter: 1,
                  },
                ],
                [
                  {
                    stateCounter: 2,
                  },
                ],
                [
                  {
                    stateCounter: 3,
                  },
                ],
                [
                  {
                    stateCounter: 4,
                  },
                ],
              ],
              1,
              1
            )
            saver.cancelAllRemainingRequests()
          })
        })
      })
      describe('and a 500ms interval', () => {
        it('should attempt to backup the same thing 2 times in one second', async () => {
          let stateCounter = 1
          const getState = () => {
            return {
              stateCounter: stateCounter++,
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
          expect(backupCalls).toMatchArrayLoosely(
            [
              [
                {
                  stateCounter: 1,
                },
              ],
              [
                {
                  stateCounter: 2,
                },
              ],
            ],
            1,
            1
          )
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
          expect(backupCalls).toMatchArrayLoosely(
            [
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
            ],
            1,
            1
          )
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
              expect(backupCalls).toMatchArrayLoosely(
                [
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
                ],
                1,
                1
              )
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
              expect(backupCalls).toMatchArrayLoosely(
                [
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
                ],
                1,
                1
              )
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
          expect(backupCalls).toMatchArrayLoosely(
            [
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
            ],
            1,
            1
          )
          saver.cancelAllRemainingRequests()
        })
      })
    })
  })
})
