import Store from 'electron-store'
const storePath = process.env.NODE_ENV == 'development' ? 'config_dev' : 'config'

const defaultSettings = {
  showTheTour: false,
  backup: true,
  allowPrerelease: false,
  forceDevTools: false,
  trialMode: false,
  canGetUpdates: false,
  isInGracePeriod: false,
  gracePeriodEnd: 0,
  canEdit: true,
  canExport: true,
  user: {
    autoUpdate: true,
    autoSave: true,
    backupDays: 30,
    backupLocation: 'default',
    darkModeAlways: false,
  }
}

const SETTINGS = new Store({defaults: defaultSettings, name: storePath})
export default SETTINGS