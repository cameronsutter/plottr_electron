import fs from 'fs'
import path from 'path'

const { readFile } = fs.promises

const SettingsModule = (userDataPath) => {
  const settingsFileName = process.env.NODE_ENV == 'development' ? 'config_dev.json' : 'config.json'

  const readSettings = () => {
    return readFile(path.join(userDataPath, settingsFileName))
  }

  return { readSettings }
}

export default SettingsModule
