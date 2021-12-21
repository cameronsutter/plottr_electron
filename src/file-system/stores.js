import Store from 'electron-store'
import export_config from '../exporter/default_config'
import defaultSettings from '../../shared/default_settings'
import {
  TRIAL_INFO_PATH,
  USER_INFO_PATH,
  KNOWN_FILES_PATH,
  CUSTOM_TEMPLATES_PATH,
  TEMPLATES_PATH,
  TEMPLATES_MANIFEST_PATH,
  EXPORT_CONFIG_PATH,
} from './config_paths'

const knownFilesPath =
  process.env.NODE_ENV == 'development' ? `${KNOWN_FILES_PATH}_dev` : KNOWN_FILES_PATH
const templatesPath =
  process.env.NODE_ENV == 'development' ? `${TEMPLATES_PATH}_dev` : TEMPLATES_PATH
const customTemplatesPath =
  process.env.NODE_ENV == 'development' ? `${CUSTOM_TEMPLATES_PATH}_dev` : CUSTOM_TEMPLATES_PATH
const manifestPath =
  process.env.NODE_ENV == 'development' ? `${TEMPLATES_MANIFEST_PATH}_dev` : TEMPLATES_MANIFEST_PATH
const exportPath =
  process.env.NODE_ENV == 'development' ? `${EXPORT_CONFIG_PATH}_dev` : EXPORT_CONFIG_PATH

export const trialStore = new Store({ name: TRIAL_INFO_PATH, watch: true })
export const licenseStore = new Store({ name: USER_INFO_PATH, watch: true })
export const knownFilesStore = new Store({ name: knownFilesPath, watch: true })
export const templatesStore = new Store({ name: templatesPath, watch: true })
export const customTemplatesStore = new Store({ name: customTemplatesPath, watch: true })
export const exportConfigStore = new Store({
  name: exportPath,
  watch: true,
  defaults: export_config,
})
export const manifestStore = new Store({ name: manifestPath })
export const USER = new Store({ name: USER_INFO_PATH })

const settingsStorePath = process.env.NODE_ENV == 'development' ? 'config_dev' : 'config'
export const SETTINGS = new Store({ defaults: defaultSettings, name: settingsStorePath })
