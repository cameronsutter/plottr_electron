import log from 'electron-log'

const START_PORT = 5000

export const startServer = () => {
  const randomPort = START_PORT + Math.floor(1000 * Math.random())
  log.info(`Starting socket server on port: ${randomPort}`)
}
