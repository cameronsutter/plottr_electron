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
})
