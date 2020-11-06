import Store from 'electron-store'
import { useState, useEffect } from 'react'
import { TRIAL_INFO_PATH, USER_INFO_PATH, KNOWN_FILES_PATH, CUSTOM_TEMPLATES_PATH, TEMPLATES_PATH } from './config_paths'

const knownFilesPath = process.env.NODE_ENV == 'development' ? `${KNOWN_FILES_PATH}_dev` : KNOWN_FILES_PATH
const templatesPath = process.env.NODE_ENV == 'development' ? `${TEMPLATES_PATH}_dev` : TEMPLATES_PATH
const customTemplatesPath = process.env.NODE_ENV == 'development' ? `${CUSTOM_TEMPLATES_PATH}_dev` : CUSTOM_TEMPLATES_PATH

const trialStore = new Store({name: TRIAL_INFO_PATH})
const licenseStore = new Store({name: USER_INFO_PATH})
const knownFilesStore = new Store({name: knownFilesPath})
const templatesStore = new Store({name: templatesPath})
const customTemplatesStore = new Store({name: customTemplatesPath})

function useJsonStore (store) {
  const [info, setInfo] = useState({})
  useEffect(() => {
    setInfo(store.store)
    const unsubscribe = store.onDidAnyChange((newVal, oldVal) => setInfo(newVal))
    return () => unsubscribe()
  }, [])

  const saveInfo = (data) => {
    store.set(data)
    setInfo(data)
  }

  return [info, store.size, saveInfo]
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
