import path from 'path'
import fs from 'fs'
import log from 'electron-log'
import { app, ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'

import { t } from 'plottr_locales'

import { addToKnownFiles, addToKnown } from './known_files'
import { importFromSnowflake, importFromScrivener } from 'plottr_import_export'

import { helpers, emptyFile, tree, SYSTEM_REDUCER_KEYS } from 'pltr/v2'
import { openProjectWindow } from './windows/projects'
import { broadcastToAllWindows } from './broadcast'
import { OFFLINE_FILE_FILES_PATH, isOfflineFile } from './offlineFilePath'
import { whenClientIsReady } from '../../shared/socket-client'

const { writeFile } = fs.promises

const makeFileModule = () => {
  const TMP_PATH = 'tmp'
  const TEMP_FILES_PATH = path.join(app.getPath('userData'), 'tmp')

  const saveFile = (fileURL, jsonData) => {
    return whenClientIsReady(({ saveFile }) => {
      return saveFile(fileURL, jsonData)
    })
  }

  function removeFromTempFiles(fileURL, doDelete) {
    return whenClientIsReady(({ removeFromTempFiles }) => {
      return removeFromTempFiles(fileURL, doDelete)
    })
  }

  function removeFromKnownFiles(fileURL) {
    return whenClientIsReady(({ removeFromKnownFiles }) => {
      return removeFromKnownFiles(fileURL)
    })
  }

  function deleteKnownFile(fileURL) {
    return whenClientIsReady(({ deleteKnownFile }) => {
      return deleteKnownFile(fileURL)
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
      return template.templateData
    }

    return {
      ...template.templateData,
      series: {
        ...template.templateData.series,
        name,
      },
    }
  }

  async function createNew(template, name) {
    if (template) {
      const fileName = name || t('Untitled')
      const templateFileJSON = newFileFromTemplate(template, fileName)
      if (templateFileJSON.books[1]) {
        templateFileJSON.books[1].title = fileName
      }
      try {
        const fileURL = await saveToTempFile(templateFileJSON, name)
        await addToKnownFiles(fileURL)
        await openFile(fileURL)
      } catch (error) {
        log.error('Failed to create a new file', name, error)
        throw error
      }
    } else {
      const fileName = name || t('Untitled')
      const emptyPlottrFile = emptyFile(fileName, app.getVersion())
      try {
        const fileURL = await saveToTempFile(emptyPlottrFile, name)
        await addToKnownFiles(fileURL)
        await openFile(fileURL)
      } catch (error) {
        log.error('Failed to create a new file', name, error)
        throw error
      }
    }
  }

  function createFromSnowflake(importedPath, sender, isLoggedIntoPro) {
    const storyName = path.basename(importedPath, '.snowXML')
    let json = emptyFile(storyName, app.getVersion())
    // clear beats and lines
    json.beats = {
      series: tree.newTree('id'),
    }
    json.lines = []
    return whenClientIsReady(({ readFile }) => {
      return importFromSnowflake(importedPath, true, json, readFile).then((importedJson) => {
        if (isLoggedIntoPro) {
          sender.send('create-plottr-cloud-file', importedJson, storyName)
          return Promise.resolve()
        }

        return saveToTempFile(importedJson, storyName)
          .then((fileURL) => {
            return addToKnownFiles(fileURL).then(() => {
              return openFile(fileURL)
            })
          })
          .catch((error) => {
            log.error('Failed to create file from snowflake', error)
            return Promise.reject(error)
          })
      })
    })
  }

  function createRTFConversionFunction(sender) {
    return function (rtfString) {
      return new Promise((resolve, reject) => {
        const conversionId = uuidv4()
        ipcMain.once(conversionId, (event, replyChannel, slate) => {
          event.sender.send(replyChannel, conversionId)
          resolve(slate)
        })
        sender.send('convert-rtf-string-to-slate', rtfString, conversionId)
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
    const importedJsonPromise = whenClientIsReady(
      ({ readFile, readdir, stat, extname, basename, join }) => {
        return importFromScrivener(
          importedPath,
          true,
          json,
          createRTFConversionFunction(sender),
          readFile,
          readdir,
          stat,
          extname,
          basename,
          join
        )
      }
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
          .then((fileURL) => {
            return addToKnownFiles(fileURL).then(() => {
              return openFile(fileURL)
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

  function openFile(fileURL, unknown) {
    if (helpers.file.isDeviceFileURL(fileURL)) {
      // update lastOpen, but wait a little so the file doesn't move from under their mouse
      setTimeout(() => {
        if (isOfflineFile(fileURL)) {
          log.info('Opening offline file', fileURL)
          return
        }
        whenClientIsReady(({ updateLastOpenedDate }) => {
          return updateLastOpenedDate(fileURL)
        })
          .then(() => {
            broadcastToAllWindows('reload-recents')
          })
          .catch((error) => {
            log.error('Failed to update a known files last opened date', fileURL, error)
          })
      }, 500)
    }
    return openProjectWindow(fileURL)
      .then(() => {
        log.info('Opened known file for', fileURL)
        if (unknown) addToKnown(fileURL)
      })
      .catch((error) => {
        log.error('Failed to open a project window for know file', fileURL)
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
    openFile,
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
  openFile,
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
  openFile,
  deleteKnownFile,
  removeFromKnownFiles,
}
