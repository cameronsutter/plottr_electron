const Store = require('electron-store')
const knownFilesPath = process.env.NODE_ENV == 'development' ? 'known_files_dev' : 'known_files'

const knownFilesStore = new Store({name: knownFilesPath})

function addToKnown (filePath) {
  console.log('adding', filePath)
  const files = knownFilesStore.store
  const alreadyExists = Object.entries(files).some(entry => entry[1].path == filePath)
  console.log('alreadyExists', alreadyExists)
  if (!alreadyExists) {
    let nextKey = Math.max(Object.keys(files).map(Number)) + 1
    console.log('nextKey', nextKey)
    knownFilesStore.set(`${nextKey}`, {
      path: filePath,
      lastOpened: Date.now(),
    })
  }
}

module.exports = { knownFilesStore, addToKnown }
