const { app } = require('electron')
const path = require('path')

const TRIAL_INFO_PATH = 'trial_info'
const USER_INFO_PATH = 'user_info'
const RECENT_FILES_PATH = 'recentFiles'
const BACKUP_BASE_PATH = path.join(app.getPath('userData'), 'backups')

module.exports = { TRIAL_INFO_PATH, USER_INFO_PATH, RECENT_FILES_PATH, BACKUP_BASE_PATH }