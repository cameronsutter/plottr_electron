const Store = require('electron-store')
const { reloadRecents } = require('./windows/dashboard')
const knownFilesPath = process.env.NODE_ENV == 'development' ? 'known_files_dev' : 'known_files'

const knownFilesStore = new Store({name: knownFilesPath})

function addToKnown (filePath) {
  const files = knownFilesStore.store
  const alreadyExists = Object.entries(files).some(entry => entry[1].path == filePath)
  if (alreadyExists) {
    const fileEntry = Object.entries(files).find(entry => entry[1].path == filePath)
    knownFilesStore.set(`${fileEntry[0]}.lastOpened`, Date.now())
  } else {
    let nextKey = Math.max(...Object.keys(files).map(Number)) + 1
    knownFilesStore.set(`${nextKey}`, {
      path: filePath,
      lastOpened: Date.now(),
    })
  }
  reloadRecents()
}

module.exports = { knownFilesStore, addToKnown }
