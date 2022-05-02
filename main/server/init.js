import { fork } from 'child_process'
import { join } from 'path'
import log from 'electron-log'

const START_PORT = 8000
const MAX_ATTEMPTS = 10

export const startServer = () => {
  let attempts = 0

  function attemptAStart() {
    if (attempts >= MAX_ATTEMPTS) {
      return Promise.reject(`Failed to bind socket server after ${MAX_ATTEMPTS} attempts.`)
    }

    return new Promise((resolve, reject) => {
      const randomPort = START_PORT + Math.floor(1000 * Math.random())
      log.info(`Starting socket server on port: ${randomPort}`)

      const server = fork(join(__dirname, './socketServer.bundle.js'), [randomPort])
      server.on('close', (code) => {
        log.warn(`Socket server died with code: ${code}`)
        if (code === 1) {
          log.warn(`Restarting the server on a new port.`)
          attempts++
          return attemptAStart()
        }
        log.error(`Failed with an unhandled error.  Killing the server.`)
        return reject(new Error(`Socket worker died with unhandled error code: ${code}`))
      })
      server.on('message', (message) => {
        log.info(`Received "${message}" from socket worker.`)
        if (message === 'ready') {
          log.info('Started socket server!')
          resolve(randomPort)
        }
      })
    })
  }

  return attemptAStart()
}
