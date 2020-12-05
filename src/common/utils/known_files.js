import path from 'path'
import { knownFilesStore } from './store_hooks'

export function addToKnownFiles (filePath) {
  const existingId = Object.keys(knownFilesStore.store).find(id => knownFilesStore.store[id].path == filePath)
  if (existingId) {
    return existingId
  } else {
    const newId = knownFilesStore.size + 1
    knownFilesStore.set(`${newId}`, {
      path: filePath,
      lastOpened: Date.now()
    })
    return newId
  }
}

export function editKnownFilePath (oldPath, newPath) {
  const key = Object.keys(knownFilesStore.store).find(id => knownFilesStore.store[id].path == oldPath)
  const file = knownFilesStore.get(key)
  knownFilesStore.set(key, {
    ...file,
    path: newPath,
  })
}

// TODO: days left in trial mode?
export function displayFileName (filePath) {
  const devMessage = process.env.NODE_ENV == 'development' ? ' - DEV' : ''
  const baseFileName = ` - ${path.basename(filePath)}`
  return `Plottr${baseFileName}${devMessage}`
}