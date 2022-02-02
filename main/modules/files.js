const path = require('path')
const fs = require('fs')
const Store = require('electron-store')
const log = require('electron-log')
const { app } = require('electron')
const { isEqual } = require('lodash')

const { t } = require('plottr_locales')

const { knownFilesStore, addToKnownFiles, addToKnown } = require('./known_files')
const { Importer } = require('./importer/snowflake/importer')
const { emptyFile, tree, SYSTEM_REDUCER_KEYS } = require('pltr/v2')
const { openProjectWindow } = require('./windows/projects')
const { shell } = require('electron')
const { broadcastToAllWindows } = require('./broadcast')
const { saveBackup } = require('./backup')
const SETTINGS = require('./settings')

const { lstat, writeFile, readFile, open } = fs.promises

const TMP_PATH = 'tmp'
const TEMP_FILES_PATH = path.join(app.getPath('userData'), 'tmp')

const tempPath = process.env.NODE_ENV == 'development' ? `${TMP_PATH}_dev` : TMP_PATH
const tempFilesStore = new Store({ name: tempPath, cwd: 'tmp', watch: true })

const checkFileJustWritten = (filePath, data, originalStats, counter) => (fileContents) => {
  // Parsing the file could still fail...
  try {
    const newFileContents = JSON.parse(fileContents)
    const intendedFileContents = JSON.parse(data)
    if (isEqual(newFileContents, intendedFileContents)) {
      // It worked!
      return true
    } else {
      // Somehow, the files are different :/
      //
      // Let's try again...
      log.warn(`File written to disk at ${filePath} doesn't match the intended file.`)
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          checkSave(filePath, data, originalStats, counter + 1).then(resolve, reject)
        }, 500)
      })
    }
  } catch (error) {
    console.error(
      `Failed to parse contents of file: ${filePath}.  Attempting to write it again.`,
      error
    )
    return checkSave(filePath, data, null, counter)
  }
}

const checkSaveHandleTimestampChange = (filePath, data, originalStats, counter) => {
  try {
    // Check that the file we just wrote is filled with the
    // content that we intended.
    return readFile(filePath).then(checkFileJustWritten(filePath, data, originalStats, counter))
  } catch (error) {
    // If we couldn't read the file, then bail out.  Something went
    // horribly wrong.
    console.error(`Failed to save to ${filePath}.  Old file is un-touched.`, error)
    return Promise.reject(error)
  }
}

const writeAndWaitForFlush = (filePath, data) => {
  return open(filePath, 'w+').then((fileHandle) => {
    return writeFile(fileHandle, data).then(() => {
      return fileHandle.sync().then(() => {
        return fileHandle.close()
      })
    })
  })
}

const checkSaveHandleNoOriginalStats = (filePath, data, stats, counter) => {
  // Overwrite the file and then leave it to the main function to
  // check that the file actually changed to what we want it to.
  return writeAndWaitForFlush(filePath, data).then(() => {
    // When we recur, lstat should produce different stats.
    return checkSave(filePath, data, stats, counter)
  })
}

const MAX_ATTEMPTS = 10

const handleFileStats = (filePath, data, originalStats, counter) => (stats) => {
  // If we don't have original stats, then this is the first
  // time that we try to save.  Go ahead and save.
  if (stats && !originalStats) {
    return checkSaveHandleNoOriginalStats(filePath, data, stats, counter)
  }

  // Check that the modified time of the stats before saving is
  // different to that which is after.  Or we tried to find a change
  // in time stamps MAX_ATTEMPTS times.
  const triedEnoughTimes = counter === MAX_ATTEMPTS - 1
  if ((stats && stats.mtimeMs !== originalStats.mtimeMs) || triedEnoughTimes) {
    if (triedEnoughTimes) {
      log.warn(`Timestamp for ${filePath} didn't change, but we're assuming that it did anyway.`)
    }
    return checkSaveHandleTimestampChange(filePath, data, originalStats, counter)
  }

  // The timestamp hasn't yet changed.  Wait a little bit before
  // trying again.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      checkSave(filePath, data, originalStats, counter + 1).then(resolve, reject)
    }, 500)
  })
}

