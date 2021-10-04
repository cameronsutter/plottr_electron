import Store from 'electron-store'
import { ipcRenderer } from 'electron'
import { useState, useEffect } from 'react'
import { merge, cloneDeep, isEqual } from 'lodash'
import {
  TRIAL_INFO_PATH,
  USER_INFO_PATH,
  KNOWN_FILES_PATH,
  CUSTOM_TEMPLATES_PATH,
  TEMPLATES_PATH,
  TEMPLATES_MANIFEST_PATH,
  EXPORT_CONFIG_PATH,
} from './config_paths'
import SETTINGS from './settings'
import export_config from '../exporter/default_config'
import { store } from '../../app/store/configureStore'
import { allCustomTemplates } from '../../dashboard/utils/templates_from_firestore'

const knownFilesPath =
  process.env.NODE_ENV == 'development' ? `${KNOWN_FILES_PATH}_dev` : KNOWN_FILES_PATH
const templatesPath =
  process.env.NODE_ENV == 'development' ? `${TEMPLATES_PATH}_dev` : TEMPLATES_PATH
const customTemplatesPath =
  process.env.NODE_ENV == 'development' ? `${CUSTOM_TEMPLATES_PATH}_dev` : CUSTOM_TEMPLATES_PATH
const manifestPath =
  process.env.NODE_ENV == 'development' ? `${TEMPLATES_MANIFEST_PATH}_dev` : TEMPLATES_MANIFEST_PATH
const exportPath =
  process.env.NODE_ENV == 'development' ? `${EXPORT_CONFIG_PATH}_dev` : EXPORT_CONFIG_PATH

export const trialStore = new Store({ name: TRIAL_INFO_PATH, watch: true })
export const licenseStore = new Store({ name: USER_INFO_PATH, watch: true })
export const knownFilesStore = new Store({ name: knownFilesPath, watch: true })
export const templatesStore = new Store({ name: templatesPath, watch: true })
export const customTemplatesStore = new Store({ name: customTemplatesPath, watch: true })
export const exportConfigStore = new Store({
  name: exportPath,
  watch: true,
  defaults: export_config,
})
export const manifestStore = new Store({ name: manifestPath })
export const MANIFEST_ROOT = 'manifest'

const checkInterval = 1000 * 60 * 1 // every minute

function useJsonStore(store, ipcEventToReloadOn, checksOften) {
  const [info, setInfo] = useState(store.store)
  const [size, setSize] = useState(store.size)
  useEffect(() => {
    const unsubscribe = store.onDidAnyChange((newVal, oldVal) => {
      setInfo(newVal)
      setSize(Object.keys(newVal).length)
    })
    return () => unsubscribe()
  }, [])
  useEffect(() => {
    if (ipcEventToReloadOn) {
      ipcRenderer.on(ipcEventToReloadOn, () => {
        setInfo(store.get())
        setSize(store.size)
      })
    }

    return () => ipcRenderer.removeAllListeners(ipcEventToReloadOn)
  }, [])
  useEffect(() => {
    let timeout
    if (checksOften) {
      timeout = setTimeout(() => {
        setInfo(store.get())
        setSize(store.size)
      }, checkInterval)
    }

    return () => clearTimeout(timeout)
  }, [])

  const saveInfoAtKey = (key, data) => {
    store.set(key, data)
    setInfo(store.store)
    setSize(store.size)
  }

  const saveAllInfo = (data) => {
    store.set(data)
    setInfo(store.store)
    setSize(store.size)
  }

  return [info, size, saveInfoAtKey, saveAllInfo]
}

export function useTrialInfo() {
  return useJsonStore(trialStore)
}

export function useLicenseInfo() {
  return useJsonStore(licenseStore)
}

function useKnownFilesFromFirebase(initialFileList) {
  const [fileList, setFileList] = useState(initialFileList)
  const [filesByPosition, setFilesByPosition] = useState({})

  useEffect(() => {
    const filesByPosition = {}
    const receivedNewFileList = !isEqual(fileList, initialFileList)
    if (receivedNewFileList) {
      setFileList(initialFileList)
    }
    const currentFileList = receivedNewFileList ? initialFileList : fileList
    currentFileList.forEach((file, index) => {
      filesByPosition[index + 1] = file
    })
    setFilesByPosition(filesByPosition)
  }, [initialFileList, fileList])

  const nop = () => {}
  return [filesByPosition, fileList.length, nop, nop]
}

function useKnownFilesFromHardDisk() {
  return useJsonStore(knownFilesStore, 'reload-recents', true)
}

export function useKnownFilesInfo(initialFirebaseFileList) {
  const [filesByPosition, setFilesByPosition] = useState({})
  const [fileCount, setFileCount] = useState(0)

  const [firestoreFilesByPosition] = useKnownFilesFromFirebase(initialFirebaseFileList)
  const [hardDiskFilesByPosition] = useKnownFilesFromHardDisk()

  useEffect(() => {
    const newFilesByPosition = cloneDeep(hardDiskFilesByPosition)
    const maxId = Object.keys(hardDiskFilesByPosition).reduce(
      (max, next) => Math.max(max, next),
      Number.NEGATIVE_INFINITY
    )
    Object.values(firestoreFilesByPosition).forEach((value, index) => {
      newFilesByPosition[index + maxId + 1] = {
        ...value,
        path: `plottr://${value.id}`,
      }
    })
    if (!isEqual(filesByPosition, newFilesByPosition)) {
      setFilesByPosition(newFilesByPosition)
      setFileCount(Object.keys(newFilesByPosition).length)
    }
  }, [firestoreFilesByPosition, hardDiskFilesByPosition])

  const nop = () => {}
  return [filesByPosition, fileCount, nop, nop]
}

export function useTemplatesInfo() {
  return useJsonStore(templatesStore)
}

const indexById = (array) => {
  const indexed = {}
  array.forEach((x) => (indexed[x.id] = x))
  return indexed
}

export function useCustomTemplatesFromLocalStorage() {
  const [templates, setTemplates] = useState(indexById(allCustomTemplates()))

  useEffect(() => {
    const deleteTemplateListener = document.addEventListener('delete-template', () => {
      setTemplates(indexById(allCustomTemplates()))
    })
    const editTemplateListener = document.addEventListener('edit-template', () => {
      setTemplates(indexById(allCustomTemplates()))
    })
    const saveTemplateListener = document.addEventListener('save-template', () => {
      setTemplates(indexById(allCustomTemplates()))
    })
    return () => {
      document.removeEventListener('delete-template', deleteTemplateListener)
      document.removeEventListener('edit-template', editTemplateListener)
      document.removeEventListener('save-template', saveTemplateListener)
    }
  }, [])

  const nop = () => {}
  return [templates, templates.size, nop, nop]
}

export function useCustomTemplatesInfo() {
  return useJsonStore(customTemplatesStore)
}

export function useSettingsInfo() {
  const [info, size, saveInfoAtKey, saveAllInfo] = useJsonStore(SETTINGS, 'reload-options', true)
  const alsoAskMainToBroadcastUpdate =
    (f) =>
    (...args) => {
      ipcRenderer.send('broadcast-reload-options')
      f(...args)
    }
  return [
    info,
    size,
    alsoAskMainToBroadcastUpdate(saveInfoAtKey),
    alsoAskMainToBroadcastUpdate(saveAllInfo),
  ]
}

export function useExportConfigInfo() {
  exportConfigStore.store = merge(export_config, exportConfigStore.store)
  return useJsonStore(exportConfigStore)
}
