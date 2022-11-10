export const makeMainProcessClient = () => {
  const setWindowTitle = (newTitle) => {
    return Promise.resolve()
  }
  const setRepresentedFileName = (newFileName) => {
    return Promise.resolve()
  }
  const getVersion = () => {
    return Promise.resolve()
  }
  const showErrorBox = (title, message) => {
    return Promise.resolve()
  }

  const windowId = () => {
    return Promise.resolve()
  }

  const showMessageBox = (title, message, type, detail) => {
    return Promise.resolve()
  }

  const showSaveDialog = (filters, title, defaultPath) => {
    return Promise.resolve()
  }

  const setFileURL = (newFileURL) => {
    return Promise.resolve()
  }

  const userDataPath = () => {
    return Promise.resolve()
  }

  const userDocumentsPath = () => {
    return Promise.resolve()
  }

  return {
    setWindowTitle,
    setRepresentedFileName,
    getVersion,
    showErrorBox,
    windowId,
    showMessageBox,
    showSaveDialog,
    setFileURL,
    userDataPath,
    userDocumentsPath,
  }
}
