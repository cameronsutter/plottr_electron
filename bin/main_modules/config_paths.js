const { app } = require('electron')
const path = require('path')

const TRIAL_INFO_PATH = 'trial_info'
const USER_INFO_PATH = 'license_info'
const OPEN_FILES_PATH = 'open_files'
const KNOWN_FILES_PATH = 'known_files'
const TEMPLATES_MANIFEST_PATH = 'templates_manifest'
const TEMPLATES_PATH = 'templates'
const CUSTOM_TEMPLATES_PATH = 'custom_templates'
const BACKUP_BASE_PATH = path.join(app.getPath('userData'), 'backups')

module.exports = {
  TRIAL_INFO_PATH,
  USER_INFO_PATH,
  OPEN_FILES_PATH,
  KNOWN_FILES_PATH,
  BACKUP_BASE_PATH,
  TEMPLATES_MANIFEST_PATH,
  TEMPLATES_PATH,
  CUSTOM_TEMPLATES_PATH,
}
