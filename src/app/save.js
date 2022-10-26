export const saveFile = (whenClientIsReady) => (fullState) => {
  return whenClientIsReady(({ saveFile }) => {
    return saveFile(fullState)
  })
}

export const backupFile = (whenClientIsReady) => (fullState) => {}
