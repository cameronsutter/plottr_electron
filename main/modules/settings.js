import { whenClientIsReady } from '../../shared/socket-client/index'

const currentSettings = () => {
  return whenClientIsReady(({ currentAppSettings }) => {
    return currentAppSettings()
  })
}

export const saveAppSetting = (key, value) => {
  return whenClientIsReady(({ saveAppSetting }) => {
    return saveAppSetting(key, value)
  })
}

export default currentSettings
