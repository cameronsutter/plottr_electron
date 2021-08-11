const Store = require('electron-store')
const trialStore = new Store({ name: 'trial_info' })

function getTriaInfo() {
  return trialStore.get()
}

module.exports = { getTriaInfo }
