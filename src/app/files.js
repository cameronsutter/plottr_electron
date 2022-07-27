import { store } from 'store'
import path from 'path'
import { ipcRenderer } from 'electron'
import { dialog, getCurrentWindow } from '@electron/remote'

import { t } from 'plottr_locales'

const win = getCurrentWindow()

const makeFileModule = (whenClientIsReady) => {
  const saveFile = (filePath, jsonData) => {
    return whenClientIsReady(({ saveFile }) => {
      return saveFile(filePath, jsonData)
    })
  }

  const backupOfflineBackupForResume = (file) => {
    return whenClientIsReady(({ backupOfflineBackupForResume }) => {
      return backupOfflineBackupForResume(file)
    })
  }

  const readOfflineFiles = () => {
    return whenClientIsReady(({ readOfflineFiles }) => {
      return readOfflineFiles()
    })
  }

  const isTempFile = (file) => {
    return whenClientIsReady(({ isTempFile }) => {
      return isTempFile(file)
    })
  }

  const saveAs = (customMessage) => {
    const { present } = store.getState()
    const defaultPath = path.basename(present.file.fileName).replace('.pltr', '')
    const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
    const fileName = dialog.showSaveDialogSync(win, {
      filters,
      title: customMessage || t('Where would you like to save this copy?'),
      defaultPath,
    })
    if (fileName) {
      let newFilePath = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
      return saveFile(newFilePath, present).then(() => {
        ipcRenderer.send('pls-open-window', newFilePath, true)
        return true
      })
    }
    return Promise.resolve(false)
  }

  return { saveFile, backupOfflineBackupForResume, readOfflineFiles, isTempFile, saveAs }
}

export { makeFileModule }
