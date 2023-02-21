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

    const serverScriptPath =
      process.env.NODE_ENV === 'test'
        ? join(__dirname, '..', '..', 'bin', 'socketServer.bundle.js')
        : join(__dirname, 'socketServer.bundle.js')
    const server = fork(serverScriptPath, [randomPort, userDataPath])
    let weInstructedServerToDie = false
    server.on('close', (code) => {
      if (weInstructedServerToDie) {
        return
      }
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
        const killServer = () => {
          weInstructedServerToDie = true
          if (server.kill()) {
            return Promise.resolve()
          }
          return Promise.reject('Failed to kill the socket server')
        }
        resolve({ port: randomPort, killServer })
        broadcastPortChange(randomPort)
      } else if (message === 'shutdown') {
        log.info(`Received "${message}" from socket worker.`)
        log.info('SHUTTING DOWN SOCKET SERVER!')
        weInstructedServerToDie = true
        server.kill()
      } else {
        log.info(message)
      }
    })
  }

  return new Promise((resolve, reject) => {
    attemptAStart(resolve, reject)
  })
}
