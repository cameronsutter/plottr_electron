import { ipcRenderer } from 'electron'
import { useState, useEffect } from 'react'
import { cloneDeep, isEqual } from 'lodash'
import { trialStore, licenseStore, knownFilesStore } from '../../file-system/stores'
import export_config from '../../exporter/default_config'

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
        if (!isEqual(info, store.get())) setInfo(store.get())
        if (!isEqual(size, store.size)) setSize(store.size)
      })
    }

    return () => ipcRenderer.removeAllListeners(ipcEventToReloadOn)
  }, [])
  useEffect(() => {
    let timeout
    if (checksOften) {
      timeout = setTimeout(() => {
        if (!isEqual(info, store.get())) setInfo(store.get())
        if (!isEqual(size, store.size)) setSize(store.size)
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

  const deleteKey = (key) => {
    store.delete(key)
    setInfo(store.store)
    setSize(store.size)
  }

  return [info, size, saveInfoAtKey, saveAllInfo, deleteKey]
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

function useKnownFilesFromHardDisk(checkOften = true) {
  return useJsonStore(knownFilesStore, 'reload-recents', checkOften)
}

export function useKnownFilesInfo(userId, initialFirebaseFileList, checkOften = true) {
  const [firestoreFilesByPosition] = useKnownFilesFromFirebase(initialFirebaseFileList)
  const [hardDiskFilesByPosition] = useKnownFilesFromHardDisk(checkOften)

  const computeNewLists = () => {
    const newFilesByPosition = userId ? {} : cloneDeep(hardDiskFilesByPosition)
    const maxId = userId
      ? 0
      : Object.keys(hardDiskFilesByPosition).reduce(
          (max, next) => Math.max(max, next),
          Number.NEGATIVE_INFINITY
        )
    Object.values(firestoreFilesByPosition).forEach((value, index) => {
      newFilesByPosition[index + maxId + 1] = {
        ...value,
        path: `plottr://${value.id}`,
      }
    })
    return { newFilesByPosition, newFileCount: Object.keys(newFilesByPosition).length }
  }

  const { newFilesByPosition, newFileCount } = computeNewLists()

  const [filesByPosition, setFilesByPosition] = useState(newFilesByPosition)
  const [fileCount, setFileCount] = useState(newFileCount)

  useEffect(() => {
    const { newFilesByPosition, newFileCount } = computeNewLists()
    if (!isEqual(filesByPosition, newFilesByPosition)) {
      setFilesByPosition(newFilesByPosition)
      setFileCount(newFileCount)
    }
  }, [firestoreFilesByPosition, hardDiskFilesByPosition])

  const nop = () => {}
  return [filesByPosition, fileCount, nop, nop]
}
