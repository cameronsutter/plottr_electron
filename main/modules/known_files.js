const path = require('path')
const Store = require('electron-store')
const { reloadRecents } = require('./dashboard')
const knownFilesPath = process.env.NODE_ENV == 'development' ? 'known_files_dev' : 'known_files'

const knownFilesStore = new Store({ name: knownFilesPath })

// The difference between `addtoKnown` and `addToKnownFiles` seems to
// be that `addToKnownFiles` does some fixing to broken stores and
// `addToKnown` sets the last opened date.
function addToKnown(filePath) {
  const files = knownFilesStore.store
  const alreadyExists = Object.entries(files).some(
    (entry) => path.normalize(entry[1].path) == path.normalize(filePath)
  )
  if (alreadyExists) {
    const fileEntry = Object.entries(files).find(
      (entry) => path.normalize(entry[1].path) == path.normalize(filePath)
    )
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

function addToKnownFiles(filePath) {
  const existingId = Object.keys(knownFilesStore.store).find(
    (id) => path.normalize(knownFilesStore.store[id].path) == path.normalize(filePath)
  )
  if (existingId) {
    return existingId
  } else {
    // for some reason, .size doesn't work in prod here (but it does in temp_files.js)
    // in prod, it doesn't update in time
    let newId = Math.max(...Object.keys(knownFilesStore.store).map(Number)) + 1
    // FIX UP: some people's known_files got into a bad state and this fixes that
    if (knownFilesStore.has('-Infinity')) {
      let badData = knownFilesStore.get('-Infinity')
      knownFilesStore.set('1', badData)
    }
    // and this prevents it
    if (newId < 1 || !Object.keys(knownFilesStore.store).length) {
      newId = 1
    }
    knownFilesStore.set(`${newId}`, {
      path: filePath,
      lastOpened: Date.now(),
    })
    return newId
  }
}

module.exports = { knownFilesStore, addToKnown, addToKnownFiles, addToKnownFiles }
