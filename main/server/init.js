import { fork } from 'child_process'
import { join } from 'path'

const START_PORT = 8000
const MAX_ATTEMPTS = 10

export const startServer = (log, broadcastPortChange, userDataPath, onFatalError) => {
  let attempts = 0

  function attemptAStart(resolve, reject) {
    if (attempts >= MAX_ATTEMPTS) {
      log.error(`Failed to bind socket server after ${MAX_ATTEMPTS} attempts.`)
      reject(new Error(`Failed to bind socket server after ${MAX_ATTEMPTS} attempts.`))
      onFatalError(`Failed to bind socket server after ${MAX_ATTEMPTS} attempts.`)
      return
    }

    const randomPort = START_PORT + Math.floor(1000 * Math.random())
    log.info(`Starting socket server on port: ${randomPort}`)

    const server = fork(join(__dirname, './socketServer.bundle.js'), [randomPort, userDataPath])
    server.on('close', (code) => {
      log.warn(`Socket server died with code: ${code}`)
      if (code === 1) {
        log.warn(`Restarting the server on a new port.`)
        attempts++
        attemptAStart(resolve, reject)
        return
      }
      log.error(`Failed with an unhandled error.  Killing the server.`)
      reject(new Error(`Socket worker died with unhandled error code: ${code}`))
      onFatalError(`Socket worker died with unhandled error code: ${code}`)
      return
    })
    server.on('message', (message) => {
      if (message === 'ready') {
        log.info(`Received "${message}" from socket worker.`)
        log.info('Started socket server!')
        resolve(randomPort)
        broadcastPortChange(randomPort)
      } else {
        log.info(message)
      }
    })
  }

  return new Promise((resolve, reject) => {
    attemptAStart(resolve, reject)
  })
}
