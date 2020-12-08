const Store = require('electron-store')
const knownFilesPath = process.env.NODE_ENV == 'development' ? 'known_files_dev' : 'known_files'

const knownFilesStore = new Store({name: knownFilesPath})

function addToKnown (filePath) {
  const files = knownFilesStore.store
  const alreadyExists = Object.entries(files).some(entry => entry[1].path == filePath)
  if (alreadyExists) {
    const fileId = Object.entries(files).find(entry => entry[1].path == filePath)
    knownFilesStore.set(`${fileId}.lastOpened`, Date.now())
  } else {
    let nextKey = Math.max(...Object.keys(files).map(Number)) + 1
    knownFilesStore.set(`${nextKey}`, {
      path: filePath,
      lastOpened: Date.now(),
    })
  }
}

module.exports = { knownFilesStore, addToKnown }
