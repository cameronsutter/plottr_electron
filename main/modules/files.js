import path from 'path'
import fs from 'fs'
import log from 'electron-log'
import { app, ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'

import { t } from 'plottr_locales'

import { addToKnownFiles, addToKnown } from './known_files'
import { importFromSnowflake, importFromScrivener } from 'plottr_import_export'

import { emptyFile, tree, SYSTEM_REDUCER_KEYS } from 'pltr/v2'
import { openProjectWindow } from './windows/projects'
import { broadcastToAllWindows } from './broadcast'
import { OFFLINE_FILE_FILES_PATH, isOfflineFile } from './offlineFilePath'
import { whenClientIsReady } from '../../shared/socket-client'

const { writeFile } = fs.promises

const makeFileModule = () => {
  const TMP_PATH = 'tmp'
  const TEMP_FILES_PATH = path.join(app.getPath('userData'), 'tmp')

  const saveFile = (filePath, jsonData) => {
    return whenClientIsReady(({ saveFile }) => {
      return saveFile(filePath, jsonData)
    })
  }

  function removeFromTempFiles(filePath, doDelete) {
    return whenClientIsReady(({ removeFromTempFiles }) => {
      return removeFromTempFiles(filePath, doDelete)
    })
  }

  function removeFromKnownFiles(id) {
    return whenClientIsReady(({ removeFromKnownFiles }) => {
      return removeFromKnownFiles(id)
    })
  }

  function deleteKnownFile(id, filePath) {
    return whenClientIsReady(({ deleteKnownFile }) => {
      return deleteKnownFile(id, filePath)
    })
  }

  function editKnownFilePath(oldPath, newPath) {
    return whenClientIsReady(({ editKnownFilePath }) => {
      return editKnownFilePath(oldPath, newPath)
    })
  }

  function saveToTempFile(json, name) {
    return whenClientIsReady(({ saveToTempFile }) => {
      return saveToTempFile(json, name)
    })
  }

  function newFileFromTemplate(template, name) {
    if (!name) {
      return template
    }

    return {
      ...template,
      series: {
        ...template.series,
        name,
      },
    }
  }

  async function createNew(template, name) {
    if (template) {
      const templateFileJSON = newFileFromTemplate(template, name)
      const fileName = name || t('Untitled')
      if (templateFileJSON.books[1]) {
        templateFileJSON.books[1].title = fileName
      }
      try {
        const filePath = await saveToTempFile(templateFileJSON, name)
        const fileId = await addToKnownFiles(filePath)
        await openKnownFile(filePath, fileId)
      } catch (error) {
        log.error('Failed to create a new file', name, error)
        throw error
      }
    } else {
      const fileName = name || t('Untitled')
      const emptyPlottrFile = emptyFile(fileName, app.getVersion())
      try {
        const filePath = await saveToTempFile(emptyPlottrFile, name)
        const fileId = await addToKnownFiles(filePath)
        await openKnownFile(filePath, fileId)
      } catch (error) {
        log.error('Failed to create a new file', name, error)
        throw error
      }
    }
  }

  async function createFromSnowflake(importedPath, sender, isLoggedIntoPro) {
    const storyName = path.basename(importedPath, '.snowXML')
    let json = emptyFile(storyName, app.getVersion())
    // clear beats and lines
    json.beats = {
      series: tree.newTree('id'),
    }
    json.lines = []
    const importedJson = importFromSnowflake(importedPath, true, json)

    if (isLoggedIntoPro) {
      sender.send('create-plottr-cloud-file', importedJson, storyName)
      return Promise.resolve()
    }

    try {
      const filePath = await saveToTempFile(importedJson, storyName)
      const fileId = await addToKnownFiles(filePath)
      await openKnownFile(filePath, fileId)
    } catch (error) {
      log.error('Failed to create file from snowflake', error)
      throw error
    }
    return true
  }

  function createRTFConversionFunction(sender) {
    return function (rtfString) {
      return new Promise((resolve, reject) => {
        const conversionId = uuidv4()
        sender.send('convert-rtf-string-to-slate', rtfString, conversionId)
        ipcMain.once(conversionId, (_event, slate) => {
          resolve(slate)
        })
      })
    }
  }

  function createFromScrivener(importedPath, sender, isLoggedIntoPro, destinationFile) {
    const storyName = path.basename(importedPath, '.scriv')
    let json = emptyFile(storyName, app.getVersion())
    const isScrivener = true
    json.beats = {
      series: tree.newTree('id'),
    }
    json.lines = []
    const importedJsonPromise = importFromScrivener(
      importedPath,
      true,
      json,
      createRTFConversionFunction(sender)
    )

    if (isLoggedIntoPro) {
      importedJsonPromise
        .then((importedJson) => {
          sender.send('create-plottr-cloud-file', importedJson, storyName, isScrivener)
        })
        .catch((error) => {
          return sender.send('error-importing-scrivener', error)
        })
      return Promise.resolve()
    }

    return importedJsonPromise.then((importedJson) => {
      if (destinationFile) {
        return writeFile(destinationFile, JSON.stringify(importedJson, null, 2)).then(() => {
          // Right now, this is only used for testing so we want to quit when we're done.
          log.info(`Finished importing from ${importedPath} to ${destinationFile}`)
          app.quit()
        })
      } else {
        return saveToTempFile(importedJson, storyName)
          .then((filePath) => {
            return addToKnownFiles(filePath).then((fileId) => {
              return openKnownFile(filePath, fileId)
                .then(() => {
                  log.info('Opened file from imported scrivener data', storyName)
                  sender.send('finish-creating-local-scrivener-imported-file')
                  return true
                })
                .catch((error) => {
                  sender.send('error-importing-scrivener', error)
                  log.error('Failed to open a known file after importing from scrivener', error)
                  return Promise.reject(error)
                })
            })
          })
          .catch((error) => {
            log.error('Failed to save imported scrivener file', error)
            sender.send('error-importing-scrivener', error)
          })
      }
    })
  }

  function openKnownFile(filePath, id, unknown) {
    if (id && filePath && !filePath.startsWith('plottr://')) {
      // update lastOpen, but wait a little so the file doesn't move from under their mouse
      setTimeout(() => {
        if (isOfflineFile(filePath)) {
          log.info('Opening offline file', filePath)
          return
        }
        whenClientIsReady(({ updateLastOpenedDate }) => {
          return updateLastOpenedDate(id)
        })
          .then(() => {
            broadcastToAllWindows('reload-recents')
          })
          .catch((error) => {
            log.error('Failed to update a known files last opened date', id, filePath, error)
          })
      }, 500)
    }
    return openProjectWindow(filePath)
      .then(() => {
        log.info('Opened known file for', filePath)
        if (unknown) addToKnown(filePath)
      })
      .catch((error) => {
        log.error('Failed to open a project window for know file', filePath)
        return Promise.reject(error)
      })
  }

  return {
    TMP_PATH,
    TEMP_FILES_PATH,
    saveFile,
    editKnownFilePath,
    removeFromTempFiles,
    createNew,
    createFromSnowflake,
    createFromScrivener,
    openKnownFile,
    deleteKnownFile,
    removeFromKnownFiles,
  }
}

const {
  TMP_PATH,
  TEMP_FILES_PATH,
  saveFile,
  editKnownFilePath,
  removeFromTempFiles,
  createNew,
  createFromSnowflake,
  createFromScrivener,
  openKnownFile,
  deleteKnownFile,
  removeFromKnownFiles,
} = makeFileModule()

export {
  TMP_PATH,
  TEMP_FILES_PATH,
  saveFile,
  editKnownFilePath,
  removeFromTempFiles,
  createNew,
  createFromSnowflake,
  createFromScrivener,
  openKnownFile,
  deleteKnownFile,
  removeFromKnownFiles,
}