function checkSave(filePath, data, originalStats = null, counter = 0) {
  if (counter < MAX_ATTEMPTS) {
    // To kick things off, assume that we're overwriting an existing
    // file and (as per Node docs) catch the ENOENT if the file
    // doesn't exist.
    return lstat(filePath)
      .then(handleFileStats(filePath, data, originalStats, counter))
      .catch((error) => {
        if (error.maxAttemptsHit) {
          return Promise.reject(error)
        }
        // If the Error code flags that the file didn't exist, then
        // write the file and check that it's what we wanted it to be.
        if (error.code === 'ENOENT') {
          return writeAndWaitForFlush(filePath, data).then(
            checkFileJustWritten(filePath, data, originalStats, counter)
          )
        } else {
          // Otherwise, we had an error that we don't yet account for.
          // Log it for later diagnosis and try again after waiting a
          // small bit.
          console.error(`Unhandled error when saving ${filePath}.`, error)
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              checkSave(filePath, data, originalStats, counter + 1).then(resolve, reject)
            }, 500)
          })
        }
      })
  } else {
    // We ran out of attempts to save the file.
    const error = Error(`Failed to save to ${filePath}.  Old file is un-touched.`)
    error.maxAttemptsHit = true
    console.error(error)
    return Promise.reject(error)
  }
}

const fileSaver = () => {
  const saveJobs = new Map()
  const BLANK_FILE = emptyFile()

  return function saveFile(filePath, jsonData) {
    const withoutSystemKeys = {}
    Object.keys(jsonData).map((key) => {
      if (SYSTEM_REDUCER_KEYS.indexOf(key) >= 0) return
      withoutSystemKeys[key] = jsonData[key]
    })
    const hasMinimalSetOfKeys = Object.keys(BLANK_FILE).every((key) => key in withoutSystemKeys)
    if (!hasMinimalSetOfKeys) {
      const missingKeys = Object.keys(BLANK_FILE).reduce((acc, key) => {
        if (key in withoutSystemKeys) return acc
        else return [key, ...acc]
      }, [])
      const errorMessage = `Tried to save file at ${filePath} but after removing system keys it lacks the following expected keys: ${missingKeys}`
      console.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }
    const payload =
      process.env.NODE_ENV == 'development'
        ? JSON.stringify(withoutSystemKeys, null, 2)
        : JSON.stringify(withoutSystemKeys)
    const chainingTheJob = saveJobs.get(filePath)
    const existingJob = saveJobs.get(filePath) || Promise.resolve()
    const newJob = existingJob
      .then((result) => {
        if (chainingTheJob) {
          saveJobs.set(filePath, newJob)
        }
        return result
      })
      .then(() => {
        return checkSave(filePath, payload)
      })
      .then(() => {
        saveJobs.delete(filePath)
      })
      .catch((error) => {
        saveJobs.delete(filePath)
        return Promise.reject(error)
      })
    saveJobs.set(filePath, newJob)
    return newJob
  }
}
const saveFile = fileSaver()

