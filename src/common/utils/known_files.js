import { shell } from 'electron'
import { log } from 'electron-log'
import path from 'path'
import { TEMP_FILES_PATH } from './config_paths'
import { knownFilesStore } from './store_hooks'
import { removeFromTempFiles } from './temp_files'

export function addToKnownFiles (filePath) {
  console.log('adding', filePath)
  console.log('normalized', path.normalize(filePath))
  console.log('known', Object.keys(knownFilesStore.store).map(id => path.normalize(knownFilesStore.store[id].path)))
  const existingId = Object.keys(knownFilesStore.store).find(id => path.normalize(knownFilesStore.store[id].path) == path.normalize(filePath))
  console.log('existingId', existingId)
  if (existingId) {
    return existingId
  } else {
    console.log('no existing', knownFilesStore.size)
    // for some reason, .size doesn't work in prod here (but it does in temp_files.js)
    const newId = Math.max(...Object.keys(knownFilesStore.store).map(Number)) + 1
    console.log('newId', newId)
    knownFilesStore.set(`${newId}`, {
      path: filePath,
      lastOpened: Date.now()
    })
    return newId
  }
}

export function editKnownFilePath (oldPath, newPath) {
  const key = Object.keys(knownFilesStore.store).find(id => path.normalize(knownFilesStore.store[id].path) == path.normalize(oldPath))
  const file = knownFilesStore.get(key)
  knownFilesStore.set(key, {
    ...file,
    path: newPath,
  })
}

export function removeFromKnownFiles (id) {
  knownFilesStore.delete(id)
}

export function deleteKnownFile (id, filePath) {
  if (!filePath) {
    filePath = knownFilesStore.get(`${id}.path`)
  }
  try {
    removeFromKnownFiles(id)
    shell.moveItemToTrash(filePath, true)
    if (filePath.includes(TEMP_FILES_PATH)) {
      removeFromTempFiles(filePath, false)
    }
  } catch (error) {
    log.warn(error)
  }
}

// TODO: days left in trial mode?
export function displayFileName (filePath) {
  const devMessage = process.env.NODE_ENV == 'development' ? ' - DEV' : ''
  const baseFileName = ` - ${path.basename(filePath)}`
  return `Plottr${baseFileName}${devMessage}`
}