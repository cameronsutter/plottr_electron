const makeFileModule = (whenClientIsReady) => {
  const saveFile = (filePath, jsonData) => {
    return whenClientIsReady(({ saveFile }) => {
      return saveFile(filePath, jsonData)
    })
  }

  return { saveFile }
}

export { makeFileModule }
