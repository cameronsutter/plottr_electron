import Store from 'electron-store'
import { useState, useEffect } from 'react'
import { TRIAL_INFO_PATH, USER_INFO_PATH } from './config_paths'
const trialStore = new Store({name: TRIAL_INFO_PATH})
const licenseStore = new Store({name: USER_INFO_PATH})

// console.log(licenseStore)
// console.log(licenseStore.store)

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