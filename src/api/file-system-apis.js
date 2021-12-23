import { trialStore } from '../file-system/stores'

export const listenToTrialChanges = trialStore.onDidAnyChange.bind(trialStore)
export const currentTrialValue = () => trialStore.store
