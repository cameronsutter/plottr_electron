import { whenClientIsReady } from '../../shared/socket-client'

const lastOpenedFile = () => {
  return whenClientIsReady(({ lastOpenedFile }) => {
    return lastOpenedFile()
  })
}

const setLastOpenedFilePath = (filePath) => {
  return whenClientIsReady(({ setLastOpenedFilePath }) => {
    return setLastOpenedFilePath(filePath)
  })
}

export { lastOpenedFile, setLastOpenedFilePath }
