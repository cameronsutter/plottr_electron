import Store from '../lib/store'

const licenseStore = new Store({ name: 'license_info' })

function getLicenseInfo() {
  return licenseStore.get()
}

export { getLicenseInfo }
