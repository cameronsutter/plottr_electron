import path from 'path'
import { t } from 'plottr_locales'
import { TEMP_FILES_PATH } from './config_paths'
import { tempFilesStore } from './store_hooks'
import log from 'electron-log'
import { shell } from 'electron'
import { saveFile } from './files'

export function removeFromTempFiles(filePath, doDelete = true) {
  const tmpFiles = tempFilesStore.get()
  const key = Object.keys(tmpFiles).find((id) => tmpFiles[id].filePath == filePath)
  tempFilesStore.delete(key)
  // delete the real file
  try {
    if (doDelete) shell.moveItemToTrash(filePath, true)
  } catch (error) {
    log.warn(error)
  }
}

export function saveToTempFile(json) {
  const tempId = tempFilesStore.size + 1
  const tempName = `${t('Untitled')}${tempId == 1 ? '' : tempId}.pltr`
  const filePath = path.join(TEMP_FILES_PATH, tempName)
  tempFilesStore.set(`${tempId}`, { filePath })
  saveFile(filePath, json)
  return filePath
}
