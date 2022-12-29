import { BUSY } from '../../../shared/socket-server-message-types'
import StatusManager from '../StatusManager'

const CONSOLE_LOGGER = {
  info: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
}

describe('StatusManager', () => {
  describe('given one connection', () => {
    describe('and one task', () => {
      it('should notify that connection that work is done when the task completes', (done) => {
        const statusManager = new StatusManager(CONSOLE_LOGGER)
        const theTask = new Promise((resolve) => {
          setTimeout(resolve, 500)
        })
        let busyMessageCount = 0
        statusManager.acceptConnection({
          send: (payload) => {
            if (JSON.parse(payload).type === BUSY) {
              busyMessageCount++
              return
            }
            if (busyMessageCount !== 1) {
              throw new Error(`Received incorrect number of busy messages ${busyMessageCount}`)
            }
            done()
          },
        })
        statusManager.registerTask(theTask, 'Example task')
      })
      describe('and that task throws an error', () => {
        it('should still broadcast that it is done', (done) => {
          const statusManager = new StatusManager(CONSOLE_LOGGER)
          const theTask = new Promise((resolve, reject) => {
            reject(new Error('It failed!!'))
          })
          statusManager.acceptConnection({
            send: (payload) => {
              if (JSON.parse(payload).type === BUSY) {
                return
              }
              done()
            },
          })
          statusManager.registerTask(theTask, 'Example task').catch((error) => {
            return true
          })
        })
      })
    })
    describe('and two tasks', () => {
      describe('that overlap in time', () => {
        it('should notify that connection that work is done when both tasks complete but not in between', (done) => {
          const statusManager = new StatusManager(CONSOLE_LOGGER)
          let firstIsDone = false
          let secondIsDone = false
          const theFirstTask = new Promise((resolve) => {
            setTimeout(() => {
              firstIsDone = true
              resolve()
            }, 500)
          })
          const theSecondTask = new Promise((resolve) => {
            setTimeout(() => {
              secondIsDone = true
              resolve()
            }, 1000)
          })
          let busyMessageCount = 0
          statusManager.acceptConnection({
            send: (payload) => {
              if (JSON.parse(payload).type === BUSY) {
                busyMessageCount++
                return
              }

              if (!(firstIsDone && secondIsDone)) {
                throw new Error('Work marked as done before all work is complete')
              }
              if (busyMessageCount !== 2) {
                throw new Error('Did not receive two busy messages before work completed')
              }
              done()
            },
          })
          statusManager.registerTask(theFirstTask, 'The first task')
          statusManager.registerTask(theSecondTask, 'The second task')
        })
      })
      describe('that do not overlap in time', () => {
        it('should notify that connection that work is done when each task completes', (done) => {
          const statusManager = new StatusManager(CONSOLE_LOGGER)
          const theFirstTask = new Promise((resolve) => {
            setTimeout(resolve, 500)
          })
          const theSecondTask = new Promise((resolve) => {
            setTimeout(resolve, 1000)
          })
          let messagesSent = 0
          statusManager.acceptConnection({
            send: (payload) => {
              if (JSON.parse(payload).type === BUSY) {
                return
              }
              messagesSent++
              if (messagesSent === 2) {
                done()
              }
            },
          })
          statusManager.registerTask(theFirstTask, 'Example task')
          setTimeout(() => {
            statusManager.registerTask(theSecondTask, 'Example task')
          }, 700)
        })
      })
    })
  })
  describe('given two connections', () => {
    describe('and one task', () => {
      it('should notify both connections that work is done when the task completes', (done) => {
        const statusManager = new StatusManager(CONSOLE_LOGGER)
        const theTask = new Promise((resolve) => {
          setTimeout(resolve, 500)
        })
        let repliedToFirstConnection = false
        let repliedToSecondConnection = false
        let busyMessageCountOne = 0
        statusManager.acceptConnection({
          send: (payload) => {
            if (JSON.parse(payload).type === BUSY) {
              busyMessageCountOne++
              return
            }
            if (busyMessageCountOne !== 1) {
              throw new Error(`Received incorrect number of busy messages ${busyMessageCountOne}`)
            }
            repliedToFirstConnection = true
            if (repliedToSecondConnection) {
              done()
            }
          },
        })
        let busyMessageCountTwo = 0
        statusManager.acceptConnection({
          send: (payload) => {
            if (JSON.parse(payload).type === BUSY) {
              busyMessageCountTwo++
              return
            }
            if (busyMessageCountTwo !== 1) {
              throw new Error(`Received incorrect number of busy messages ${busyMessageCountTwo}`)
            }
            repliedToSecondConnection = true
            if (repliedToFirstConnection) {
              done()
            }
          },
        })
        statusManager.registerTask(theTask, 'Example task')
      })
    })
    describe('and two tasks', () => {
      describe('that overlap in time', () => {
        it('should notify both connections that work is done when both tasks complete but not in between', (done) => {
          const statusManager = new StatusManager(CONSOLE_LOGGER)
          let firstIsDone = false
          let secondIsDone = false
          const theFirstTask = new Promise((resolve) => {
            setTimeout(() => {
              firstIsDone = true
              resolve()
            }, 500)
          })
          const theSecondTask = new Promise((resolve) => {
            setTimeout(() => {
              secondIsDone = true
              resolve()
            }, 1000)
          })
          let repliedToFirstConnection = false
          let repliedToSecondConnection = false
          let busyMessageCountOne = 0
          statusManager.acceptConnection({
            send: (payload) => {
              if (JSON.parse(payload).type === BUSY) {
                busyMessageCountOne++
                return
              }
              if (!(firstIsDone && secondIsDone)) {
                throw new Error('Work marked as done before all work is complete')
              }
              if (busyMessageCountOne !== 2) {
                throw new Error('Did not receive two busy messages before work completed')
              }
              repliedToFirstConnection = true
              if (repliedToSecondConnection) {
                done()
              }
            },
          })
          let busyMessageCountTwo = 0
          statusManager.acceptConnection({
            send: (payload) => {
              if (JSON.parse(payload).type === BUSY) {
                busyMessageCountTwo++
                return
              }
              if (busyMessageCountTwo !== 2) {
                throw new Error(`Received incorrect number of busy messages ${busyMessageCountTwo}`)
              }
              if (!(firstIsDone && secondIsDone)) {
                throw new Error('Work marked as done before all work is complete')
              }
              repliedToSecondConnection = true
              if (repliedToFirstConnection) {
                done()
              }
            },
          })
          statusManager.registerTask(theFirstTask, 'The first task')
          statusManager.registerTask(theSecondTask, 'The second task')
        })
      })
      describe('that do not overlap in time', () => {
        it('should notify both connections that work is done when each task completes', (done) => {
          const statusManager = new StatusManager(CONSOLE_LOGGER)
          const theFirstTask = new Promise((resolve) => {
            setTimeout(resolve, 500)
          })
          const theSecondTask = new Promise((resolve) => {
            setTimeout(resolve, 1000)
          })
          let repliedToFirstConnection = 0
          let repliedToSecondConnection = 0
          statusManager.acceptConnection({
            send: (payload) => {
              if (JSON.parse(payload).type === BUSY) {
                return
              }
              repliedToFirstConnection++
              if (repliedToFirstConnection === 2 && repliedToSecondConnection === 2) {
                done()
              }
            },
          })
          statusManager.acceptConnection({
            send: (payload) => {
              if (JSON.parse(payload).type === BUSY) {
                return
              }
              repliedToSecondConnection++
              if (repliedToFirstConnection === 2 && repliedToSecondConnection === 2) {
                done()
              }
            },
          })
          statusManager.registerTask(theFirstTask, 'Example task')
          setTimeout(() => {
            statusManager.registerTask(theSecondTask, 'Example task')
          }, 700)
        })
      })
    })
    describe('where one connection errors out all the time', () => {
      it('should stop sending messages to the bad connection', () => {
        const statusManager = new StatusManager(CONSOLE_LOGGER)
        const theFirstTask = new Promise((resolve) => {
          setTimeout(resolve, 500)
        })
        const theSecondTask = new Promise((resolve) => {
          setTimeout(resolve, 500)
        })
        let repliedToFirstConnection = 0
        let repliedToSecondConnection = 0
        return new Promise((resolve, reject) => {
          statusManager.acceptConnection({
            send: (payload) => {
              if (JSON.parse(payload).type === BUSY) {
                return
              }
              repliedToFirstConnection++
              if (repliedToFirstConnection === 2 && repliedToSecondConnection === 1) {
                resolve()
              }
            },
          })
          statusManager.acceptConnection({
            send: (payload) => {
              if (JSON.parse(payload).type === BUSY) {
                return
              }
              repliedToSecondConnection++
              if (repliedToSecondConnection >= 2) {
                reject(
                  new Error(
                    'Replied to bad connection twice.  It should have been removed after the first error'
                  )
                )
              }
              throw new Error('Bad connection')
            },
          })
          statusManager.registerTask(theFirstTask, 'Example task')
          setTimeout(() => {
            statusManager.registerTask(theSecondTask, 'Example task')
          }, 600)
        })
      })
    })
  })
})
