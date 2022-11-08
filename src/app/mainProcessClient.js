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

  return {
    setWindowTitle,
    setRepresentedFileName,
    getVersion,
    showErrorBox,
  }
}
