import { app } from 'electron'
import path from 'path'
import log from 'electron-log'

import Store from '../lib/store'
import { reloadRecents } from './dashboard'
import { OFFLINE_FILE_FILES_PATH } from './offlineFilePath'
const knownFilesPath = process.env.NODE_ENV == 'development' ? 'known_files_dev' : 'known_files'

const knownFilesStore = new Store(app.getPath('userData'), log, {
  name: knownFilesPath,
  watch: true,
})

function getKnownFilesInfo() {
  return knownFilesStore.get()
}

// The difference between `addtoKnown` and `addToKnownFiles` seems to
// be that `addToKnownFiles` does some fixing to broken stores and
// `addToKnown` sets the last opened date.
function addToKnown(filePath) {
  // We also don't want to track recent files that don't have a path.
  if (!filePath || filePath === '') return

  // We don't want to track recent files when they're offline files.
  if (filePath.startsWith(OFFLINE_FILE_FILES_PATH)) return

  const files = knownFilesStore.store
  const matches = Object.values(files)
    .filter(({ path }) => path)
    .filter((value) => path.normalize(value.path) == path.normalize(filePath))
  if (matches.length > 1) {
    log.info(
      `Found <${matches.length}> matches for known files for path: ${filePath}.  Eliminating all but one.`
    )
    const firstMatch = Object.entries(files).find((entry) => {
      return entry[1].path === filePath
    })
    try {
      const withoutHits = Object.entries(files).reduce(
        (acc, entry) => {
          const key = entry[0]
          const value = entry[1]
          if (path.normalize(value.path) === path.normalize(filePath)) {
            return acc
          }
          return {
            ...acc,
            [key]: value,
          }
        },
        {
          [firstMatch[0]]: firstMatch[1],
        }
      )
      knownFilesStore.set(withoutHits)
    } catch (error) {
      log.error('Failed to remove file', error)
    }
  } else if (matches.length > 0) {
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
  // We also don't want to track recent files that don't have a path.
  if (!filePath || filePath === '') return null
  const normalisedPath = path.normalize(filePath)
  const existingId = Object.keys(knownFilesStore.store).find((id) => {
    const existingPath = knownFilesStore.store[id].path
    const existingNormalisedPath = existingPath && path.normalize(existingPath)
    return existingNormalisedPath === normalisedPath
  })
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

export { knownFilesStore, getKnownFilesInfo, addToKnown, addToKnownFiles }
