import electron from 'electron'
import path from 'path'

const app = electron.app || electron.remote.app

export const TRIAL_INFO_PATH = 'trial_info'
export const USER_INFO_PATH = 'license_info'
export const OPEN_FILES_PATH = 'open_files'
export const KNOWN_FILES_PATH = 'known_files'
export const TEMPLATES_MANIFEST_PATH = 'templates_manifest'
export const TEMPLATES_PATH = 'templates'
export const CUSTOM_TEMPLATES_PATH = 'custom_templates'
export const BACKUP_BASE_PATH = path.join(app.getPath('userData'), 'backups')
