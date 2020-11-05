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
  user: {}
}

const SETTINGS = new Store({defaults: defaultSettings, name: storePath})
export default SETTINGS