const autoSaver = () => {
  let itWorkedLastTime = true

  let backupTimeout = null
  let resetCount = 0
  const MAX_ATTEMPTS = 200

  return async function autoSave(event, filePath, file, userId, previousFile) {
    const onCloud = file.file.isCloudFile
    if (!onCloud) {
      try {
        await saveFile(filePath, file)
        // didn't work last time, but it did this time
        if (!itWorkedLastTime) {
          itWorkedLastTime = true
          event.sender.send('auto-save-worked-this-time')
        }
      } catch (saveError) {
        itWorkedLastTime = false
        event.sender.send('auto-save-error', filePath, saveError)
      }
    }
    // either way, save a backup
    function forceBackup() {
      // save local backup if: 1) not cloud file OR 2) localBackups is on
      if (!onCloud || (onCloud && SETTINGS.get('user.localBackups'))) {
        if (onCloud) {
          filePath = `${file.file.fileName}.pltr`
        }
        saveBackup(filePath, previousFile || file, (backupError) => {
          if (backupError) {
            event.sender.send('auto-save-backup-error', filePath, backupError)
          }
        })
      }
      backupTimeout = null
      resetCount = 0
    }
    if (backupTimeout) {
      clearTimeout(backupTimeout)
      resetCount++
    }
    if (resetCount >= MAX_ATTEMPTS) {
      forceBackup()
      return
    }
    // NOTE: We want to backup every 60 seconds, but saves only happen
    // every 10 seconds.
    backupTimeout = setTimeout(forceBackup, 59000)
  }
}
const autoSave = autoSaver()

function removeFromTempFiles(filePath, doDelete = true) {
  const tmpFiles = tempFilesStore.get()
  const key = Object.keys(tmpFiles).find((id) => tmpFiles[id].filePath == filePath)
  tempFilesStore.delete(key)
  // delete the real file
  try {
    if (doDelete) shell.moveItemToTrash(filePath, true)
    broadcastToAllWindows('reload-recents')
  } catch (error) {
    log.warn(error)
  }
}

function removeFromKnownFiles(id) {
  knownFilesStore.delete(id)
}

function deleteKnownFile(id, filePath) {
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

function editKnownFilePath(oldPath, newPath) {
  const key = Object.keys(knownFilesStore.store).find(
    (id) => path.normalize(knownFilesStore.store[id].path) == path.normalize(oldPath)
  )
  const file = knownFilesStore.get(key)
  knownFilesStore.set(key, {
    ...file,
    path: newPath,
  })
}

async function saveToTempFile(json) {
  const tempId = tempFilesStore.size + 1
  const tempName = `${t('Untitled')}${tempId == 1 ? '' : tempId}.pltr`
  const filePath = path.join(TEMP_FILES_PATH, tempName)
  tempFilesStore.set(`${tempId}`, { filePath })
  await saveFile(filePath, json)
  return filePath
}

async function createNew(template) {
  if (template) {
    const filePath = await saveToTempFile(template)
    const fileId = addToKnownFiles(filePath)
    openKnownFile(filePath, fileId)
  } else {
    const emptyPlottrFile = emptyFile(t('Untitled'), app.getVersion())
    const filePath = await saveToTempFile(emptyPlottrFile)
    const fileId = addToKnownFiles(filePath)
    openKnownFile(filePath, fileId)
  }
}

async function createFromSnowflake(importedPath) {
  const storyName = path.basename(importedPath, '.snowXML')
  let json = emptyFile(storyName, app.getVersion())
  // clear beats and lines
  json.beats = {
    series: tree.newTree('id'),
  }
  json.lines = []
  const importedJson = Importer(importedPath, true, json)

  const filePath = await saveToTempFile(importedJson)
  const fileId = addToKnownFiles(filePath)
  openKnownFile(filePath, fileId)
}

function openKnownFile(filePath, id, unknown) {
  if (id && !filePath.startsWith('plottr://')) {
    // update lastOpen, but wait a little so the file doesn't move from under their mouse
    setTimeout(() => {
      knownFilesStore.set(`${id}.lastOpened`, Date.now())
      broadcastToAllWindows('reload-recents')
    }, 500)
  }
  openProjectWindow(filePath)
  if (unknown) addToKnown(filePath)
}

module.exports = {
  TMP_PATH,
  TEMP_FILES_PATH,
  tempFilesStore,
  saveFile,
  autoSave,
  editKnownFilePath,
  removeFromTempFiles,
  removeFromKnownFiles,
  deleteKnownFile,
  createNew,
  createFromSnowflake,
  openKnownFile,
}
