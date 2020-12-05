const Store = require('electron-store')
const licenseStore = new Store({name: 'license_info'})

function getLicenseInfo () {
  return licenseStore.get()
}

module.exports = { getLicenseInfo }
