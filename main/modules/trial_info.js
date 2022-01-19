import Store from 'electron-store'
const trialStore = new Store({ name: 'trial_info' })

function getTriaInfo() {
  return trialStore.get()
}

export { getTriaInfo }
