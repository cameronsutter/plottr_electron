const fs = require('fs')
const Store = require('electron-store')
const { OPEN_FILES_PATH, KNOWN_FILES_PATH } = require('./config_paths')
const SETTINGS = require('./settings')

const openFilesPath = process.env.NODE_ENV == 'dev' ? `${OPEN_FILES_PATH}_dev` : OPEN_FILES_PATH
const knownFilesPath = process.env.NODE_ENV == 'dev' ? `${KNOWN_FILES_PATH}_dev` : KNOWN_FILES_PATH

const OPEN_FILES_ROOT = 'openFiles'
const openFilesStore = new Store({name: openFilesPath, defaults: {[OPEN_FILES_ROOT]: []}})
const knownFilesStore = new Store({name: knownFilesPath, defaults: {byIds: {}, allIds: []}})

class FileManager {
  opM = new OpenFileManager()
  knM = new KnownFileManager()

  listOpenFiles = () => {
    return this.opM.listOpenFiles()
  }

  open = (fileName) => {
    this.opM.open(fileName)
    this.knM.addIf(fileName)
  }

  close = (fileName) => {
    this.opM.close(fileName)
  }

  move = (fileName) => {

  }

  save = (fileName, jsonData, callback) => {
    let stringData = ''
    if (process.env.NODE_ENV == 'dev') {
      stringData = JSON.stringify(jsonData, null, 2)
    } else {
      stringData = JSON.stringify(jsonData)
    }
    fs.writeFile(fileName, stringData, callback)
  }

}

class OpenFileManager {
  listOpenFiles = () => {
    return openFilesStore.get(OPEN_FILES_ROOT)
  }

  open = (fileName) => {
    let opened = openFilesStore.get(OPEN_FILES_ROOT)
    const idx = opened.indexOf(fileName)
    if (idx == -1) {
      opened.push(fileName)
      openFilesStore.set(OPEN_FILES_ROOT, opened)
    }
  }

  close = (fileName) => {
    let opened = openFilesStore.get(OPEN_FILES_ROOT)
    const idx = opened.indexOf(fileName)
    if (idx > -1) {
      opened.splice(idx, 1)
      openFilesStore.set(OPEN_FILES_ROOT, opened)
    }
  }
}

const intialFileStructure = {
  lastOpened: null,
}

class KnownFileManager {
  ROOT = 'byIds'
  IDS = 'allIds'

  addIf = (fileName) => {
    const name = fileName.replace('.', '~$~')
    const key = `${this.ROOT}.${name}`
    let file = knownFilesStore.get(key)
    if (file) {
      // update last opened
      file.lastOpened = new Date().getTime()
      knownFilesStore.set(key, file)
    } else {
      const newFile = Object.assign({}, intialFileStructure, {lastOpened: new Date().getTime()})
      const fileIds = knownFilesStore.get(this.IDS)
      fileIds.unshift(fileName)
      knownFilesStore.set(key, newFile)
      knownFilesStore.set(this.IDS, fileIds)
    }
  }

  listKnownFiles = () => {
    const fileIds = knownFilesStore.get(this.IDS)
    const files = Object.keys(knownFilesStore.get(this.ROOT)).reduce((acc, filePath) => {
      const thePath = filePath.replace('~$~', '.')
      acc[thePath] = files[filePath]
      return acc
    }, {})

    return {[this.ROOT]: files, [this.IDS]: fileIds}
  }

}

const FM = new FileManager()

module.exports = FM