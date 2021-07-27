import { ipcRenderer, shell } from 'electron'
import log from 'electron-log'
import path from 'path'
import { knownFilesStore } from './store_hooks'

export function editKnownFilePath(oldPath, newPath) {
  const key = Object.keys(knownFilesStore.store).find(
    (id) => path.normalize(knownFilesStore.store[id].path) == path.normalize(oldPath)
  )
  const file = knownFilesStore.get(key)
  knownFilesStore.set(key, {
    ...file,
    path: newPath,
  })
}

export function removeFromKnownFiles(id) {
  knownFilesStore.delete(id)
}

export function deleteKnownFile(id, filePath) {
  if (!filePath) {
    filePath = knownFilesStore.get(`${id}.path`)
  }
  try {
    removeFromKnownFiles(id)
    shell.moveItemToTrash(filePath, true)
    ipcRenderer.send('remove-from-temp-files-if-temp', filePath)
  } catch (error) {
    log.warn(error)
  }
}

// TODO: days left in trial mode?
export function displayFileName(filePath) {
  const devMessage = process.env.NODE_ENV == 'development' ? ' - DEV' : ''
  const baseFileName = ` - ${path.basename(filePath)}`
  return `Plottr${baseFileName}${devMessage}`
}
