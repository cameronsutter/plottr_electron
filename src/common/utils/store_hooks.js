import Store from 'electron-store'
import { useState, useEffect } from 'react'
import { TRIAL_INFO_PATH, USER_INFO_PATH, KNOWN_FILES_PATH, CUSTOM_TEMPLATES_PATH, TEMPLATES_PATH, TMP_PATH } from './config_paths'
import SETTINGS from './settings'

const knownFilesPath = process.env.NODE_ENV == 'development' ? `${KNOWN_FILES_PATH}_dev` : KNOWN_FILES_PATH
const templatesPath = process.env.NODE_ENV == 'development' ? `${TEMPLATES_PATH}_dev` : TEMPLATES_PATH
const customTemplatesPath = process.env.NODE_ENV == 'development' ? `${CUSTOM_TEMPLATES_PATH}_dev` : CUSTOM_TEMPLATES_PATH
const tempPath = process.env.NODE_ENV == 'development' ? `${TMP_PATH}_dev` : TMP_PATH

export const trialStore = new Store({name: TRIAL_INFO_PATH, watch: true})
export const licenseStore = new Store({name: USER_INFO_PATH, watch: true})
export const knownFilesStore = new Store({name: knownFilesPath, watch: true})
export const templatesStore = new Store({name: templatesPath, watch: true})
export const customTemplatesStore = new Store({name: customTemplatesPath, watch: true})
export const tempFilesStore = new Store({name: tempPath, cwd: 'tmp', watch: true})

function useJsonStore (store) {
  const [info, setInfo] = useState(store.store)
  const [size, setSize] = useState(store.size)
  useEffect(() => {
    const unsubscribe = store.onDidAnyChange((newVal, oldVal) => {
      setInfo(newVal)
      setSize(Object.keys(newVal).length)
    })
    return () => unsubscribe()
  }, [])

  const saveInfo = (key, data) => {
    store.set(key, data)
    setInfo(store.store)
    setSize(store.size)
  }

  return [info, size, saveInfo]
}

export function useTrialInfo () {
  return useJsonStore(trialStore)
}

export function useLicenseInfo () {
  return useJsonStore(licenseStore)
}

export function useKnownFilesInfo () {
  return useJsonStore(knownFilesStore)
}

export function useTemplatesInfo () {
  return useJsonStore(templatesStore)
}

export function useCustomTemplatesInfo () {
  return useJsonStore(customTemplatesStore)
}

export function useSettingsInfo () {
  return useJsonStore(SETTINGS)
}
