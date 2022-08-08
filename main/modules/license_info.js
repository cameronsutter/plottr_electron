import { whenClientIsReady } from '../../shared/socket-client/index'

function getLicenseInfo() {
  return whenClientIsReady(({ currentLicense }) => {
    return currentLicense()
  })
}

export { getLicenseInfo }
