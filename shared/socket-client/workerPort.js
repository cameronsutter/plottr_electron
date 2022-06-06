const workerPort = () => {
  let port = null

  const setPort = (newPort) => {
    if (!newPort || `${Number.parseInt(`${newPort}`)}` !== `${newPort}`) {
      throw new Error(`Invalid port for socket worker: ${newPort}`)
    }
    port = newPort
  }

  const checkPort = () => {
    if (port === null) {
      throw new Error('Window not told what port the socket worker is running on.')
    }
  }

  const getPort = () => {
    checkPort()
    return port
  }

  return { setPort, getPort }
}

const { setPort, getPort } = workerPort()

export { setPort, getPort }
